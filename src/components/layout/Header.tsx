"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleCart = useCartStore((state) => state.toggleCart);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const toggleSearch = useUiStore((state) => state.toggleSearch);
  const [mounted, setMounted] = useState(false);
  
  // To avoid hydration mismatch errors with Zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? getItemCount() : 0;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-[200] w-full bg-black">
      <div className="container-udaya">
        <div className="flex items-center justify-between h-[80px]">
          
          {/* Logo & Desktop Navigation */}
          <div className="flex items-center gap-10 lg:gap-14 h-full">
            <Link href="/" className="flex items-center -ml-2 md:-ml-4 lg:-ml-8">
              <Image 
                src="/udaya-logo.svg" 
                alt="Udaya Cycles Logo" 
                width={140} 
                height={50} 
                className="w-auto h-12 md:h-14" 
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center h-full gap-7 text-accent text-[15px] font-normal tracking-wide">
            <Link href="/" className="border-b border-accent pb-[2px] hover:opacity-80 transition-opacity">
              Home
            </Link>
            <Link href="/#why-udaya" className="hover:opacity-80 transition-opacity">
              About Us
            </Link>
            <div className="relative group h-full flex items-center">
              <button className="flex items-center gap-1.5 transition-all group-hover:border-b group-hover:border-accent pb-[2px] h-[24px]">
                Cycles by Category 
                <ChevronDown className="w-4 h-4 group-hover:hidden" />
                <ChevronUp className="w-4 h-4 hidden group-hover:block" />
              </button>
              
              <div className="absolute top-full left-0 hidden group-hover:block z-[100]">
                <div className="bg-black flex flex-col py-1.5 w-[190px] shadow-2xl border border-[#1a1a18] border-t-0">
                  <Link href="/cycles/category/mtb-bicycles" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">MTB Cycles</Link>
                  <Link href="/cycles/category/electric-cycles" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">Electric Cycles</Link>
                  <Link href="/cycles/category/kids-bicycles" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">Kids Cycles</Link>
                  <Link href="/cycles/category/girl-s-bicycles" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">Girl's Cycles</Link>
                </div>
              </div>
            </div>
            <div className="relative group h-full flex items-center">
              <button className="flex items-center gap-1.5 transition-all group-hover:border-b group-hover:border-accent pb-[2px] h-[24px]">
                Cycles by Brand 
                <ChevronDown className="w-4 h-4 group-hover:hidden" />
                <ChevronUp className="w-4 h-4 hidden group-hover:block" />
              </button>
              
              <div className="absolute top-full left-0 hidden group-hover:block z-[100]">
                <div className="bg-black flex flex-col py-1.5 w-[190px] shadow-2xl border border-[#1a1a18] border-t-0">
                  <Link href="/cycles/brand/radiant" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">Radiant</Link>
                  <Link href="/cycles/brand/avon" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">Avon</Link>
                  <Link href="/cycles/brand/gang" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">Gang</Link>
                  <Link href="/cycles/brand/chase" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">Chase</Link>
                  <Link href="/cycles/brand/viva" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">Viva</Link>
                  <Link href="/cycles/brand/firefox" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">Firefox</Link>
                  <Link href="/cycles/brand/emotorad" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">Emotorad</Link>
                  <Link href="/cycles/brand/ninety-one" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">Ninety one</Link>
                  <Link href="/cycles/brand/raliegh" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">Raliegh</Link>
                  <Link href="/cycles/brand/suncross" className="px-5 py-2.5 hover:bg-[#1a1a18] transition-colors text-[14px]">Suncross</Link>
                </div>
              </div>
            </div>
            <Link href="/accessories" className="hover:opacity-80 transition-opacity">
              Accessories
            </Link>
            <Link href="/contact" className="hover:opacity-80 transition-opacity">
              Contact
            </Link>
            <Link href="/store-locator" className="hover:opacity-80 transition-opacity">
              Store Locator
            </Link>
            </nav>
          </div>

          {/* Action Icons */}
          <div className="hidden md:flex items-center gap-6 text-accent">
            <button onClick={() => toggleSearch(true)} aria-label="Search" className="hover:opacity-80 transition-opacity">
              <Search className="w-6 h-6" strokeWidth={1.5} />
            </button>

            <button 
              onClick={() => toggleCart(true)} 
              aria-label="Cart" 
              className="relative hover:opacity-80 transition-opacity"
            >
              <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-accent text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-4 text-accent">
              <button onClick={() => toggleSearch(true)} aria-label="Search">
                <Search className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button onClick={() => toggleCart(true)} aria-label="Cart" className="relative">
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-accent text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={toggleMobileMenu}
                className="p-1 hover:opacity-80"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
              </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[80px] left-0 w-full bg-black border-t border-border shadow-lg animate-fade-in-up z-[100] text-accent pb-4">
          <div className="flex flex-col p-4 space-y-4">
            <Link href="/" className="text-lg font-normal p-2 hover:bg-surface rounded-md transition-colors" onClick={toggleMobileMenu}>
              Home
            </Link>
            <Link href="/#why-udaya" className="text-lg font-normal p-2 hover:bg-surface rounded-md transition-colors" onClick={toggleMobileMenu}>
              About Us
            </Link>
            <button className="flex items-center justify-between text-lg font-normal p-2 hover:bg-surface rounded-md transition-colors">
              Cycles by Category <ChevronDown className="w-5 h-5" />
            </button>
            <button className="flex items-center justify-between text-lg font-normal p-2 hover:bg-surface rounded-md transition-colors">
              Cycles by Brand <ChevronDown className="w-5 h-5" />
            </button>
            <Link href="/accessories" className="text-lg font-normal p-2 hover:bg-surface rounded-md transition-colors" onClick={toggleMobileMenu}>
              Accessories
            </Link>
            <Link href="/contact" className="text-lg font-normal p-2 hover:bg-surface rounded-md transition-colors" onClick={toggleMobileMenu}>
              Contact
            </Link>
            <Link href="/store-locator" className="text-lg font-normal p-2 hover:bg-surface rounded-md transition-colors" onClick={toggleMobileMenu}>
              Store Locator
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
