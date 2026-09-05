"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          // Validation errors
          const firstError = Object.values(data.details)[0] as string[];
          toast.error(firstError[0] || "Validation failed");
        } else {
          toast.error(data.error || "Registration failed");
        }
        return;
      }

      toast.success("Account created successfully!");
      
      // Auto-login after registration
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (!loginRes?.error) {
        router.push("/account");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center section-padding">
      <div className="w-full max-w-md p-8 bg-surface-raised rounded-xl shadow-lg border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Create Account</h1>
          <p className="text-text-secondary">Join Udaya Cycles today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="w-full bg-surface border border-border rounded-md px-4 py-2 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="w-full bg-surface border border-border rounded-md px-4 py-2 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full bg-surface border border-border rounded-md px-4 py-2 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="phone">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                +91
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                pattern="[6-9]\d{9}"
                title="Enter a valid 10-digit mobile number"
                className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full bg-surface border border-border rounded-md px-4 py-2 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <p className="text-xs text-text-muted mt-1">Must be at least 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-bg font-bold py-3 px-4 rounded-md hover:bg-accent-dim transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <div className="spinner border-t-bg" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent font-medium hover:text-accent-dim transition-colors">
            Log in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
