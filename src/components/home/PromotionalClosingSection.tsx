import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PromotionalClosingSection() {
  return (
    <section className="section-padding bg-bg relative overflow-hidden">
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
      
      <div className="container-udaya relative z-10">
        <div className="bg-surface-raised border border-border rounded-3xl p-10 md:p-20 text-center relative overflow-hidden">
          
          {/* Inner Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative z-20 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-text-primary uppercase tracking-tight mb-6">
              Ready to <span className="text-accent">Elevate</span> Your Ride?
            </h2>
            <p className="text-xl text-text-secondary mb-10 leading-relaxed font-medium">
              Join thousands of riders who have chosen Udaya Cycles for unmatched performance and precision engineering.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/cycles/category/all"
                className="w-full sm:w-auto bg-accent text-bg font-bold px-10 py-5 rounded-full hover:bg-accent-dim hover-scale transition-all tracking-wide uppercase text-sm flex items-center justify-center gap-2"
              >
                Build Your Dream Bike <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/store-locator"
                className="w-full sm:w-auto bg-surface border-2 border-border text-text-primary font-bold px-10 py-5 rounded-full hover:border-text-primary transition-colors tracking-wide uppercase text-sm flex items-center justify-center"
              >
                Find a Dealer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
