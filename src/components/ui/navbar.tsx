"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/home" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Upload", href: "/uploadResume" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-black border-b border-indigo-500/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <h1 className="p-1 text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-indigo-100 rounded-3xl">
              RT
            </h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`px-4 py-2 rounded transition duration-200 ${
                    pathname === item.href
                      ? "text-indigo-400 border-b-2 border-indigo-400"
                      : "text-white hover:text-indigo-400"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
            <Link href="/">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition duration-200">
                Logout
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <X className="text-white w-6 h-6" />
              ) : (
                <Menu className="text-white w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                <span
                  className={`block px-4 py-2 rounded ${
                    pathname === item.href
                      ? "text-indigo-400 border-l-4 border-indigo-400 bg-[#1f2937]"
                      : "text-white hover:text-indigo-400 hover:bg-[#1f2937]"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
            <Link href="/" onClick={() => setIsOpen(false)}>
              <span className="block bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
                Logout
              </span>
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
