"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }) 
      });
      
      if (!res.ok) {
        throw new Error("Failed to send reset link");
      }
      
      setIsSubmitted(true);
      toast.success("Password reset link sent to your email!");
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center section-padding">
      <div className="w-full max-w-md p-8 bg-surface-raised rounded-xl shadow-lg border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Reset Password</h1>
          <p className="text-text-secondary">
            {isSubmitted 
              ? "Check your email for a link to reset your password."
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {!isSubmitted ? (
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-accent text-sm hover:underline"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-text-secondary">
          Remember your password?{" "}
          <Link href="/login" className="text-accent font-medium hover:text-accent-dim transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
