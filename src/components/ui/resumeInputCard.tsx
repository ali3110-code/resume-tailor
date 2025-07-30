"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResumeInputCard() {
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [parsedSuggestions, setParsedSuggestions] = useState<null | {
    summary: string;
    skills_to_add: string[];
    experience_to_add: string[];
    projects_to_add: string[];
    general_suggestions: string[];
  }>(null);

  const getProgress = () => {
    let progress = 0;
    if (jobDescription.trim()) progress += 33;
    if (file) progress += 33;
    if (showClear) progress = 100;
    else if (loading) progress += 34;
    return progress;
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
    }
  };

  const clearForm = () => {
    setJobDescription("");
    setFile(null);
    setFileName(null);
    setShowClear(false);
    setShowSuggestions(false);
    setParsedSuggestions(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.success("Please upload a resume file.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);

      const webhookUrl =
        "https://ali-shahid-workflow.app.n8n.cloud/webhook/resume-tailor";

      const res = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Webhook failed");

      const result = await res.json();
      const rawText = result[0].text;
      const start = rawText.indexOf("{");
      const end = rawText.lastIndexOf("}");

      let parsed;
      if (start !== -1 && end !== -1 && end > start) {
        const jsonSubstring = rawText.slice(start, end + 1);
        parsed = JSON.parse(jsonSubstring);
      } else {
        throw new Error("Invalid JSON response");
      }

      const resumeText = parsed.resume_text;
      const fullName = parsed.resume_name;
      const createdAt = new Date().toISOString();
      const suggestions = parsed.suggestion_text;
      const jobTitle = parsed.job_title;

      setParsedSuggestions(suggestions);
      setTimeout(() => {
        setShowSuggestions(true);
        setShowClear(true);
      }, 2000);

      const suggestionText = `
Summary:
${suggestions.summary}

Skills to Add:
${suggestions.skills_to_add.join(", ")}

Experience to Add:
${suggestions.experience_to_add.join(", ")}

Projects to Add:
${suggestions.projects_to_add.join(", ")}

General Suggestions:
${suggestions.general_suggestions.join(", ")}
`.trim();

      // Save to MongoDB
      await fetch("/api/save-resume-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fullName,
          createdAt,
          type: "pdf",
          text: resumeText,
        }),
      });

      // Save to Supabase
      const supabaseRes = await fetch("/api/save-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName,
          resumeText,
          suggestionText,
          email: userEmail,
          job_title: jobTitle,
        }),
      });

      if (!supabaseRes.ok) {
        const errText = await supabaseRes.text();
        throw new Error(`Supabase save failed: ${errText}`);
      }

      toast.success("Resume processed and saved successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong while processing your resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-black border border-indigo-500/50 p-8 rounded-xl hover:shadow-xl transition-all w-full max-w-6xl mx-auto mt-10">
      <h3 className="text-2xl font-semibold text-indigo-100 mb-4">
        💼 Job Description
      </h3>

      <textarea
        rows={6}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="w-full p-4 rounded-lg bg-black text-indigo-100 border border-indigo-500/40 resize-none hover:border-indigo-400 transition-all"
        placeholder="Paste job description here..."
      />

      <div className="mt-6">
        <label
          htmlFor="resume-upload"
          className="block cursor-pointer rounded-lg border-2 border-dashed border-indigo-500 p-5 text-center text-sm text-indigo-300 hover:border-cyan-400 hover:text-cyan-300 transition duration-300"
        >
          <span className="block text-base font-semibold mb-1">
            Upload Resume ⬇
          </span>
          <span className="text-xs text-gray-400">Supported formats: .pdf</span>
          <Input
            id="resume-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {fileName && (
          <p className="mt-2 text-sm text-indigo-300 text-center">
            📄 <span className="font-medium">Uploaded:</span> {fileName}
          </p>
        )}
      </div>

      <div className="mt-8">
        <Progress
          value={getProgress()}
          className="h-3 border border-indigo-500/50 w-full bg-black relative overflow-hidden"
        />
        <p className="text-xs text-indigo-300 text-right mt-1">
          {getProgress()}% Complete
        </p>
      </div>

      {loading && !showSuggestions && (
        <div className="mt-6 text-center">
          <p className="text-indigo-300 text-lg animate-pulse">
            Generating suggestions...
          </p>
        </div>
      )}

      {showSuggestions && parsedSuggestions && (
        <div className="mt-10 space-y-6 text-indigo-100 flex flex-col items-center">
          <h4 className="text-2xl font-semibold">📋 Tailored Suggestions</h4>

          <Carousel className="w-full max-w-3xl">
            <CarouselContent className="h-[350px]">
              {/* Skills */}
              <CarouselItem className="flex items-center justify-center">
                <div className="w-full text-center p-6 bg-zinc-900/50 border border-indigo-500 rounded-xl">
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4">
                    Skills to Add
                  </h2>
                  <ul className="list-disc list-inside text-lg text-cyan-100 space-y-1">
                    {parsedSuggestions.skills_to_add.map((skill, i) => (
                      <li key={i}>{skill}</li>
                    ))}
                  </ul>
                </div>
              </CarouselItem>

              {/* Experience */}
              <CarouselItem className="flex items-center justify-center">
                <div className="w-full text-center p-6 bg-zinc-900/50 border border-indigo-500 rounded-xl">
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4">
                    Experience to Add
                  </h2>
                  <ul className="list-disc list-inside text-lg text-cyan-100 space-y-1">
                    {parsedSuggestions.experience_to_add.map((exp, i) => (
                      <li key={i}>{exp}</li>
                    ))}
                  </ul>
                </div>
              </CarouselItem>

              {/* Projects */}
              <CarouselItem className="flex items-center justify-center">
                <div className="w-full text-center p-6 bg-zinc-900/50 border border-indigo-500 rounded-xl">
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4">
                    Projects to Add
                  </h2>
                  <ul className="list-disc list-inside text-lg text-cyan-100 space-y-1">
                    {parsedSuggestions.projects_to_add.map((proj, i) => (
                      <li key={i}>{proj}</li>
                    ))}
                  </ul>
                </div>
              </CarouselItem>

              {/* General Suggestions */}
              <CarouselItem className="flex items-center justify-center">
                <div className="w-full text-center p-6 bg-zinc-900/50 border border-indigo-500 rounded-xl">
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4">
                    General Suggestions
                  </h2>
                  <ul className="list-disc list-inside text-lg text-cyan-100 space-y-1">
                    {parsedSuggestions.general_suggestions.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </CarouselItem>

              {/* Summary */}
              <CarouselItem className="flex items-center justify-center">
                <div className="w-full text-center p-6 bg-zinc-900/50 border border-indigo-500 rounded-xl">
                  <h2 className="text-3xl font-extrabold text-cyan-300 mb-4">
                    🔍 Summary
                  </h2>
                  <p className="text-xl text-cyan-100 leading-relaxed max-w-2xl mx-auto">
                    {parsedSuggestions.summary}
                  </p>
                </div>
              </CarouselItem>
            </CarouselContent>

            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-10">
        {showClear && (
          <Button
            onClick={clearForm}
            variant="outline"
            className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white hover:scale-105 transition-transform"
          >
            Clear
          </Button>
        )}
        {!showSuggestions && (
          <Button
            onClick={() => {
              if (!loading && file) {
                handleSubmit();
              }
            }}
            disabled={loading || !file}
            className={`bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white transition-transform ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            {loading ? "Generating..." : "Get Suggestions 🌟"}
          </Button>
        )}
      </div>
    </section>
  );
}
