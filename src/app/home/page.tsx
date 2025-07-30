"use client";

import Link from "next/link";
import Navbar from "@/components/ui/navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-30 bg-black text-white flex flex-col items-center justify-center px-6 py-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-center bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-6 drop-shadow-md">
          Welcome to Resume Tailor
        </h1>

        <p className="text-lg md:text-xl text-slate-300 text-center max-w-2xl mb-10 leading-relaxed">
          Instantly tailor your resume to match job descriptions with smart AI
          insights. Highlight strengths, align keywords, and increase your
          chances — all in seconds.
        </p>

        <Link href="/dashboard">
          <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300">
            Get Started
          </button>
        </Link>

        {/* Guide Section */}
        <section className="mt-24 max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-10 rounded-3xl shadow-xl border border-indigo-600">
            <h2 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-2">
              <span className="text-indigo-300">🔍</span> How to Use
            </h2>
            <ol className="list-decimal list-inside space-y-6 text-slate-100 text-lg leading-relaxed">
              <li>
                Click the
                <span className="text-white font-semibold"> Get Started </span>
                button to access your personalized dashboard.
              </li>
              <li>
                Upload your resume file in
                <span className="text-white font-semibold"> .pdf format</span>.
              </li>
              <li>
                {` Provide the job role or description you're applying for.`}
              </li>
              <li>
                Let our AI intelligently enhance your resume based on your
                input.
              </li>
              <li>Download your optimized resume and apply with confidence!</li>
            </ol>
          </div>
        </section>
      </main>
    </>
  );
}
