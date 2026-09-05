/**
 * Size detector — extracts bicycle wheel/frame sizes from text.
 * Returns null if no size can be confidently detected. Never guesses.
 */

export interface SizeDetectionResult {
  size: string | null;
  confidence: number; // 0-100
}

// Ordered by specificity (more specific patterns first)
const WHEEL_SIZE_PATTERNS: { pattern: RegExp; label: string; confidence: number }[] = [
  { pattern: /\b29["\s]?[Tt](?:yre|ire)?\b/,      label: "29T",   confidence: 95 },
  { pattern: /\b27\.5["\s]?[Tt](?:yre|ire)?\b/,   label: "27.5T", confidence: 95 },
  { pattern: /\b26["\s]?[Tt](?:yre|ire)?\b/,       label: "26T",   confidence: 95 },
  { pattern: /\b24["\s]?[Tt](?:yre|ire)?\b/,       label: "24T",   confidence: 95 },
  { pattern: /\b20["\s]?[Tt](?:yre|ire)?\b/,       label: "20T",   confidence: 90 },
  { pattern: /\b16["\s]?[Tt](?:yre|ire)?\b/,       label: "16T",   confidence: 90 },
  { pattern: /\b700[cC]\b/,                          label: "700C",  confidence: 95 },
  { pattern: /\b29(?:er|\")\b/i,                    label: "29T",   confidence: 85 },
  { pattern: /\b27\.5(?:er|\")\b/i,                 label: "27.5T", confidence: 85 },
  { pattern: /\b26(?:er|\")(?:\s*wheel)?\b/i,       label: "26T",   confidence: 85 },
  { pattern: /\bwheel[:\s]+?29\b/i,                 label: "29T",   confidence: 80 },
  { pattern: /\bwheel[:\s]+?27\.5\b/i,              label: "27.5T", confidence: 80 },
  { pattern: /\bwheel[:\s]+?26\b/i,                 label: "26T",   confidence: 80 },
  { pattern: /\bwheel[:\s]+?24\b/i,                 label: "24T",   confidence: 80 },
];

const FRAME_SIZE_PATTERNS: { pattern: RegExp; label: string; confidence: number }[] = [
  { pattern: /\bX[Ll]\b/,        label: "XL", confidence: 75 },
  { pattern: /\bExtra[- ]Large\b/i, label: "XL", confidence: 80 },
  { pattern: /\b\bLarge\b/i,     label: "L",  confidence: 70 },
  { pattern: /\bMedium\b/i,      label: "M",  confidence: 70 },
  { pattern: /\bSmall\b/i,       label: "S",  confidence: 70 },
  { pattern: /\bframe[:\s]+?XL\b/i, label: "XL", confidence: 80 },
  { pattern: /\bframe[:\s]+?L\b/i,  label: "L",  confidence: 80 },
  { pattern: /\bframe[:\s]+?M\b/i,  label: "M",  confidence: 80 },
  { pattern: /\bframe[:\s]+?S\b/i,  label: "S",  confidence: 80 },
];

export function detectSize(text: string): SizeDetectionResult {
  if (!text || text.trim().length === 0) {
    return { size: null, confidence: 0 };
  }

  const normalizedText = text.replace(/\n/g, " ").replace(/\s+/g, " ");

  // Try wheel sizes first (higher priority for bicycles)
  for (const { pattern, label, confidence } of WHEEL_SIZE_PATTERNS) {
    if (pattern.test(normalizedText)) {
      return { size: label, confidence };
    }
  }

  // Try frame sizes
  for (const { pattern, label, confidence } of FRAME_SIZE_PATTERNS) {
    if (pattern.test(normalizedText)) {
      return { size: label, confidence };
    }
  }

  return { size: null, confidence: 0 };
}
