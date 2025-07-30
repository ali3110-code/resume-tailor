import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-black via-[#0e0e0e] to-[#1a1a1a] border-t border-[#facc15]/10 text-gray-400 text-sm">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>
          &copy; {new Date().getFullYear()} Resume Tailor. All rights reserved.
        </p>
        <div className="flex space-x-6">
          <Link href="" className="hover:text-[#facc15] transition">
            Privacy Policy
          </Link>
          <Link href="" className="hover:text-[#facc15] transition">
            Terms of Service
          </Link>
          <Link href="" className="hover:text-[#facc15] transition">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
