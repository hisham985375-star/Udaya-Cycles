/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import Brand from "@/models/Brand";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Link from "next/link";
import { StorefrontFilters } from "@/components/storefront/StorefrontFilters";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const brand = await Brand.findOne({ slug, isActive: true }).lean();
  
  if (!brand) return { title: "Not Found" };
  
  return {
    title: `${brand.name} Bicycles | Udaya Cycles`,
    description: brand.description || `Browse our collection of ${brand.name} bicycles.`,
    openGraph: {
      title: brand.seo?.title || `${brand.name} Bicycles | Udaya Cycles`,
      description: brand.seo?.description || `Explore bicycles by ${brand.name}.`,
      images: brand.logo?.url ? [{ url: brand.logo.url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: brand.seo?.title || `${brand.name} Bicycles | Udaya Cycles`,
      description: brand.seo?.description || `Explore bicycles by ${brand.name}.`,
      images: brand.logo?.url ? [brand.logo.url] : [],
    }
  };
}

export default async function BrandPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params;
  const resolvedParams = await searchParams;
  await connectDB();

  const brand = await Brand.findOne({ slug, isActive: true }).lean();
  if (!brand) {
    notFound();
  }

  const categoryId = resolvedParams.category || "";
  const size = resolvedParams.size || "";
  const minPrice = resolvedParams.minPrice ? parseInt(resolvedParams.minPrice as string) * 100 : undefined;
  const maxPrice = resolvedParams.maxPrice ? parseInt(resolvedParams.maxPrice as string) * 100 : undefined;

  const filter: any = { 
    brand: brand._id, 
    isActive: true, 
    deletedAt: null 
  };

  if (categoryId) filter.category = categoryId;
  if (size) filter.size = size;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.regularPrice = {};
    if (minPrice !== undefined) filter.regularPrice.$gte = minPrice;
    if (maxPrice !== undefined) filter.regularPrice.$lte = maxPrice;
  }

  // Fetch reference data and products
  const [brands, categories, products] = await Promise.all([
    Brand.find({ isActive: true }).select("_id name").sort({ name: 1 }).lean(),
    Category.find({ isActive: true }).select("_id name").sort({ name: 1 }).lean(),
    Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean()
  ]);

  return (
    <div className="section-padding bg-bg">
      <div className="container-udaya">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4 uppercase tracking-tight">
            {brand.name}
          </h1>
          {brand.description && (
            <p className="text-lg text-text-secondary max-w-3xl">
              {brand.description}
            </p>
          )}
        </div>

        <div className="mb-8">
          <StorefrontFilters 
            brands={brands.map(b => ({ _id: b._id.toString(), name: b.name }))}
            categories={categories.map(c => ({ _id: c._id.toString(), name: c.name }))}
            currentBrandId={brand._id.toString()}
          />
        </div>

        <div className="flex items-center justify-between py-4 mb-4 border-b border-border">
          <div className="text-sm text-text-secondary font-medium">
            Showing {products.length} {products.length === 1 ? 'result' : 'results'}
          </div>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => {
              const primaryImage = product.images?.find((img: any) => img.isDefault) || product.images?.[0];
              const imageUrl = primaryImage?.url || "";

              return (
                <Link 
                  href={`/products/${product.slug}`} 
                  key={product._id.toString()}
                  className="group block"
                >
                  <div className="aspect-[4/3] relative w-full mb-4 overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-overlay flex items-center justify-center text-text-muted group-hover:scale-105 transition-transform duration-500">
                        <span className="font-mono text-xs uppercase tracking-widest">{product.name} Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="px-2">
                    <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-accent">
                        ₹{((product.salePrice || product.regularPrice) / 100).toLocaleString('en-IN')}
                      </span>
                      {product.salePrice && product.salePrice < product.regularPrice && (
                        <span className="font-mono text-sm text-text-muted line-through">
                          ₹{(product.regularPrice / 100).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-raised rounded-xl border border-border">
            <h3 className="text-xl font-bold text-text-primary mb-2">No bikes found</h3>
            <p className="text-text-secondary">We couldn&apos;t find any bikes matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
