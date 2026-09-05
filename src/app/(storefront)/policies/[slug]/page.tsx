import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import LegalPage from "@/models/LegalPage";
import ReactMarkdown from "react-markdown";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  await connectDB();
  const page = await LegalPage.findOne({ key: params.slug }).lean();
  
  if (!page) {
    return { title: "Not Found | Udaya Cycles" };
  }

  return {
    title: `${page.title} | Udaya Cycles`,
    description: `Read the ${page.title} for Udaya Cycles.`,
  };
}

export default async function PolicyPage({ params }: { params: { slug: string } }) {
  await connectDB();
  const page = await LegalPage.findOne({ key: params.slug }).lean();

  if (!page) {
    notFound();
  }

  return (
    <main className="bg-bg min-h-screen pb-20">
      <div className="bg-surface border-b border-border py-12 px-4 text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-display font-black text-text-primary uppercase tracking-tighter mb-4">
          {page.title}
        </h1>
        <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">
          Last Updated: {new Date(page.lastUpdated).toLocaleDateString()}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-invert prose-p:text-text-secondary prose-headings:text-text-primary prose-a:text-accent max-w-none">
          <ReactMarkdown>
            {page.content}
          </ReactMarkdown>
        </div>
      </div>
    </main>
  );
}
