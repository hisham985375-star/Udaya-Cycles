import Link from "next/link";
import Image from "next/image";
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
  }
];

export function ShopByBrands() {
  return (
    <section className="py-20 bg-black">
      <div className="container-udaya">
        <h2 className="text-3xl md:text-4xl font-normal text-accent mb-12">
          Cycles by Brand
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {staticBrands.map((brand) => {
            return (
              <Link 
                href={brand.href}
                key={brand.id}
                className="group flex flex-col items-center"
              >
                {/* Image Box */}
                <div className="w-full aspect-square bg-[#1a1a1a] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  {/* Background Image */}
                  <Image 
                    src={brand.bgImage}
                    alt={brand.label}
                    fill
                    className="object-cover opacity-60 mix-blend-overlay group-hover:opacity-80 transition-opacity"
                  />
                  
                  {/* Logo overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center ${brand.fillLogo ? '' : 'p-6'} ${brand.bgWhite ? 'bg-white' : ''}`}>
                    <div className={`relative ${brand.fillLogo ? 'w-full h-full' : 'w-3/4 h-24'}`}>
                      <Image
                        src={brand.logo}
                        alt={`${brand.id} logo`}
                        fill
                        className={brand.fillLogo ? (brand.bgWhite ? 'object-contain p-4' : 'object-cover') : 'object-contain'}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Title & Arrow */}
                <div className="flex items-center gap-2 text-accent group-hover:text-accent-dim transition-colors">
                  <span className="text-sm md:text-base font-normal">{brand.label}</span>
                  <span className="text-lg leading-none">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
