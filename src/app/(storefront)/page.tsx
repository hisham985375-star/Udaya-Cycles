/* eslint-disable @typescript-eslint/no-explicit-any */
import { HeroSection } from "@/components/home/HeroSection";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { ShopByBrands } from "@/components/home/ShopByBrands";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { WhyUdayaSection } from "@/components/home/WhyUdayaSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { PromotionalClosingSection } from "@/components/home/PromotionalClosingSection";
import { HighlightsSection } from "@/components/home/HighlightsSection";
import { connectDB } from "@/lib/db/mongoose";
import HomepageSettings from "@/models/HomepageSettings";

export default async function HomePage() {
  await connectDB();
  const settings = await HomepageSettings.findOne().lean();

  const isVisible = (key: string) => {
    if (!settings || !settings.sections) return true;
    const section = settings.sections.find((s: any) => s.key === key);
    return section ? section.isVisible : true;
  };

  return (
    <>
      {isVisible("hero") && <HeroSection />}
      {isVisible("new_arrivals") && <NewArrivalsSection />}
      {isVisible("featured") && <FeaturedProductsSection />}
      {isVisible("categories") && <FeaturedCategories />}
      {isVisible("brands") && <ShopByBrands />}
      {isVisible("why_udaya") && <WhyUdayaSection />}
      <HighlightsSection />
      {isVisible("testimonials") && <TestimonialsSection />}
      {isVisible("faq") && <FAQSection />}
      {isVisible("promo_closure") && <PromotionalClosingSection />}
    </>
  );
}
