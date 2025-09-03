"use client"

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok) {
        toast.success(data.message || "If the email exists, check your inbox.");
        setEmail("");
      } else {
        toast.error(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-[400px] p-8">
      <h2 className="text-xl font-semibold mb-5 text-center">Forgot Password</h2>
      <p className="mb-4 text-gray-600 text-center">
        Provide your email to reset password
      </p>
      <form onSubmit={handleSubmit} className="space-y-5 w-full">
        <div className="w-full">
          <Label htmlFor="email" className="block mb-2">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="bg-[#edededed]  py-5"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <div className="flex gap-1 justify-center text-gray-600 mt-5">
        <p>Already have an account?</p>
        <Link href="/sign-in" className="text-gray-400 underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
