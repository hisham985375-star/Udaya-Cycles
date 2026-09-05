import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    template: "%s | Udaya Cycles",
    default: "Udaya Cycles | Precision Engineered Bicycles",
  },
  description: "Premium bicycles built for performance, passion, and the ultimate riding experience.",
  openGraph: {
    title: "Udaya Cycles",
    description: "Premium bicycles built for performance, passion, and the ultimate riding experience.",
    url: "/",
    siteName: "Udaya Cycles",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Udaya Cycles",
    description: "Premium bicycles built for performance, passion, and the ultimate riding experience.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-bg text-text-primary">
        <Providers>
          {children}
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: "var(--color-surface-raised)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
              },
              success: {
                iconTheme: {
                  primary: "var(--color-success)",
                  secondary: "var(--color-bg)",
                },
              },
            }} 
          />
        </Providers>
      </body>
    </html>
  );
}
