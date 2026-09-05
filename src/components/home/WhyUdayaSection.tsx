import Link from "next/link";

export function WhyUdayaSection() {
  const features = [
    {
      number: "01",
      badge: "Selection",
      title: "Wide Range of Bicycles",
      description: "From toddler tricycles to professional 29er trail cycles"
    },
    {
      number: "02",
      badge: "Certified",
      title: "Expert Repair Service",
      description: "Certified technicians, quick turnarounds & full tune-ups"
    },
    {
      number: "03",
      badge: "Precision",
      title: "Gear & Hydraulic Tuning",
      description: "Specialized diagnosis for disc brakes, shifters & suspension"
    },
    {
      number: "04",
      badge: "Original",
      title: "100% Genuine Spares",
      description: "Factory original components from Shimano, Hero & Kross"
    },
    {
      number: "05",
      badge: "Kids Fun",
      title: "Kids' Rides & Electric Jeeps",
      description: "Durable, safe & fun 4x4 electric rides, scooters & trikes"
    },
    {
      number: "06",
      badge: "Best Rates",
      title: "Wholesale & Retail Pricing",
      description: "Unbeatable pricing for individual riders and bulk buyers"
    }
  ];

  return (
    <section id="why-udaya" className="py-8 md:py-10 bg-bg relative overflow-hidden border-t border-border">
      <div className="container-udaya relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-6 md:mb-8">
          <span className="inline-block bg-accent/10 text-accent font-bold px-3 py-1 rounded-full uppercase tracking-wider text-[10px] mb-2 border border-accent/20">
            The Udaya Advantage
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-text-primary uppercase tracking-tight mb-2">
            Why Choose Udaya
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Over 60 years of cycling craftsmanship, Kerala's largest store network, and certified repair experts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          
          {/* Left Card */}
          <div className="lg:col-span-5 bg-surface-raised border border-border rounded-2xl p-5 lg:p-6 flex flex-col relative overflow-hidden group">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-accent/15 transition-colors duration-500"></div>
            
            <span className="self-start inline-block bg-accent text-bg font-bold px-2 py-1 rounded-full uppercase tracking-wider text-[9px] mb-4">
              Flagship Network
            </span>
            
            <h3 className="text-xl md:text-2xl font-display font-bold text-text-primary leading-tight mb-2">
              23 Showrooms Across Kerala
            </h3>
            
            <p className="text-text-secondary leading-snug mb-4 text-xs">
              Kerala's most trusted cycle showroom network. Experience test rides, expert fitting, and instant local service at any Udaya store near you.
            </p>
            
            <div className="grid grid-cols-2 gap-2 mb-auto pb-4">
              <div className="bg-surface border border-border rounded-lg p-3 shadow-sm hover:border-accent/30 transition-colors">
                <div className="text-lg md:text-xl font-bold text-text-primary mb-0.5">60+ Yrs</div>
                <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Heritage Trust</div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-3 shadow-sm hover:border-accent/30 transition-colors">
                <div className="text-lg md:text-xl font-bold text-text-primary mb-0.5">23 Stores</div>
                <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Statewide Reach</div>
              </div>
            </div>
            
            <Link href="/store-locator" className="w-full bg-accent text-bg font-bold py-2.5 rounded-lg hover:bg-accent-dim transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wide text-xs">
              Find Nearest Store <span className="text-base leading-none">→</span>
            </Link>
          </div>

          {/* Right Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
            {features.map((feature, index) => (
              <div key={index} className="bg-surface border border-border rounded-xl p-3 lg:p-4 hover:border-accent/30 hover:bg-surface-raised transition-all duration-300 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2.5">
                  <span className="bg-accent text-bg font-bold px-2 py-0.5 rounded-full text-[9px]">
                    {feature.number}
                  </span>
                  <span className="bg-surface-raised border border-border text-text-secondary font-medium px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider">
                    {feature.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-text-primary mb-1">{feature.title}</h4>
                <p className="text-text-secondary text-[11px] leading-snug">{feature.description}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
