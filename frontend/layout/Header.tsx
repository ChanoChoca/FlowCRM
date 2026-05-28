"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Planes", href: "#planes" },
    { name: "TV", href: "#tv" },
    { name: "Beneficios", href: "#beneficios" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-[100] bg-gradient-to-r from-[#0b1120fa] to-[#0f172afa] py-4 border-b border-[#8b5cf614] shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
      <div className="w-[90%] max-w-[90%] mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-[18px] font-bold tracking-[-0.3px] bg-gradient-to-br from-[#a78bfa] to-[#a5f3fc] bg-clip-text text-transparent"
        >
          FlowCRM
        </Link>

        <nav aria-label="Menú principal">
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2 border border-white/5 rounded-lg cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
          >
            <span
              className={`h-[2px] w-5 bg-[#cbd5e1] transition-all ${isOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`h-[2px] w-5 bg-[#cbd5e1] transition-all ${isOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-[2px] w-5 bg-[#cbd5e1] transition-all ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>

          <ul
            className={`
            fixed lg:static top-16 right-4 left-4 lg:w-auto bg-gradient-to-b from-[#050814f2] to-[#0f172af2] lg:from-transparent lg:to-transparent
            flex flex-col lg:flex-row items-center gap-4 lg:gap-7 p-6 lg:p-0 rounded-[10px] lg:rounded-none
            border border-[#8b5cf614] lg:border-none shadow-2xl lg:shadow-none
            transition-all duration-300
            ${isOpen ? "translate-y-0 opacity-100 visible" : "-translate-y-10 opacity-0 invisible lg:opacity-100 lg:visible lg:translate-y-0"}
          `}
          >
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-[14px] text-[#cbd5e1] hover:text-[#a5f3fc] font-medium tracking-[0.2px] transition-all hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="#formulario"
                className="bg-gradient-to-br from-[#7c3aed] to-[#6366f1] text-white px-[32px] py-[12px] rounded-md font-semibold text-[14px] tracking-[0.3px] shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all"
              >
                Contratar
              </Link>
            </li>
            <li>
              <Link
                href="/crm"
                className="group flex py-3 px-5 text-sm text-white bg-[#7c3aed] transform duration-1000 shadow-[6px_6px_0_black] -skew-x-15 hover:shadow-[8px_8px_0_#6366f1] hover:duration-500"
              >
                <span className="duration-500 group-hover:ml-8">CRM</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
