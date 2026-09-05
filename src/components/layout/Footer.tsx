"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black pt-16 pb-8 border-t border-border">
      <div className="container-udaya">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <Image 
                src="/udaya-logo.svg" 
                alt="Udaya Cycles Logo" 
                width={140} 
                height={50} 
                className="w-auto h-10 md:h-12" 
              />
            </Link>
            <p className="text-sm text-accent opacity-80 mb-6">
              Precision engineered bicycles for performance, passion, and the ultimate riding experience.
            </p>
            <div className="flex items-center gap-4 text-accent">
              <a href="#" aria-label="Instagram" className="hover:opacity-80 transition-opacity"><Instagram className="w-5 h-5" /></a>
              <a href="#" aria-label="Facebook" className="hover:opacity-80 transition-opacity"><Facebook className="w-5 h-5" /></a>
              <a href="#" aria-label="Twitter" className="hover:opacity-80 transition-opacity"><Twitter className="w-5 h-5" /></a>
              <a href="#" aria-label="Youtube" className="hover:opacity-80 transition-opacity"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-lg font-bold text-accent mb-6">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/cycles/category/all" className="text-sm text-accent hover:opacity-80 transition-opacity">All Bicycles</Link></li>
              <li><Link href="/cycles/category/mountain" className="text-sm text-accent hover:opacity-80 transition-opacity">Mountain Bikes</Link></li>
              <li><Link href="/cycles/category/road" className="text-sm text-accent hover:opacity-80 transition-opacity">Road Bikes</Link></li>
              <li><Link href="/cycles/category/hybrid" className="text-sm text-accent hover:opacity-80 transition-opacity">Hybrid & City</Link></li>
              <li><Link href="/accessories" className="text-sm text-accent hover:opacity-80 transition-opacity">Accessories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold text-accent mb-6">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/faq" className="text-sm text-accent hover:opacity-80 transition-opacity">FAQ</Link></li>
              <li><Link href="/contact" className="text-sm text-accent hover:opacity-80 transition-opacity">Contact Us</Link></li>
              <li><Link href="/store-locator" className="text-sm text-accent hover:opacity-80 transition-opacity">Store Locator</Link></li>
              <li><Link href="/legal/shipping-policy" className="text-sm text-accent hover:opacity-80 transition-opacity">Shipping Policy</Link></li>
              <li><Link href="/legal/refund-policy" className="text-sm text-accent hover:opacity-80 transition-opacity">Refunds & Returns</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-lg font-bold text-accent mb-6">Stay Connected</h4>
            <p className="text-sm text-accent opacity-80 mb-4">
              Subscribe to our newsletter for exclusive offers and updates.
            </p>
            <form className="flex mb-6" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 bg-black border border-[#2a2a2a] rounded-l-md px-4 py-2 text-sm text-accent focus:outline-none focus:border-accent transition-colors"
                required
              />
              <button
                type="submit"
                className="bg-accent text-bg font-bold px-4 py-2 rounded-r-md hover:bg-accent-dim transition-colors text-sm"
              >
                Join
              </button>
            </form>
            <div className="text-sm text-accent opacity-80 mt-4 space-y-1">
              <p>Email: <a href="mailto:info@udayacycles.com" className="hover:opacity-80 transition-opacity">info@udayacycles.com</a></p>
              <p>Phone: <a href="tel:+910000000000" className="hover:opacity-80 transition-opacity">+91 000 000 0000</a></p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#2a2a2a] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-accent opacity-60">
            &copy; {year} Udaya Cycles. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-accent opacity-80">
            <Link href="/legal/privacy-policy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:opacity-100 transition-opacity">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
