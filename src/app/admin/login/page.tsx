"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed");
        return;
      }

      toast.success("Admin login successful");
      window.location.href = "/admin";
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md p-8 bg-surface-raised rounded-xl shadow-lg border border-border">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-surface mb-4">
            <span className="text-2xl font-display font-bold text-accent">UC</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Admin Control Panel</h1>
          <p className="text-text-secondary text-sm mt-1">Restricted Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="Admin Username"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
            />
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
            className="w-full bg-accent text-bg font-bold py-3 px-4 rounded-md hover:bg-accent-dim transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <div className="spinner border-t-bg" />
            ) : (
              "Log In to Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
