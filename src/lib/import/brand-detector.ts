/**
 * Brand detector — determines bicycle brand using a priority system:
 * 1. Admin-assigned brand for the file (100% confidence)
 * 2. Text/name match against existing DB brands
 * 3. Filename-based detection
 */

import type { IBrand } from "@/models/Brand";

export interface BrandDetectionResult {
  brand: IBrand | null;
  brandRaw: string | null; // raw detected text if no DB match
  confidence: number;       // 0-100
  needsReview: boolean;
  method: "assigned" | "text_match" | "filename" | "none";
}

interface SimpleBrand {
  _id: string;
  name: string;
  slug: string;
}

/**
 * Detect brand from text and filename.
 * @param text Full extracted text from PDF/page
 * @param filename Original PDF filename
 * @param availableBrands List of existing brands from DB
 * @param assignedBrandId Optional brand pre-assigned by admin for this file
 */
export function detectBrand(
  text: string,
  filename: string,
  availableBrands: SimpleBrand[],
  assignedBrand?: SimpleBrand | null
): BrandDetectionResult {
  // PRIORITY 1: Admin-assigned brand
  if (assignedBrand) {
    return {
      brand: assignedBrand as unknown as IBrand,
      brandRaw: assignedBrand.name,
      confidence: 100,
      needsReview: false,
      method: "assigned",
    };
  }

  const normalizedText = (text || "").toLowerCase();
  const normalizedFilename = (filename || "").toLowerCase();

  // PRIORITY 2: Match against known brands in text (case-insensitive, whole word)
  const textMatches: { brand: SimpleBrand; confidence: number }[] = [];
  for (const brand of availableBrands) {
    const brandName = brand.name.toLowerCase();
    // Escape special regex characters in brand name
    const escaped = brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wordBoundaryRegex = new RegExp(`\\b${escaped}\\b`, "i");
    if (wordBoundaryRegex.test(normalizedText)) {
      // Higher confidence if it appears multiple times
      const occurrences = (normalizedText.match(new RegExp(escaped, "gi")) || []).length;
      const confidence = Math.min(95, 75 + occurrences * 5);
      textMatches.push({ brand, confidence });
    }
  }

  // Use the brand that appears most (highest confidence) in text
  if (textMatches.length > 0) {
    textMatches.sort((a, b) => b.confidence - a.confidence);
    const best = textMatches[0];
    if (!best) {
      return { brand: null, brandRaw: null, confidence: 0, needsReview: true, method: "none" };
    }
    return {
      brand: best.brand as unknown as IBrand,
      brandRaw: best.brand.name,
      confidence: best.confidence,
      needsReview: best.confidence < 80,
      method: "text_match",
    };
  }

  // PRIORITY 3: Filename-based detection
  for (const brand of availableBrands) {
    const brandName = brand.name.toLowerCase();
    const escaped = brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(escaped).test(normalizedFilename)) {
      return {
        brand: brand as unknown as IBrand,
        brandRaw: brand.name,
        confidence: 70,
        needsReview: true, // always review filename-derived brands
        method: "filename",
      };
    }
  }

  // PRIORITY 3b: Try to extract a potential brand name from filename
  // e.g. "Doodle_Catalogue.pdf" → "Doodle"
  const filenameWithoutExt = filename.replace(/\.(pdf|PDF)$/, "");
  const filenameWords = filenameWithoutExt
    .replace(/[_\-\.]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !/catalogue|catalog|products?|list|2024|2025|2026/i.test(w));

  if (filenameWords.length > 0) {
    return {
      brand: null,
      brandRaw: filenameWords[0] || null,
      confidence: 40,
      needsReview: true,
      method: "filename",
    };
  }

  return {
    brand: null,
    brandRaw: null,
    confidence: 0,
    needsReview: true,
    method: "none",
  };
}
