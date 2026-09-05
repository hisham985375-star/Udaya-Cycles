/**
 * PDF Processor — extracts text, images, and product information from PDF files.
 *
 * Strategy:
 * 1. Extract all text from the PDF (pdf-parse)
 * 2. Extract embedded images where available (pdfjs-dist)
 * 3. For pages without embedded images, render to PNG (pdfjs-dist canvas)
 * 4. Detect product sections from text structure
 * 5. Return structured ProductCandidate[] for further processing
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { detectSize } from "./size-detector";
import { detectBrand } from "./brand-detector";
import { detectCategory } from "./category-detector";

export interface ProductCandidate {
  pageNumber: number;
  rawText: string;
  productName: string | null;
  nameConfidence: number;
  imageBuffer: Buffer | null;
  imageExtractionMethod: "embedded" | "rendered" | "none";
  imageConfidence: number;
  size: string | null;
  sizeConfidence: number;
  description: string | null;
  specifications: { label: string; value: string }[];
  rawPrice: string | null;
}

export interface PDFExtractionResult {
  pageCount: number;
  fullText: string;
  products: ProductCandidate[];
  errors: string[];
}

// ──────────────────────────────────────────────────────────────
// Product name extraction heuristics
// ──────────────────────────────────────────────────────────────
function extractProductName(text: string): { name: string | null; confidence: number } {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Heuristic 1: Short lines (3-60 chars) near top that aren't all-caps section headers
  // and aren't prices or measurements
  const candidateLines: { line: string; score: number }[] = [];

  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i];
    if (line === undefined) continue;

    // Skip if it looks like a price
    if (/^[₹$€£]?\s*[\d,]+(\.\d{2})?$/.test(line)) continue;
    // Skip page numbers
    if (/^\d+$/.test(line)) continue;
    // Skip very short lines
    if (line.length < 3) continue;
    // Skip very long lines (likely descriptions)
    if (line.length > 80) continue;
    // Skip pure measurement lines
    if (/^\d+[TtCc"']\s*$/.test(line)) continue;
    // Skip section headers like "SPECIFICATIONS", "FEATURES" etc
    if (/^(SPECIFICATIONS?|FEATURES?|DESCRIPTION|OVERVIEW|DETAILS?|CONTENTS?)$/i.test(line)) continue;

    let score = 50;

    // Boost: Title Case or ALL CAPS (common for product names)
    if (/^[A-Z][a-zA-Z\s\d\-]+$/.test(line)) score += 15;
    if (/^[A-Z\s\d\-]+$/.test(line) && line.length > 4) score += 10;

    // Boost: Contains typical bicycle brand/model indicators
    if (/\b(Pro|Elite|Sport|MTB|Trail|Rock|Mountain|Cross|City|Urban|Kids|Lady|Electric|E-|EV|Phantom|Raptor|Storm|Thunder|Flash|Blaze|Viper|Hawk|Eagle|Falcon|Ranger)\b/i.test(line)) {
      score += 20;
    }

    // Boost: Early position
    if (i < 5) score += 15;
    if (i < 3) score += 10;

    // Penalty: Contains colons (likely spec line)
    if (line.includes(":")) score -= 20;

    // Penalty: Mostly digits
    if (/^\d/.test(line)) score -= 15;

    if (score > 40) {
      candidateLines.push({ line, score });
    }
  }

  if (candidateLines.length === 0) {
    return { name: null, confidence: 0 };
  }

  candidateLines.sort((a, b) => b.score - a.score);
  const best = candidateLines[0];
  if (!best) {
    return { name: null, confidence: 0 };
  }

  return {
    name: best.line,
    confidence: Math.min(best.score, 98),
  };
}

// ──────────────────────────────────────────────────────────────
// Price extraction
// ──────────────────────────────────────────────────────────────
function extractPrice(text: string): string | null {
  const pricePatterns = [
    /(?:MRP|Price|₹|Rs\.?)\s*:?\s*([\d,]+(?:\.\d{2})?)/i,
    /₹\s*([\d,]+)/,
    /Rs\.?\s*([\d,]+)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].replace(/,/g, "");
  }
  return null;
}

// ──────────────────────────────────────────────────────────────
// Specification extraction
// ──────────────────────────────────────────────────────────────
function extractSpecifications(text: string): { label: string; value: string }[] {
  const specs: { label: string; value: string }[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    // Pattern: "Label: Value" or "Label - Value"
    const colonMatch = line.match(/^([A-Za-z\s\/]{3,30})\s*:\s*(.+)$/);
    if (colonMatch && colonMatch[1] && colonMatch[2]) {
      const label = colonMatch[1].trim();
      const value = colonMatch[2].trim();
      // Filter out non-spec lines
      if (label.length > 2 && value.length > 0 && value.length < 100) {
        specs.push({ label, value });
      }
    }
  }

  return specs.slice(0, 20); // Cap at 20 specs
}

// ──────────────────────────────────────────────────────────────
// Description extraction — first paragraph-like block after name
// ──────────────────────────────────────────────────────────────
function extractDescription(text: string, productName: string | null): string | null {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Find long-form text (likely description paragraphs)
  const descLines: string[] = [];
  let collecting = false;
  let nameFound = !productName; // if no name, start collecting from beginning

  for (const line of lines) {
    if (!nameFound && productName && line.toLowerCase().includes(productName.toLowerCase())) {
      nameFound = true;
      continue;
    }
    if (nameFound && line.length > 40 && !line.match(/^[A-Z\s]+$/) && !line.includes(":")) {
      collecting = true;
      descLines.push(line);
    } else if (collecting && line.length > 20) {
      descLines.push(line);
    }
    if (descLines.length >= 4) break;
  }

  if (descLines.length === 0) return null;
  return descLines.join(" ").substring(0, 800);
}

// ──────────────────────────────────────────────────────────────
// Main PDF extraction function
// ──────────────────────────────────────────────────────────────
export async function extractFromPDF(
  filePath: string,
  availableBrands: { _id: string; name: string; slug: string }[] = [],
  availableCategories: { _id: string; name: string; slug: string }[] = [],
  categoryMappingRules: { keyword: string; categoryId: string }[] = [],
  assignedBrand?: { _id: string; name: string; slug: string } | null
): Promise<PDFExtractionResult> {
  const errors: string[] = [];
  const products: ProductCandidate[] = [];

  let pdfParse: (buffer: Buffer) => Promise<{ numpages: number; text: string; info?: Record<string, unknown> }>;
  try {
    const req = typeof process !== 'undefined' ? eval('require') : require;
    pdfParse = req("pdf-parse");
  } catch {
    throw new Error("pdf-parse module not available. Run: npm install pdf-parse");
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file not found: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);

  // Validate it's a PDF
  const header = fileBuffer.slice(0, 5).toString("ascii");
  if (!header.startsWith("%PDF")) {
    throw new Error("File does not appear to be a valid PDF (missing %PDF header)");
  }

  let pdfData: { numpages: number; text: string };
  try {
    pdfData = await pdfParse(fileBuffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("password")) {
      throw new Error("PDF is password protected and cannot be processed");
    }
    throw new Error(`Failed to parse PDF: ${msg}`);
  }

  const { numpages, text: fullText } = pdfData;

  if (!fullText || fullText.trim().length < 10) {
    errors.push("PDF contains minimal or no extractable text — this may be a scanned image PDF");
  }

  // Split text into page-like sections for analysis
  // pdf-parse returns all text; we'll try to detect product sections using heuristics
  const textSections = splitIntoProductSections(fullText, numpages);

  for (let i = 0; i < textSections.length; i++) {
    const section = textSections[i];
    if (section === undefined) continue;
    
    const pageNum = Math.floor((i / textSections.length) * numpages) + 1;

    // Skip sections that are clearly not products (too short, all headers, etc.)
    if (section.trim().length < 30) continue;

    // Extract product info from this section
    const { name, confidence: nameConf } = extractProductName(section);
    const sizeResult = detectSize(section);
    const rawPrice = extractPrice(section);
    const specs = extractSpecifications(section);
    const desc = extractDescription(section, name);

    // Try to extract/render image for this section
    let imageBuffer: Buffer | null = null;
    let imageExtractionMethod: "embedded" | "rendered" | "none" = "none";
    let imageConfidence = 0;

    // Attempt page rendering
    try {
      const rendered = await renderPDFPageToImage(fileBuffer, pageNum);
      if (rendered) {
        imageBuffer = rendered;
        imageExtractionMethod = "rendered";
        imageConfidence = 60; // Rendered pages are lower confidence (full page, not cropped)
      }
    } catch (imgErr) {
      const errMsg = imgErr instanceof Error ? imgErr.message : String(imgErr);
      errors.push(`Page ${pageNum}: Image render failed — ${errMsg}`);
    }

    const candidate: ProductCandidate = {
      pageNumber: pageNum,
      rawText: section,
      productName: name,
      nameConfidence: nameConf,
      imageBuffer,
      imageExtractionMethod,
      imageConfidence,
      size: sizeResult.size,
      sizeConfidence: sizeResult.confidence,
      description: desc,
      specifications: specs,
      rawPrice,
    };

    products.push(candidate);
  }

  return {
    pageCount: numpages,
    fullText,
    products,
    errors,
  };
}

// ──────────────────────────────────────────────────────────────
// Split text into product sections using heuristics
// ──────────────────────────────────────────────────────────────
function splitIntoProductSections(text: string, numpages: number): string[] {
  // Strategy: Look for patterns that typically indicate a new product
  // such as lines followed by model names, page breaks, etc.

  const sections: string[] = [];

  // Try splitting by form feed characters (true page breaks from PDF)
  const pageBreakParts = text.split(/\f/);

  if (pageBreakParts.length > 1 && pageBreakParts.length <= numpages * 2) {
    // We have page-level splits — use them
    for (const part of pageBreakParts) {
      const trimmed = part.trim();
      if (trimmed.length < 20) continue;

      // A page might have multiple products — try to split by product patterns
      const subSections = splitPageIntoProducts(trimmed);
      sections.push(...subSections);
    }
  } else {
    // No clear page breaks — use heuristic line analysis
    // Split on repeated patterns that suggest new products
    const lines = text.split("\n");
    let currentSection: string[] = [];
    let consecutiveShortLines = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      currentSection.push(trimmed);

      if (trimmed.length < 5) {
        consecutiveShortLines++;
      } else {
        consecutiveShortLines = 0;
      }

      // Start new section after multiple blank lines (likely page/product break)
      if (consecutiveShortLines >= 3 && currentSection.join("").trim().length > 50) {
        sections.push(currentSection.join("\n"));
        currentSection = [];
        consecutiveShortLines = 0;
      }
    }

    if (currentSection.join("").trim().length > 30) {
      sections.push(currentSection.join("\n"));
    }
  }

  // If we ended up with nothing or 1 massive section, just use the whole text
  if (sections.length === 0) {
    sections.push(text);
  }

  // Cap at reasonable number of sections per page
  const maxSections = numpages * 8;
  return sections.slice(0, maxSections);
}

function splitPageIntoProducts(pageText: string): string[] {
  // Look for patterns that signal a new product within a page
  const productStartPatterns = [
    /^(?:[A-Z][a-zA-Z\s\d\-\.]{3,40})$/m, // Title case or ALL CAPS product name
  ];

  const lines = pageText.split("\n");
  const sections: string[] = [];
  let currentSection: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (rawLine === undefined) continue;
    
    const line = rawLine.trim();
    const isProductStart =
      i > 0 &&
      line.length > 4 &&
      line.length < 60 &&
      productStartPatterns.some((p) => p.test(line)) &&
      currentSection.join("").trim().length > 50;

    if (isProductStart) {
      sections.push(currentSection.join("\n"));
      currentSection = [line];
    } else {
      currentSection.push(line);
    }
  }

  if (currentSection.join("").trim().length > 20) {
    sections.push(currentSection.join("\n"));
  }

  return sections.filter((s) => s.trim().length > 20);
}

// ──────────────────────────────────────────────────────────────
// PDF Page Rendering using pdfjs-dist
// ──────────────────────────────────────────────────────────────
async function renderPDFPageToImage(
  pdfBuffer: Buffer,
  pageNumber: number
): Promise<Buffer | null> {
  try {
    // Use sharp to create a representative image
    // Hide require from bundler to prevent Vercel build crash
    const req = typeof process !== 'undefined' ? eval('require') : require;
    const pdfjsLib = req("pdfjs-dist/legacy/build/pdf.js");

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      disableFontFace: true,
      verbosity: 0,
    });

    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;
    const pageNum = Math.min(pageNumber, totalPages);

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for quality

    // Try to use canvas
    let canvas;
    try {
      const req = typeof process !== 'undefined' ? eval('require') : require;
      const { createCanvas } = req("canvas");
      canvas = createCanvas(viewport.width, viewport.height);
    } catch {
      // canvas not available — return null
      console.warn("[PDF_RENDER] canvas package not installed, skipping page render");
      return null;
    }

    const context = canvas.getContext("2d");
    const renderContext = {
      canvasContext: context,
      viewport,
    };

    await page.render(renderContext).promise;

    const pngBuffer = canvas.toBuffer("image/png");
    return pngBuffer;
  } catch (err) {
    console.warn(`[PDF_RENDER] Page ${pageNumber} render failed:`, err);
    return null;
  }
}

// ──────────────────────────────────────────────────────────────
// Create upload directory if it doesn't exist
// ──────────────────────────────────────────────────────────────
export function getImportUploadDir(): string {
  const uploadDir = process.env.IMPORT_UPLOAD_DIR || path.join(process.cwd(), "tmp", "imports");
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch {}
  return uploadDir;
}

export function getImagesDir(): string {
  const imagesDir = path.join(process.cwd(), "tmp", "import-images");
  try {
    fs.mkdirSync(imagesDir, { recursive: true });
  } catch {}
  return imagesDir;
}
