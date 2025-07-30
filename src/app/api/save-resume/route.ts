import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { fullName, resumeText, suggestionText, job_title, email } =
    await req.json();

  if (!email || !fullName || !resumeText || !suggestionText || !job_title) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Insert into resumes table
  const { data: resumeData, error: resumeError } = await supabase
    .from("resumes")
    .insert([
      {
        email,
        full_name: fullName,
        resume_text: resumeText,
      },
    ])
    .select("id") // I am fetching the inserted id
    .single();

  if (resumeError) {
    return NextResponse.json(
      { error: { resume: resumeError.message } },
      { status: 500 }
    );
  }

  const resumeId = resumeData.id;

  // 2. Insert into suggestions using resume_id and job_description
  const { error: suggestionError } = await supabase.from("suggestions").insert([
    {
      email,
      suggestion_text: suggestionText,
      job_title: job_title,
      resume_id: resumeId,
    },
  ]);

  if (suggestionError) {
    return NextResponse.json(
      { error: { suggestion: suggestionError.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
