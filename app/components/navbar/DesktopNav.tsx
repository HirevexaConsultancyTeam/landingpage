"use client";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, MapPin } from "lucide-react";
import UserMenu from "./UserMenu";
import NavLinks from "./NavLinks";

const WA_LINK = "https://www.whatsapp.com/channel/0029VbAriUBAYlUBEhYmSX3X";

type Props = { session: any; loading: boolean };

function WhatsAppButton() {
  return (
    <a
      href={WA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      title="Join our WhatsApp Channel"
      className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bc5a] text-white text-xs font-bold px-3 py-2 rounded-lg transition-all flex-shrink-0"
      style={{ animation: "waBounce 2s ease-in-out infinite" }}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white flex-shrink-0">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.535 5.847L.057 23.215a.75.75 0 00.925.926l5.368-1.478A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.506-5.23-1.389l-.374-.217-3.876 1.067 1.067-3.876-.217-.374A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      <span className="hidden xl:inline">WhatsApp</span>
    </a>
  );
}

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

          {/* WhatsApp */}
          <WhatsAppButton />

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