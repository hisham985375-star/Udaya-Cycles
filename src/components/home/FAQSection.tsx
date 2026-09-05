"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Do you offer international shipping?",
    answer: "Currently, Udaya Cycles ships exclusively within India. We are working on expanding our logistics network to support international shipping in the near future."
  },
  {
    question: "What is your warranty policy?",
    answer: "All Udaya carbon frames come with a lifetime warranty against manufacturing defects for the original owner. Components and paint are covered for 2 years."
  },
  {
    question: "Can I test ride a bike before purchasing?",
    answer: "Yes, we strongly encourage it. You can schedule a test ride at any of our flagship stores or authorized dealers listed on our Store Locator page."
  },
  {
    question: "How long does delivery take?",
    answer: "In-stock bicycles are typically dispatched within 48 hours and take 3-7 business days to reach you, depending on your location. Custom builds take 2-3 weeks."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    contentRefs.current.forEach((el, index) => {
      if (!el) return;
      if (index === openIndex) {
        gsap.to(el, {
          height: "auto",
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        });
      } else {
        gsap.to(el, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut"
        });
      }
    });
  }, [openIndex]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section-padding bg-black border-t border-[#2a2a2a]">
      <div className="container-udaya">
        <div className="flex flex-col md:flex-row gap-16">
          
          <div className="w-full md:w-1/3">
            <span className="text-accent font-bold uppercase tracking-widest text-sm mb-2 block">Support</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-accent uppercase tracking-tight mb-6">
              Common <span className="text-accent opacity-80">Questions</span>
            </h2>
            <p className="text-accent opacity-80 mb-8">
              Everything you need to know about purchasing, shipping, and maintaining your Udaya bicycle.
            </p>
            <a href="/contact" className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-accent hover:opacity-80 transition-opacity">
              Still have questions? <span>→</span>
            </a>
          </div>
          
          <div className="w-full md:w-2/3 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className={`bg-black rounded-lg border transition-colors duration-300 ${isOpen ? 'border-accent' : 'border-[#2a2a2a] hover:border-accent/50'}`}
                >
                  <button
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="text-lg font-bold text-accent font-display tracking-wide">{faq.question}</span>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-accent/20 text-accent' : 'bg-[#1a1a1a] text-accent opacity-80'}`}>
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  
                  <div 
                    ref={el => { contentRefs.current[index] = el; }}
                    className="overflow-hidden h-0 opacity-0"
                  >
                    <div className="p-6 pt-0 text-accent opacity-80 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
