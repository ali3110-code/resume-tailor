import { NextRequest, NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();

  if (!email || !name) {
    return NextResponse.json(
      { error: "Email and name are required" },
      { status: 400 }
    );
  }

  const supabase = createServerActionClient({ cookies });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/home`,
      data: { name },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else
    return NextResponse.json({
      message: "Check your email for the magic link.",
    });
}
