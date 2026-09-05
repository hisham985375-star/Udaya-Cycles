"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center section-padding">
      <div className="w-full max-w-md p-8 bg-surface-raised rounded-xl shadow-lg border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Welcome Back</h1>
          <p className="text-text-secondary">Log in to your Udaya Cycles account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-text-secondary" htmlFor="password">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-accent hover:text-accent-dim transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-bg font-bold py-3 px-4 rounded-md hover:bg-accent-dim transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <div className="spinner border-t-bg" />
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent font-medium hover:text-accent-dim transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
