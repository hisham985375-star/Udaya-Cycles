/**
 * Category detector — maps catalog text/keywords to existing DB categories.
 * Uses admin-configurable CategoryMapping rules from the database.
 */

import type { ICategory } from "@/models/Category";

export interface CategoryDetectionResult {
  category: ICategory | null;
  categoryRaw: string | null;
  confidence: number; // 0-100
  needsReview: boolean;
}

interface SimpleCategory {
  _id: string;
  name: string;
  slug: string;
}

interface SimpleMappingRule {
  keyword: string;
  categoryId: string;
}

/**
 * Detect category from text using active mapping rules.
 * @param text Full extracted text from the page/product
 * @param mappingRules Active keyword→category rules from DB
 * @param availableCategories All available categories for lookup
 */
export function detectCategory(
  text: string,
  mappingRules: SimpleMappingRule[],
  availableCategories: SimpleCategory[]
): CategoryDetectionResult {
  if (!text || text.trim().length === 0) {
    return { category: null, categoryRaw: null, confidence: 0, needsReview: true };
  }

  const normalizedText = text.replace(/\n/g, " ").replace(/\s+/g, " ").toLowerCase();

  // Build a lookup map for quick category resolution
  const categoryMap = new Map<string, SimpleCategory>();
  for (const cat of availableCategories) {
    categoryMap.set(cat._id.toString(), cat);
  }

  // Score each mapping rule against the text
  const scores: { categoryId: string; keyword: string; score: number }[] = [];

  for (const rule of mappingRules) {
    const keyword = rule.keyword.toLowerCase().trim();
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Check exact word boundary match
    const exactRegex = new RegExp(`\\b${escaped}\\b`, "i");
    if (exactRegex.test(normalizedText)) {
      // Score based on keyword specificity (longer = more specific = higher score)
      const score = 60 + keyword.length * 2;
      scores.push({ categoryId: rule.categoryId, keyword: rule.keyword, score: Math.min(score, 95) });
    }
  }

  if (scores.length === 0) {
    // Try fallback: direct match against category names
    for (const category of availableCategories) {
      const catName = category.name.toLowerCase();
      if (normalizedText.includes(catName)) {
        return {
          category: category as unknown as ICategory,
          categoryRaw: category.name,
          confidence: 55,
          needsReview: true,
        };
      }
    }

    return { category: null, categoryRaw: null, confidence: 0, needsReview: true };
  }

  // Use highest scoring rule
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  if (!best) {
    return { category: null, categoryRaw: null, confidence: 0, needsReview: true };
  }
  const matchedCategory = categoryMap.get(best.categoryId);

  if (!matchedCategory) {
    return { category: null, categoryRaw: null, confidence: 0, needsReview: true };
  }

  return {
    category: matchedCategory as unknown as ICategory,
    categoryRaw: matchedCategory.name,
    confidence: best.score,
    needsReview: best.score < 75,
  };
}
