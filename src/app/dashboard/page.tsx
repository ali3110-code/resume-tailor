"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/ui/navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import jsPDF from "jspdf";

interface ParsedSuggestion {
  id: string;
  created_at: string;
  job_title: string;
  full_name: string;
  sections: {
    [key: string]: string;
  };
}

export default function Dashboard() {
  const [collapse, setCollapse] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [parsedSuggestions, setParsedSuggestions] = useState<
    ParsedSuggestion[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserName = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/");
        return;
      }

      const fullName = user.user_metadata?.name || "User";
      const first = fullName.trim().split(" ")[0];
      setFirstName(first);
    };

    fetchUserName();
  }, [router]);

  const parseSuggestionText = (text: string): { [key: string]: string } => {
    const sections: { [key: string]: string } = {};
    const regex =
      /^(Summary|Skills to Add|Experience to Add|Projects to Add|General Suggestions):/gim;
    const parts = text
      .split(regex)
      .map((p) => p.trim())
      .filter(Boolean);

    for (let i = 0; i < parts.length; i += 2) {
      const key = parts[i];
      const value = parts[i + 1];
      if (key && value) {
        sections[key] = value;
      }
    }
    return sections;
  };

  const fetchUserAndSuggestions = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      router.push("/");
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("suggestions")
      .select("id, suggestion_text, created_at, job_title, resumes(full_name)")
      .eq("email", user.email)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching suggestions:", fetchError);
    } else if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed = data.map((s: any) => ({
        id: s.id,
        created_at: s.created_at,
        job_title: s.job_title,
        full_name: s.resumes?.full_name || "Unknown",
        sections: parseSuggestionText(s.suggestion_text),
      }));
      setParsedSuggestions(parsed);
    }
  };

  const toggleCollapse = () => {
    if (!collapse && parsedSuggestions.length === 0) {
      fetchUserAndSuggestions();
    }
    setCollapse(!collapse);
  };

  const generatePDF = (suggestion: ParsedSuggestion) => {
    const doc = new jsPDF();
    const date = dayjs(suggestion.created_at).format("MMMM D, YYYY");

    let y = 10;
    doc.setFontSize(16);
    doc.text("Resume Suggestion Report", 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Name: ${suggestion.full_name}`, 10, y);
    y += 8;
    doc.text(`Job Title: ${suggestion.job_title}`, 10, y);
    y += 8;
    doc.text(`Created At: ${date}`, 10, y);
    y += 10;

    Object.entries(suggestion.sections).forEach(([section, content]) => {
      if (y >= 270) {
        doc.addPage();
        y = 10;
      }

      doc.setFontSize(13);
      doc.text(section, 10, y);
      y += 7;

      doc.setFontSize(11);
      const lines = doc.splitTextToSize(content, 180);
      lines.forEach((line: string | string[]) => {
        if (y >= 280) {
          doc.addPage();
          y = 10;
        }
        doc.text(line, 10, y);
        y += 6;
      });

      y += 5;
    });

    const safeName = suggestion.full_name.replace(/\s+/g, "_");
    const safeJob = suggestion.job_title.replace(/\s+/g, "_");
    doc.save(`${safeName}-${safeJob}.pdf`);
  };

  return (
    <>
      <Navbar />
      <div className="pt-20 min-h-screen bg-black text-slate-200">
        <main className="flex-1 px-6 py-10">
          <h2 className="text-4xl text-center font-bold mb-2">
            <span className="inline-block bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome, {firstName}
            </span>{" "}
            👋
          </h2>

          <p className="text-slate-400 text-center mb-10">
            This is your personalized dashboard.
          </p>

          <div className="flex flex-col gap-6">
            {/* Upload Resume */}
            <div className="bg-black border border-indigo-500/50 p-6 rounded-2xl hover:shadow-xl hover:border-indigo-400 transition-all">
              <h3 className="text-xl font-semibold mb-2 text-slate-100">
                🎯 Upload Resume
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Get suggestions to better align your resume with a specific job
                description.
              </p>
              <Link href="/uploadResume">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300">
                  Upload Now
                </Button>
              </Link>
            </div>

            {/* Saved Suggestions */}
            <div className="flex flex-col relative bg-black border border-indigo-500/50 p-6 rounded-2xl hover:shadow-xl hover:border-indigo-400 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-100">
                    📄 Saved Suggestions
                  </h3>
                  <p className="text-slate-400 text-sm mt-2">
                    Download your previous resume suggestions as PDF files.
                  </p>
                </div>

                <button
                  onClick={toggleCollapse}
                  className={`text-2xl text-indigo-400 hover:text-indigo-300 transform transition-transform duration-300 ${
                    collapse ? "rotate-180" : "rotate-90"
                  }`}
                  aria-label="Toggle Suggestions"
                >
                  ▲
                </button>
              </div>

              {/* Collapsible Content */}
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  collapse ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="max-h-[500px] overflow-y-auto space-y-6 mt-2 pr-2">
                  {parsedSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="p-4 bg-[#1a1a2e] text-sm text-slate-300 border border-indigo-700/50 rounded-xl space-y-3"
                    >
                      <div className="text-xs text-slate-400">
                        📅 {dayjs(suggestion.created_at).format("MMMM D, YYYY")}
                      </div>

                      <div className="text-sm">
                        <span className="text-indigo-400 font-semibold">
                          👤 Resume of:
                        </span>{" "}
                        {suggestion.full_name}
                      </div>

                      <div className="text-sm">
                        <span className="text-indigo-400 font-semibold">
                          🧑‍💼 Job Title:
                        </span>{" "}
                        {suggestion.job_title}
                      </div>

                      <Button
                        onClick={() => generatePDF(suggestion)}
                        className="mt-2 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white hover:scale-105 transition-transform duration-300"
                      >
                        Download PDF
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
