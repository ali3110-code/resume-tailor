"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error.message);
        return;
      }
      if (data?.session?.user) {
        router.replace("/dashboard");
      }
    };

    checkSession();
  }, [router]);

  // Send magic link handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong.");
      } else {
        toast.success(data.message || "Check your email for the magic link ✨");
        localStorage.setItem("email", email);
      }
    } catch (err) {
      console.error("Magic link error:", err);
      toast.error("Unexpected error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="mt-10 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-md">
          Resume Tailor
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Tailor your resume to match your dream job ✨
        </p>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row items-center justify-center px-4 py-16">
        {/* Side Image */}
        <div className="hidden lg:block left-2">
          <Image
            src="/loginImage.jpg"
            alt="Login Visual"
            width={600}
            height={900}
            className="rounded-2xl object-cover shadow-2xl "
            priority
          />
        </div>

        {/* Login Form */}
        <div className="w-full h-full max-w-md">
          <form
            onSubmit={handleLogin}
            className="p-8 rounded-2xl bg-[#1a1a2e]/80 border border-indigo-800  shadow-[0_0_30px_rgba(99,102,241,0.2)] lg:shadow-none backdrop-blur-md space-y-6"
          >
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent drop-shadow mb-6 leading-tight">
              Login
            </h2>

            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-[#1e1e2f] border border-slate-700 text-white focus:border-indigo-400 focus:ring-indigo-400"
            />

            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#1e1e2f] border border-slate-700 text-white focus:border-indigo-400 focus:ring-indigo-400"
            />
            <p className="text-sm text-center text-slate-400 mb-4">
              Enter your name and email to receive a magic login link.
            </p>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
