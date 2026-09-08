"use client";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, MapPin } from "lucide-react";
import UserMenu from "./UserMenu";
import NavLinks from "./NavLinks";



type Props = { session: any; loading: boolean };



export default function DesktopNav({ session, loading }: Props) {
  return (
    <>
      <style>{`
        @keyframes waBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
      <header className="hidden md:block bg-[#131921] text-white">
        {/* Top Navbar */}
        <div className="flex items-center px-4 py-2 gap-4">
          {/* Logo */}
          <Link href="/"
            className="flex items-center gap-3 border border-transparent hover:border-white rounded px-2 py-1 flex-shrink-0">
            <Image src="/logo.png" alt="HireVexa" width={38} height={38} className="rounded-full bg-white p-1" />
            <div>
              <h1 className="font-bold text-xl">HireVexa</h1>
              <p className="text-[10px] uppercase tracking-widest text-[#FF9900]">Consultancy</p>
            </div>
          </Link>

          {/* Serving */}
          <div className="hidden xl:flex items-center gap-2 border border-transparent hover:border-white rounded px-3 py-2 flex-shrink-0">
            <MapPin size={18} />
            <div>
              <p className="text-[10px] text-gray-300">Serving</p>
              <p className="font-semibold text-sm">Pan India</p>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          

          {/* User menu */}
          {loading ? (
            <div className="text-sm text-gray-400 flex-shrink-0">Loading...</div>
          ) : (
            <div className="flex-shrink-0">
              <UserMenu session={session} />
            </div>
          )}
        </div>

        {/* Bottom Navbar */}
        <div className="bg-[#232F3E]">
          <div className="max-w-7xl mx-auto flex items-center gap-6 px-4 py-2 text-sm">
            <button className="flex items-center gap-2 hover:text-[#FF9900] flex-shrink-0">
              <ChevronDown size={16} /> All
            </button>
            <NavLinks role={session?.user?.role} />
          </div>
        </div>
      </header>
    </>
  );
}