"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <style>{`
        @keyframes waBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full bg-[#37475A] text-white py-3 text-xs sm:text-sm hover:bg-[#485769] transition-colors text-center block"
      >
        ↑ Back to top
      </button>

      {/* Main footer */}
      <div className="bg-[#232F3E] text-white py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Logo — mobile only */}
          <div className="flex flex-col items-center mb-6 sm:hidden">
            <div className="flex items-center gap-2 mb-1">
              <img src="/logo.png" alt="HireVexa Logo" className="h-8 w-8 object-contain rounded-full bg-white p-0.5" />
              <span className="text-white font-bold text-lg">HireVexa</span>
              <span className="text-[#FF9900] text-[10px] font-semibold tracking-widest uppercase">Consultancy</span>
            </div>
            <p className="text-[#AAAAAA] text-[10px] text-center">India's Fresher Career Partner</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">

            {/* Company */}
            <div>
              <h4 className="font-bold text-xs sm:text-sm mb-3 text-white">Company</h4>
              <ul className="space-y-2 text-[#DDDDDD] text-xs sm:text-sm">
                <li><Link href="/about" className="hover:text-white hover:underline">About HireVexa</Link></li>
                <li><Link href="/jobs" className="hover:text-white hover:underline">Browse Jobs</Link></li>
                <li><Link href="/courses" className="hover:text-white hover:underline">Skill Courses</Link></li>
                <li><Link href="/onboarding" className="hover:text-white hover:underline">Get Placed</Link></li>
                <li><Link href="/services" className="hover:text-white hover:underline">Other Services</Link></li>
              </ul>
            </div>

            {/* Candidates */}
            <div>
              <h4 className="font-bold text-xs sm:text-sm mb-3 text-white">For Candidates</h4>
              <ul className="space-y-2 text-[#DDDDDD] text-xs sm:text-sm">
                <li><Link href="/onboarding" className="hover:text-white hover:underline">Easy Register</Link></li>
                <li><Link href="/dashboard/resume" className="hover:text-white hover:underline">Upload Resume</Link></li>
                <li><Link href="/dashboard/profile" className="hover:text-white hover:underline">Edit Profile</Link></li>
                <li><Link href="/dashboard" className="hover:text-white hover:underline">My Dashboard</Link></li>
                <li><Link href="/dashboard/courses" className="hover:text-white hover:underline">My Courses</Link></li>
              </ul>
            </div>

            {/* Learn */}
            <div>
              <h4 className="font-bold text-xs sm:text-sm mb-3 text-white">Learn & Grow</h4>
              <ul className="space-y-2 text-[#DDDDDD] text-xs sm:text-sm">
                <li><Link href="/courses" className="hover:text-white hover:underline">All Courses</Link></li>
                <li><Link href="/jobs" className="hover:text-white hover:underline">Latest Jobs</Link></li>
                <li><Link href="/resume-building" className="hover:text-white hover:underline">Resume Building</Link></li>
                <li><Link href="/job-placement" className="hover:text-white hover:underline">Job Placement</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-xs sm:text-sm mb-3 text-white">Support</h4>
              <ul className="space-y-2 text-[#DDDDDD] text-xs sm:text-sm">
                <li><Link href="/login" className="hover:text-white hover:underline">Sign In</Link></li>
                <li><Link href="/onboarding" className="hover:text-white hover:underline">Create Account</Link></li>
                <li>
                  <a href="mailto:hirevexaconsultancy@gmail.com" className="hover:text-white hover:underline">
                    Email Support
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.whatsapp.com/channel/0029VbAriUBAYlUBEhYmSX3X"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline"
                  >
                    WhatsApp Channel
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Divider */}
          <div className="border-t border-[#37475A] mt-8 pt-6">

            {/* Contact strip */}
<div className="text-[#AAAAAA] text-[10px] sm:text-xs mb-4 text-center">
  <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-2">
    <a href="mailto:hirevexaconsultancy@gmail.com" className="hover:text-white transition">
      📧 hirevexaconsultancy@gmail.com
    </a>
    <span>🕐 Mon–Fri, 9am–5pm IST</span>
  </div>

  <p className="max-w-3xl mx-auto px-2">
    📍 Office No. 214, Durga Tower, Behind Gaur Central Mall, RDC, Block 1, P & T Colony, Raj Nagar, Ghaziabad, Uttar Pradesh 201002
  </p>
</div>

            {/* Social links */}
            <div className="flex justify-center gap-3 mb-2">
              {[
                { label: "LinkedIn", href: "https://linkedin.com/company/hirevexa", icon: "in", wa: false },
                { label: "Instagram", href: "https://instagram.com/hirevexa", icon: "ig", wa: false },
                { label: "YouTube", href: "https://youtube.com/@hirevexa", icon: "yt", wa: false },
                { label: "WhatsApp", href: "https://www.whatsapp.com/channel/0029VbAriUBAYlUBEhYmSX3X", icon: "wa", wa: true },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors text-white ${
                    s.wa
                      ? "bg-[#25D366] hover:bg-[#20bc5a]"
                      : "bg-[#37475A] hover:bg-[#FF9900] hover:text-[#131921]"
                  }`}
                  style={s.wa ? { animation: "waBounce 2s ease-in-out infinite" } : {}}
                >
                  {s.wa ? (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.535 5.847L.057 23.215a.75.75 0 00.925.926l5.368-1.478A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.506-5.23-1.389l-.374-.217-3.876 1.067 1.067-3.876-.217-.374A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                  ) : s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#131921] py-4 sm:py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">

          <div className="hidden sm:flex items-center gap-2">
            <img src="/logo.png" alt="HireVexa Logo" className="h-7 w-7 object-contain rounded-full bg-white p-0.5" />
            <span className="text-white font-bold text-base">HireVexa</span>
            <span className="text-[#FF9900] text-[10px] font-semibold tracking-widest uppercase">Consultancy</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-[#DDDDDD] text-[10px] sm:text-xs">
            <Link href="/about" className="hover:text-white hover:underline">About</Link>
            <Link href="/jobs" className="hover:text-white hover:underline">Jobs</Link>
            <Link href="/courses" className="hover:text-white hover:underline">Courses</Link>
            <Link href="/login" className="hover:text-white hover:underline">Login</Link>
            <span className="text-[#37475A]">·</span>
            <Link href="/privacy-policy" className="hover:text-white hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white hover:underline">Terms & Conditions</Link>
            <Link href="/refund-policy" className="hover:text-white hover:underline">Refund Policy</Link>
          </div>

          <p className="text-[#AAAAAA] text-[10px] sm:text-xs text-center">
            © 2026 HireVexa Consultancy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}