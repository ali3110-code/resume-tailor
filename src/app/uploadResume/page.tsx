"use client";

import Navbar from "@/components/ui/navbar";
import ResumeInputCard from "@/components/ui/resumeInputCard";

export default function uploadResume() {
  return (
    <>
      <Navbar />
      <div className="pt-22 min-h-screen bg-black text-white flex flex-col">
        <main className="flex-1 px-6 py-10 text-center">
          <h2 className="text-4xl font-bold inline-block mb-2 bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent drop-shadow leading-tight">
            Resume Tailoring
          </h2>
          <p className="text-gray-300 mb-10">
            Provide your resume and the job description to receive tailored
            suggestions.
          </p>

          <ResumeInputCard />
        </main>
      </div>
    </>
  );
}
