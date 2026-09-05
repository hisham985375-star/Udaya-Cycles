"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Arjun Mehta",
    role: "Professional Cyclist",
    content: "The aerodynamic geometry and carbon layup on my Udaya road bike is unlike anything I've ridden. It's stiff where it needs to be, yet compliant on rougher roads. Simply incredible.",
    rating: 5,
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Triathlete",
    content: "Switching to Udaya for my race season shaved minutes off my bike split. The power transfer is immediate, and the aesthetics always turn heads in transition.",
    rating: 5,
  },
  {
    id: 3,
    name: "Vikram Singh",
    role: "MTB Enthusiast",
    content: "I've taken the Udaya mountain series through the harshest trails in the Himalayas. The suspension kinematics are dialed, giving me absolute confidence on technical descents.",
    rating: 5,
  },
  {
    id: 4,
    name: "Rohan Patel",
    role: "Commuter",
    content: "My hybrid Udaya bike makes the daily commute the best part of my day. It's lightweight, incredibly reliable, and handles city streets with absolute ease.",
    rating: 4,
  }
];

export function TestimonialsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current || cardsRef.current.length === 0) return;
    
    // Simple staggered fade in for testimonials when scrolled into view
    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      }
    );
  }, []);

  return (
    <section className="section-padding bg-bg relative overflow-hidden" ref={containerRef}>
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="container-udaya relative z-10">
        <div className="text-center mb-16">
          <span className="text-accent font-bold uppercase tracking-widest text-sm mb-2 block">The Udaya Experience</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary uppercase tracking-tight">
            Rider <span className="text-text-muted">Stories</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              ref={el => { cardsRef.current[index] = el; }}
              className="bg-surface-raised border border-border p-8 rounded-xl relative hover:border-accent/50 transition-colors group"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-border group-hover:text-accent/20 transition-colors" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < testimonial.rating ? 'fill-accent text-accent' : 'fill-surface text-surface'}`} 
                  />
                ))}
              </div>
              
              <p className="text-text-secondary mb-8 leading-relaxed italic text-sm">
                &quot;{testimonial.content}&quot;
              </p>
              
              <div className="mt-auto pt-6 border-t border-border/50">
                <p className="font-bold text-text-primary font-display tracking-wide">{testimonial.name}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider mt-1">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
