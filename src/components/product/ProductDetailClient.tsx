"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { ProductReviews } from "../storefront/ProductReviews";

interface Variant {
  _id: string;
  sku: string;
  color: string;
  size: string;
  priceAdjustment: number;
  stock: number;
  images: Array<{ url: string; isPrimary: boolean }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProductDetailClient({ product, variants }: { product: any, variants: Variant[] }) {
  // Aggregate available colors and sizes
  const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)));
  const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean)));

  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || "");
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const addItem = useCartStore(state => state.addItem);
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // To avoid hydration mismatch errors
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsWishlisted(isInWishlist(product._id.toString()));
  }, [isInWishlist, product._id]);

  // Find currently selected variant based on color and size
  const currentVariant = variants.find(
    (v) => (v.color === selectedColor || !selectedColor) && (v.size === selectedSize || !selectedSize)
  );

  // Calculate price using salePrice if available, otherwise regularPrice
  const basePrice = product.salePrice || product.regularPrice;
  const finalPrice = currentVariant ? basePrice + currentVariant.priceAdjustment : basePrice;

  // Gather all images (Product base images + selected variant images)
  const allImages = [
    ...(product.images || []),
    ...(currentVariant?.images || []),
  ].map(img => img.url);

  // Fallback if no images
  if (allImages.length === 0) {
    allImages.push("placeholder");
  }

  const handleAddToCart = () => {
    if (!currentVariant && product.hasVariants) {
      alert("Please select a variant.");
      return;
    }

    if (currentVariant && currentVariant.stock < quantity) {
      alert("Not enough stock available.");
      return;
    }

    addItem({
      productId: product._id.toString(),
      variantId: currentVariant?._id,
      name: product.name,
      sku: currentVariant ? currentVariant.sku : product.sku,
      price: finalPrice,
      image: allImages[0],
      quantity: quantity,
      stock: currentVariant ? currentVariant.stock : 99,
      attributes: currentVariant ? { color: currentVariant.color, size: currentVariant.size } : {},
    });
  };

  const handleWishlistToggle = () => {
    const idStr = product._id.toString();
    if (isWishlisted) {
      removeWishlist(idStr);
      setIsWishlisted(false);
    } else {
      addWishlist({
        productId: idStr,
        name: product.name,
        price: basePrice,
        image: allImages[0],
        slug: product.slug
      });
      setIsWishlisted(true);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Image Gallery */}
      <div className="lg:w-1/2 flex flex-col gap-4">
        <div className="aspect-[4/3] overflow-hidden relative flex items-center justify-center">
          {allImages[activeImage] !== "placeholder" ? (
             <Image src={allImages[activeImage]} alt={product.name} fill className="object-contain" />
          ) : (
            <span className="text-text-muted font-mono uppercase tracking-widest text-sm">Product Image</span>
          )}
        </div>
        
        {allImages.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {allImages.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-20 h-20 shrink-0 bg-surface rounded-lg border-2 overflow-hidden relative ${activeImage === idx ? 'border-accent' : 'border-border hover:border-text-muted'}`}
              >
                {img !== "placeholder" ? (
                  <Image src={img} alt={`Thumbnail ${idx+1}`} fill className="object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-text-muted">IMG</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="lg:w-1/2">
        <div className="mb-2 flex items-center gap-2">
          {product.brand && (
            <span className="text-sm font-bold uppercase tracking-wider text-text-secondary bg-surface-raised px-3 py-1 rounded-full border border-border">
              {product.brand.name}
            </span>
          )}
        </div>
        
        <h1 className="text-4xl lg:text-5xl font-display font-bold text-text-primary uppercase tracking-tight mb-4">
          {product.name}
        </h1>
        
        <div className="flex items-baseline gap-4 mb-6">
          <p className="text-3xl font-mono font-bold text-accent">
            ₹{(finalPrice / 100).toLocaleString('en-IN')}
          </p>
          {product.salePrice && product.salePrice < product.regularPrice && (
            <p className="text-xl font-mono text-text-muted line-through">
              ₹{(product.regularPrice / 100).toLocaleString('en-IN')}
            </p>
          )}
        </div>

        <div className="text-text-secondary leading-relaxed mb-8 text-lg pb-8">
          {product.description}
        </div>

        {/* Variant Selectors */}
        {product.hasVariants && (
          <div className="space-y-6 mb-8">
            {colors.length > 0 && (
              <div>
                <span className="block text-sm font-bold uppercase tracking-wider text-text-primary mb-3">Color: <span className="text-text-secondary font-medium">{selectedColor}</span></span>
                <div className="flex gap-3">
                  {colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-12 w-12 rounded-full border-2 transition-all ${selectedColor === color ? 'border-accent p-1' : 'border-transparent hover:border-border'}`}
                    >
                      <div 
                        className="w-full h-full rounded-full border border-border/50" 
                        style={{ backgroundColor: color.toLowerCase() }} 
                        title={color}
                      ></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div>
                <span className="block text-sm font-bold uppercase tracking-wider text-text-primary mb-3">Size</span>
                <div className="flex flex-wrap gap-3">
                  {sizes.map(size => {
                    const isSelected = selectedSize === size;
                    // Check if this size is available for the selected color
                    const isAvailable = variants.some(v => v.color === selectedColor && v.size === size && v.stock > 0);
                    
                    return (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`h-12 min-w-[3rem] px-4 font-mono font-bold rounded-lg border-2 transition-colors ${
                          isSelected 
                            ? 'border-accent bg-accent/10 text-text-primary' 
                            : !isAvailable 
                              ? 'border-border/50 bg-surface/50 text-text-muted cursor-not-allowed line-through'
                              : 'border-border bg-surface text-text-primary hover:border-text-muted'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stock Status */}
        <div className="mb-8">
          {currentVariant ? (
            currentVariant.stock > 0 ? (
              <span className="text-sm font-bold uppercase tracking-wider text-green-500">
                In Stock ({currentVariant.stock} available)
              </span>
            ) : (
              <span className="text-sm font-bold uppercase tracking-wider text-red-500">
                Out of Stock
              </span>
            )
          ) : !product.hasVariants ? (
             <span className="text-sm font-bold uppercase tracking-wider text-green-500">
                In Stock
             </span>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="flex items-center bg-surface border-2 border-border rounded-full h-14 w-full sm:w-32">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-full flex items-center justify-center text-text-primary hover:text-accent transition-colors rounded-l-full"
            >
              -
            </button>
            <span className="flex-1 text-center font-mono font-bold text-text-primary">
              {quantity}
            </span>
            <button 
              onClick={() => setQuantity(currentVariant ? Math.min(currentVariant.stock, quantity + 1) : quantity + 1)}
              className="w-10 h-full flex items-center justify-center text-text-primary hover:text-accent transition-colors rounded-r-full"
            >
              +
            </button>
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={product.hasVariants && currentVariant?.stock === 0}
            className="flex-1 bg-accent text-bg font-bold h-14 rounded-full uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-accent-dim hover-scale transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-5 h-5" />
            Add to Cart
          </button>
          
          <button 
            onClick={handleWishlistToggle}
            className={`w-14 h-14 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
              isWishlisted 
                ? 'border-red-500 bg-red-500/10 text-red-500' 
                : 'border-border text-text-primary hover:border-red-500 hover:text-red-500 bg-surface-raised'
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
           <div className="flex flex-col items-center justify-center text-center p-4 bg-surface rounded-xl">
             <ShieldCheck className="w-6 h-6 text-accent mb-2" />
             <span className="text-xs uppercase tracking-wider font-bold text-text-primary">1 Year Warranty</span>
           </div>
           <div className="flex flex-col items-center justify-center text-center p-4 bg-surface rounded-xl">
             <Truck className="w-6 h-6 text-accent mb-2" />
             <span className="text-xs uppercase tracking-wider font-bold text-text-primary">Free Shipping</span>
           </div>
           <div className="flex flex-col items-center justify-center text-center p-4 bg-surface rounded-xl">
             <RotateCcw className="w-6 h-6 text-accent mb-2" />
             <span className="text-xs uppercase tracking-wider font-bold text-text-primary">7-Day Returns</span>
           </div>
        </div>

        {/* Reviews */}
        <ProductReviews productId={product._id} />

      </div>
    </div>
  );
}
