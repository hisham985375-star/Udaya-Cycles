/**
 * Background Removal Service — abstracted provider architecture.
 *
 * Providers:
 *  - "remove_bg"   : remove.bg REST API  (requires REMOVE_BG_API_KEY)
 *  - "local"       : local sharp-based simple bg removal (fallback, no deps)
 *
 * Configure via env:
 *   BG_REMOVAL_PROVIDER=remove_bg | local
 *   REMOVE_BG_API_KEY=your_key
 */

import sharp from "sharp";

export interface BackgroundRemovalResult {
  buffer: Buffer;
  width: number;
  height: number;
  hasTransparency: boolean;
  provider: string;
  qualityIssues: string[];
}

// ──────────────────────────────────────────────
// Provider: remove.bg API
// ──────────────────────────────────────────────
async function removeBackgroundViaRemoveBg(
  imageBuffer: Buffer
): Promise<BackgroundRemovalResult> {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) throw new Error("REMOVE_BG_API_KEY is not set");

  const FormData = (await import("form-data")).default;
  const form = new FormData();
  form.append("image_file", imageBuffer, {
    filename: "image.png",
    contentType: "image/png",
  });
  form.append("size", "auto");

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      ...form.getHeaders(),
    },
    body: form.getBuffer() as unknown as BodyInit,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`remove.bg API error: ${response.status} — ${err}`);
  }

  const resultBuffer = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(resultBuffer).metadata();

  return {
    buffer: resultBuffer,
    width: metadata.width || 0,
    height: metadata.height || 0,
    hasTransparency: true,
    provider: "remove_bg",
    qualityIssues: validateImageQuality(resultBuffer, metadata),
  };
}

// ──────────────────────────────────────────────
// Provider: Local sharp-based (simple, free)
// Uses alpha channel trick — not AI-based.
// Works best on images with solid/light backgrounds.
// ──────────────────────────────────────────────
async function removeBackgroundLocally(
  imageBuffer: Buffer
): Promise<BackgroundRemovalResult> {
  // Convert to PNG with alpha channel
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  // Convert to raw RGBA to process pixels
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels; // should be 4 (RGBA)

  // Sample the corner pixels to determine background color
  const cornerPixels: number[][] = [];
  const samplePoints = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [0, Math.floor(height / 2)],
  ];

  for (const [sx, sy] of samplePoints) {
    const x = sx ?? 0;
    const y = sy ?? 0;
    const idx = (y * width + x) * channels;
    if (idx + 2 < data.length) {
      cornerPixels.push([data[idx] ?? 0, data[idx + 1] ?? 0, data[idx + 2] ?? 0]);
    }
  }

  // Calculate average background color
  const avgBg = cornerPixels.reduce(
    (acc: [number, number, number], px) => 
      [(acc[0] ?? 0) + (px[0] ?? 0), (acc[1] ?? 0) + (px[1] ?? 0), (acc[2] ?? 0) + (px[2] ?? 0)] as [number, number, number],
    [0, 0, 0] as [number, number, number]
  ).map(v => Math.round(v / cornerPixels.length));

  const TOLERANCE = 35; // color distance tolerance for background detection

  function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  }

  // Make near-background-colored pixels transparent
  const outputData = Buffer.from(data);
  let transparentPixels = 0;
  const totalPixels = width * height;
  const avgBg0 = avgBg[0] ?? 0;
  const avgBg1 = avgBg[1] ?? 0;
  const avgBg2 = avgBg[2] ?? 0;

  for (let i = 0; i < outputData.length; i += channels) {
    const r = outputData[i] ?? 0;
    const g = outputData[i + 1] ?? 0;
    const b = outputData[i + 2] ?? 0;
    const dist = colorDistance(r, g, b, avgBg0, avgBg1, avgBg2);

    if (dist < TOLERANCE) {
      outputData[i + 3] = 0; // fully transparent
      transparentPixels++;
    }
  }

  const transparencyRatio = transparentPixels / totalPixels;

  // If too much or too little was removed, flag for review
  const qualityIssues: string[] = [];
  if (transparencyRatio < 0.05) qualityIssues.push("minimal_background_removed");
  if (transparencyRatio > 0.85) qualityIssues.push("excessive_removal_possible_crop");

  const resultBuffer = await sharp(outputData, {
    raw: { width, height, channels },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return {
    buffer: resultBuffer,
    width,
    height,
    hasTransparency: true,
    provider: "local",
    qualityIssues,
  };
}

// ──────────────────────────────────────────────
// Image quality validation
// ──────────────────────────────────────────────
function validateImageQuality(
  _buffer: Buffer,
  metadata: sharp.Metadata
): string[] {
  const issues: string[] = [];

  if (!metadata.width || !metadata.height) {
    issues.push("invalid_dimensions");
    return issues;
  }

  // Too small
  if (metadata.width < 200 || metadata.height < 200) {
    issues.push("low_resolution");
  }

  // Unusual aspect ratio (may indicate incorrect crop)
  const ratio = metadata.width / metadata.height;
  if (ratio > 4 || ratio < 0.25) {
    issues.push("unusual_aspect_ratio");
  }

  return issues;
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────
export async function removeBackground(
  imageBuffer: Buffer
): Promise<BackgroundRemovalResult> {
  const provider = process.env.BG_REMOVAL_PROVIDER || "local";

  try {
    if (provider === "remove_bg") {
      return await removeBackgroundViaRemoveBg(imageBuffer);
    }
    return await removeBackgroundLocally(imageBuffer);
  } catch (error) {
    console.error(`[BG_REMOVAL] Error with provider "${provider}":`, error);

    // If remove.bg fails, fall back to local
    if (provider === "remove_bg") {
      console.warn("[BG_REMOVAL] Falling back to local provider");
      return await removeBackgroundLocally(imageBuffer);
    }
    throw error;
  }
}

/**
 * Ensure image is PNG format (convert if needed)
 */
export async function ensurePng(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  if (metadata.format === "png") return imageBuffer;
  return sharp(imageBuffer).png({ compressionLevel: 9 }).toBuffer();
}

/**
 * Create a thumbnail version for the review table
 */
export async function createThumbnail(
  imageBuffer: Buffer,
  size = 150
): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(size, size, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
}
