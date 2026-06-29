import Link from "next/link";

import Footer from "../components/Footer";
import {
  FileText, Search, CheckCircle, XCircle, Award,
  ArrowRight, ScanSearch, Users, Clock, Star, Zap
} from "lucide-react";

const mistakes = [
  "Poor formatting and layout",
  "ATS-incompatible resumes",
  "Weak project descriptions",
  "Missing industry keywords",
  "Generic career objectives",
  "Lack of measurable achievements",
  "Unprofessional presentation",
  "Overly lengthy resumes",
];

const features = [
  { icon: ScanSearch, title: "ATS Optimization", desc: "Ensure your resume passes Applicant Tracking Systems used by 90% of companies before a recruiter ever sees it." },
  { icon: Search, title: "Keyword Enhancement", desc: "Industry-relevant keywords strategically added to improve visibility and match job descriptions." },
  { icon: FileText, title: "Project Showcasing", desc: "Present academic and personal projects in a recruiter-friendly format that stands out." },
  { icon: Award, title: "Professional Formatting", desc: "Modern, clean layouts designed specifically for freshers and early-career candidates." },
];

const steps = [
  { num: "01", title: "Register with Ease", desc: "Create your HireVexa account and fill in your profile with your education and experience." },
  { num: "02", title: "Counsellor Review", desc: "Your dedicated counsellor reviews your profile and existing resume (if any) within 24 hours." },
  { num: "03", title: "Resume Built", desc: "Our team crafts an ATS-friendly, recruiter-approved resume tailored to your target roles." },
  { num: "04", title: "Review & Finalise", desc: "You review the resume, request changes, and get the final version ready to apply." },
];

export default function ResumeBuildingPage() {
  return (
    <div className="min-h-screen bg-white">
   

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a2332] via-[#232F3E] to-[#2d3f52] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#FF9900]/15 border border-[#FF9900]/25 text-[#FF9900] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-pulse" />
                Professional Resume Building
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
                A Resume Doesn&apos;t Get You A Job.
              </h1>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#FF9900] mb-5">
                It Gets You The Interview.
              </h2>
              <p className="text-gray-300 text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Most recruiters spend less than 10 seconds on a resume. We help you make those
                seconds count — with ATS-friendly, professionally crafted resumes that increase
                your interview calls.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/onboarding"
                  className="inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg hover:scale-[1.02]">
                  Get My Resume Built <ArrowRight size={16} />
                </Link>
                <Link href="/onboarding"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all">
                  Get Consultation
                </Link>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                ✓ Seamless for registered candidates &nbsp;✓ Delivered in 48hrs &nbsp;✓ Unlimited revisions
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-2xl">
                <FileText size={100} className="text-[#FF9900]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">The Process</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How We Build Your Resume</h2>
          <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">
            After you register, your counsellor handles everything. You just review and approve.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.num} className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl bg-[#232F3E] text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {s.num}
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FF9900] text-gray-900 text-xs font-bold flex items-center justify-center border-2 border-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/onboarding"
            className="inline-flex items-center gap-2 bg-[#232F3E] hover:bg-[#1a2332] text-white font-bold px-8 py-3.5 rounded-xl text-sm transition shadow-sm">
            Start Now — It&apos;s <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">The Difference</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Most Resumes Get Rejected</h2>
            <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">
              75% of resumes are rejected by ATS before a human even reads them.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <XCircle size={20} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Typical DIY Resume</h3>
              </div>
              <ul className="space-y-3">
                {["Generic objective statement","No ATS optimization","Weak project descriptions","Poor formatting","Missing keywords","No measurable achievements"].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-500">
                    <span className="text-red-400 font-bold flex-shrink-0">✕</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle size={20} className="text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">HireVexa Resume</h3>
              </div>
              <ul className="space-y-3">
                {["ATS optimized & tested","Recruiter-friendly layout","Strong project presentation","Industry keywords included","Clean professional formatting","Achievement-focused content"].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <span className="text-emerald-500 font-bold flex-shrink-0">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">What&apos;s Included</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Resume Transformation Services</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map(f => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition group">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-[#FF9900] transition">
                <f.icon size={22} className="text-[#FF9900] group-hover:text-gray-900 transition" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mistakes */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">Common Problems</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Resume Mistakes We Fix</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {mistakes.map(item => (
              <div key={item} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                  <Search size={16} className="text-[#FF9900]" />
                </div>
                <p className="text-sm font-semibold text-gray-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[
            { value: "48hrs", label: "Delivery Time", icon: Clock },
            { value: "840+", label: "Resumes Built", icon: Users },
            { value: "3x", label: "More Interview Calls", icon: Zap },
            { value: "4.9★", label: "Candidate Rating", icon: Star },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                <s.icon size={18} className="text-[#FF9900]" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-gradient-to-br from-[#232F3E] to-[#1a2332] text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <FileText size={32} className="text-[#FF9900] mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Turn Your Resume Into an Interview Magnet</h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto text-sm">
              Register now and your counsellor will reach out within 24 hours to start building your resume.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/onboarding"
                className="inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold px-10 py-4 rounded-xl text-sm transition-all shadow-lg hover:scale-[1.02]">
                Get My Resume Built <ArrowRight size={16} />
              </Link>
              <Link href="/dashboard/resume"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-10 py-4 rounded-xl text-sm transition-all">
                Upload Existing Resume
              </Link>
            </div>
            <p className="mt-4 text-gray-500 text-xs">Seamless for all registered candidates · No hidden charges</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}