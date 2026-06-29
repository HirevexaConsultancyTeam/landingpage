"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { signOut } from "next-auth/react";

const WA_LINK = "https://www.whatsapp.com/channel/0029VbAriUBAYlUBEhYmSX3X";

type Props = { session: any; loading: boolean };

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.535 5.847L.057 23.215a.75.75 0 00.925.926l5.368-1.478A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.506-5.23-1.389l-.374-.217-3.876 1.067 1.067-3.876-.217-.374A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  );
}

export default function MobileNav({ session, loading }: Props) {
  const [open, setOpen] = useState(false);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <>
      <style>{`
        @keyframes waBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .wa-bounce { animation: waBounce 2s ease-in-out infinite; }
      `}</style>

      {/* Mobile Header */}
      <header className="md:hidden bg-[#131921] text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="HireVexa" className="h-9 w-9 rounded-full bg-white p-1" />
            <div>
              <h2 className="font-bold">HireVexa</h2>
              <p className="text-[10px] text-[#FF9900] uppercase">Consultancy</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* WhatsApp button in header */}
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              title="Join our WhatsApp Channel"
              className="wa-bounce w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0"
            >
              <WhatsAppIcon />
            </a>
            <button onClick={() => setOpen(!open)} className="p-1">
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer */}
      {open && (
        <div className="md:hidden bg-[#232F3E] text-white shadow-xl">
          {/* Greeting */}
          <div className="border-b border-[#37475A] px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FF9900] flex items-center justify-center">
                <User className="text-[#131921]" />
              </div>
              <div>
                {loading ? (
                  <p>Loading...</p>
                ) : session ? (
                  <>
                    <p className="text-xs text-gray-300">{isAdmin ? "Hello," : "Welcome,"}</p>
                    <h3 className="font-bold">{session.user.name}</h3>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">Hello Guest</p>
                    <Link href="/login" className="text-[#FF9900] text-sm">Sign In</Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col">
            {session ? (
              <>
                <Link href={isAdmin ? "/admin" : "/dashboard"} className="px-5 py-4 hover:bg-[#37475A]" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                {isAdmin ? (
                  <>
                    <Link href="/admin/jobs" className="px-5 py-4 hover:bg-[#37475A]" onClick={() => setOpen(false)}>Jobs</Link>
                    <Link href="/admin/candidates" className="px-5 py-4 hover:bg-[#37475A]" onClick={() => setOpen(false)}>Candidates</Link>
                    <Link href="/admin/applications" className="px-5 py-4 hover:bg-[#37475A]" onClick={() => setOpen(false)}>Applications</Link>
                    <Link href="/admin/analytics" className="px-5 py-4 hover:bg-[#37475A]" onClick={() => setOpen(false)}>Analytics</Link>
                  </>
                ) : (
                  <>
                    <Link href="/jobs" className="px-5 py-4 hover:bg-[#37475A]" onClick={() => setOpen(false)}>Jobs</Link>
                    <Link href="/dashboard/applications" className="px-5 py-4 hover:bg-[#37475A]" onClick={() => setOpen(false)}>Applications</Link>
                    <Link href="/dashboard/resume" className="px-5 py-4 hover:bg-[#37475A]" onClick={() => setOpen(false)}>Resume</Link>
                    <Link href="/dashboard/profile" className="px-5 py-4 hover:bg-[#37475A]" onClick={() => setOpen(false)}>Profile</Link>
                  </>
                )}
                <button onClick={() => signOut()} className="text-left px-5 py-4 text-red-400 hover:bg-[#37475A]">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-5 py-4 hover:bg-[#37475A]" onClick={() => setOpen(false)}>Login</Link>
                <Link href="/onboarding" className="px-5 py-4 hover:bg-[#37475A]" onClick={() => setOpen(false)}>Register</Link>
                <Link href="/jobs" className="px-5 py-4 hover:bg-[#37475A]" onClick={() => setOpen(false)}>Jobs</Link>
                <Link href="/about" className="px-5 py-4 hover:bg-[#37475A]" onClick={() => setOpen(false)}>About</Link>
              </>
            )}

            {/* WhatsApp in drawer */}
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-4 border-t border-[#37475A] hover:bg-[#37475A] transition"
            >
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <WhatsAppIcon />
              </div>
              <div>
                <p className="font-semibold text-sm">Join WhatsApp Channel</p>
                <p className="text-xs text-gray-400">Get updates & job alerts</p>
              </div>
            </a>
          </div>
        </div>
      )}
    </>
  );
}