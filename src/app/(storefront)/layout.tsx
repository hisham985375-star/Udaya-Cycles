import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "@/components/layout/SearchOverlay";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <CartDrawer />
      <SearchOverlay />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
