"use client";

export function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <video
        src="/videos/hero-animation.mp4"
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        disableRemotePlayback
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-bounce pointer-events-none">
        <span className="text-xs uppercase tracking-widest text-white/50 mb-2 font-bold">Scroll to explore</span>
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
