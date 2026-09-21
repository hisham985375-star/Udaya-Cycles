import { connectDB } from "@/lib/db/mongoose";
import BrandModel from "@/models/Brand";
import { ShopByBrandsClient } from "./ShopByBrandsClient";
interface Brand {
  id: string;
  bgImage: string;
  logo: string;
  label: string;
  href: string;
  fillLogo?: boolean;
  bgWhite?: boolean;
}

const staticBrands: Brand[] = [
  {
    id: "radiant",
    bgImage: "/pictures/radient-bg.png",
    logo: "/pictures/radiant-new-logo.png",
    label: "Radiant",
    href: "/cycles/brand/radiant",
    fillLogo: true,
    bgWhite: true,
  },
  {
    id: "avon",
    bgImage: "/pictures/avon-bg.png",
    logo: "/pictures/avon-logo.png",
    label: "Avon",
    href: "/cycles/brand/avon",
    fillLogo: true,
    bgWhite: true,
  },
  {
    id: "sk",
    bgImage: "/pictures/sk-bg.png",
    logo: "/pictures/gang-logo.png",
    label: "Gang",
    href: "/cycles/brand/gang",
    fillLogo: true,
    bgWhite: true,
  },
  {
    id: "chase",
    bgImage: "/pictures/chase-bg.png",
    logo: "/pictures/chase-logo.png",
    label: "Chase",
    href: "/cycles/brand/chase",
    fillLogo: true,
    bgWhite: true,
  },
  {
    id: "viva",
    bgImage: "/pictures/viva-bg.png",
    logo: "/pictures/viva-logo.png",
    label: "Viva",
    href: "/cycles/brand/viva",
    fillLogo: true,
    bgWhite: true,
  },
  {
    id: "firefox",
    bgImage: "/pictures/firefox-bg.png",
    logo: "/pictures/firefox-logo.png",
    label: "Firefox",
    href: "/cycles/brand/firefox",
    fillLogo: true,
    bgWhite: true,
  },
  {
    id: "emotorad",
    bgImage: "/pictures/emotorad-bg.png",
    logo: "/pictures/emotorad-logo.png",
    label: "Emotorad",
    href: "/cycles/brand/emotorad",
    fillLogo: true,
    bgWhite: true,
  },
  {
    id: "ninety-one",
    bgImage: "/pictures/ninety-one-bg.png",
    logo: "/pictures/ninety-one-logo.png",
    label: "Ninety one",
    href: "/cycles/brand/ninety-one",
    fillLogo: true,
    bgWhite: true,
  },
  {
    id: "raliegh",
    bgImage: "/pictures/raliegh-bg.png",
    logo: "/pictures/raleigh-logo.png",
    label: "Raleigh",
    href: "/cycles/brand/raliegh",
    fillLogo: true,
    bgWhite: true,
  },
  {
    id: "suncross",
    bgImage: "/pictures/suncross-bg.png",
    logo: "/pictures/suncross-logo.png",
    label: "Suncross",
    href: "/cycles/brand/suncross",
    fillLogo: true,
    bgWhite: true,
  },
  {
    id: "kross",
    bgImage: "", // No specific background image, will fallback to grey bg with logo
    logo: "/pictures/kross-logo.jpg",
    label: "Kross",
    href: "/cycles/brand/kross",
    fillLogo: true,
    bgWhite: true,
  },
  {
    id: "british-eagle",
    bgImage: "",
    logo: "/pictures/british-eagle-logo.jpg",
    label: "British Eagle",
    href: "/cycles/brand/british-eagle",
    fillLogo: true,
    bgWhite: true,
  }
];

export async function ShopByBrands() {
  await connectDB();

  // Fetch all active brands from DB (excluding 'udaya' brand from this section)
  const dbBrands = await BrandModel.find({ isActive: true, slug: { $ne: 'udaya' } }).sort({ name: 1 }).lean();

  if (!dbBrands || dbBrands.length === 0) return null;

  // Merge DB brands with static config for rich visuals
  const allBrands = dbBrands.map((dbBrand: any) => {
    // Find static config by matching name or slug
    const staticConfig = staticBrands.find(
      (sb) => sb.id.toLowerCase() === dbBrand.slug.toLowerCase() || 
              sb.label.toLowerCase() === dbBrand.name.toLowerCase() ||
              (sb.id === "sk" && dbBrand.slug === "gang") // Special case for Gang
    );

    return {
      id: dbBrand.slug,
      label: dbBrand.name,
      href: `/cycles/brand/${dbBrand.slug}`,
      bgImage: staticConfig?.bgImage || null,
      logo: staticConfig?.logo || dbBrand.logo?.url || null,
      fillLogo: staticConfig?.fillLogo || false,
      bgWhite: staticConfig?.bgWhite || false,
    };
  });

  return <ShopByBrandsClient brands={allBrands} />;
}
