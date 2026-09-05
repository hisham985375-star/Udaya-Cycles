"use client";

import Image from "next/image";
import { useState } from "react";

interface ImagePreviewTabsProps {
  imageUrl?: string;
  alt?: string;
  size?: number; // px
}

export function ImagePreviewTabs({ imageUrl, alt = "Product Image", size = 200 }: ImagePreviewTabsProps) {
  const [activeTab, setActiveTab] = useState<"transparent" | "white" | "dark">("transparent");

  if (!imageUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-lg border border-border bg-surface flex items-center justify-center text-text-muted text-xs text-center p-4"
      >
        No image extracted
      </div>
    );
  }

  const tabs = [
    { id: "transparent" as const, label: "Transparent" },
    { id: "white" as const, label: "White" },
    { id: "dark" as const, label: "Dark" },
  ];

  const bgStyles: Record<string, string> = {
    transparent: `
      background-image: linear-gradient(45deg, #3a3a3a 25%, transparent 25%),
        linear-gradient(-45deg, #3a3a3a 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #3a3a3a 75%),
        linear-gradient(-45deg, transparent 75%, #3a3a3a 75%);
      background-size: 16px 16px;
      background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
      background-color: #2a2a2a;
    `,
    white: "background-color: #ffffff;",
    dark: "background-color: #0a0a09;",
  };

  return (
    <div style={{ width: size }}>
      {/* Tab headers */}
      <div className="flex rounded-t-lg overflow-hidden border border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-accent/10 text-accent border-b border-accent"
                : "bg-surface text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Image area */}
      <div
        style={{
          width: size,
          height: size,
          position: "relative",
        }}
        className="border-x border-b border-border rounded-b-lg overflow-hidden"
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            cssText: bgStyles[activeTab],
          } as React.CSSProperties}
          className="absolute inset-0"
        />
        <div
          style={{
            ...(activeTab === "transparent"
              ? {
                  backgroundImage: `linear-gradient(45deg, #3a3a3a 25%, transparent 25%),
                    linear-gradient(-45deg, #3a3a3a 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #3a3a3a 75%),
                    linear-gradient(-45deg, transparent 75%, #3a3a3a 75%)`,
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                  backgroundColor: "#2a2a2a",
                }
              : activeTab === "white"
              ? { backgroundColor: "#ffffff" }
              : { backgroundColor: "#0a0a09" }),
          }}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Image
            src={imageUrl}
            alt={alt}
            width={size - 32}
            height={size - 32}
            className="object-contain max-w-full max-h-full"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
