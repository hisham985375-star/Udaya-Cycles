"use client";

import { useEffect, useRef, useState } from "react";

// Simple hook for counting up animation when in view
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          let startTime: number | null = null;
          const animateCount = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            
            // easeOutExpo function for smooth deceleration
            const easeOutExpo = (x: number): number => {
              return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            };

            const percentage = Math.min(progress / duration, 1);
            const currentCount = Math.floor(easeOutExpo(percentage) * end);
            
            setCount(currentCount);

            if (progress < duration) {
              requestAnimationFrame(animateCount);
            } else {
              setCount(end);
            }
          };
          
          requestAnimationFrame(animateCount);
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = nodeRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [end, duration, hasAnimated]);

  return { count, nodeRef };
}

interface StatProps {
  end: number;
  suffix: string;
  label: string;
  delay?: string;
}

function Stat({ end, suffix, label, delay = "0s" }: StatProps) {
  const { count, nodeRef } = useCountUp(end);
  
  // Format numbers (e.g. 5000 -> 5,000)
  const formattedCount = count >= 1000 ? count.toLocaleString() : count;

  return (
    <div 
      ref={nodeRef} 
      className="flex flex-col items-center justify-center p-6 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] hover:border-accent transition-colors duration-300 group opacity-0 animate-fade-in-up"
      style={{ animationDelay: delay, animationFillMode: "forwards" }}
    >
      <h3 className="text-4xl md:text-5xl font-bold text-accent mb-3 group-hover:scale-110 transition-transform duration-300 whitespace-nowrap">
        {formattedCount}{suffix}
      </h3>
      <p className="text-gray-400 text-sm md:text-base text-center uppercase group-hover:text-white transition-colors duration-300">
        {label}
      </p>
    </div>
  );
}

export function HighlightsSection() {
  const stats = [
    { end: 20, suffix: "+", label: "Premium Brands", delay: "0s" },
    { end: 60, suffix: "+", label: "Years Trusted", delay: "0.1s" },
    { end: 5, suffix: " LAKH+", label: "Happy Customers", delay: "0.2s" },
    { end: 10000, suffix: "+", label: "Cycles Delivered", delay: "0.3s" },
    { end: 23, suffix: "", label: "Stores in Kerala", delay: "0.4s" },
  ];

  return (
    <section className="py-20 md:py-28 bg-black relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="container-udaya relative z-10">
        <div className="text-center mb-16">
          <p className="text-accent uppercase tracking-[0.2em] text-sm font-semibold mb-4 opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
            BY THE NUMBERS
          </p>
          <h2 className="text-3xl md:text-5xl font-normal text-white opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            Our Impact
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <Stat 
              key={index} 
              end={stat.end} 
              suffix={stat.suffix} 
              label={stat.label} 
              delay={stat.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
