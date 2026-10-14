"use client";

import Link from "next/link";

const AGE_GROUPS = [
  { label: "2–3 Years",       wheelSize: "12"         },
  { label: "3–5 Years",       wheelSize: "14"         },
  { label: "4–6 Years",       wheelSize: "16"         },
  { label: "5–8 Years",       wheelSize: "20"         },
  { label: "7–10 Years",      wheelSize: "24"         },
  { label: "10+ / Teens",     wheelSize: "26"         },
  { label: "Adults",          wheelSize: "27.5,28,29" },
] as const;

export function AgeFilterSection() {
  return (
    <section className="bg-black border-t border-[#1f1f1f] py-14">
      <div className="container-udaya">

        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-accent font-bold uppercase tracking-widest text-xs mb-2 block">
              Find by Rider
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary uppercase tracking-tight">
              Shop by <span className="text-accent">Age Group</span>
            </h2>
          </div>

        </div>

        {/* Age Group Buttons */}
        <div className="flex flex-wrap gap-3">
          {AGE_GROUPS.map((ag) => (
            <Link
              key={ag.wheelSize}
              href={`/cycles/category/all?ageGroup=${encodeURIComponent(ag.wheelSize)}`}
              className="
                group
                inline-flex items-center gap-2
                px-6 py-3
                rounded-full
                bg-accent
                text-black
                font-bold text-sm uppercase tracking-widest
                transition-all duration-200
                hover:bg-[#d4e639]
                hover:scale-105
                active:scale-95
                shadow-none hover:shadow-[0_0_24px_rgba(239,255,64,0.35)]
              "
            >
              {ag.label}
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
