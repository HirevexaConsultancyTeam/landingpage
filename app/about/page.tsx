import type { Metadata } from "next";
import Link from "next/link";
import {
  Users, Briefcase, Target, Eye, Award, GraduationCap,
  TrendingUp, Building2, CheckCircle, ArrowRight,
} from "lucide-react";
import Footer from "../components/Footer";
import { OrganizationJsonLd, ServiceJsonLd } from "../../components/JsonLd";

export const metadata: Metadata = {
  title: "About Us | HireVexa Job Placement Consultancy India",
  description: "Learn about HireVexa Consultancy — India's trusted job placement agency for freshers. We offer resume building, interview prep, and direct job referrals to 45+ companies. Pan India service.",
  keywords: ["about HireVexa", "job placement agency India", "career consultancy India", "fresher placement agency", "job consultant India"],
  openGraph: {
    title: "About HireVexa | India's Trusted Placement Consultancy",
    description: "Learn how HireVexa helps freshers get placed in top companies with personalised counselling and placement support.",
    url: "https://hirevexaconsultancy.in/about",
  },
  alternates: { canonical: "https://hirevexaconsultancy.in/about" },
};

const stats = [
  { number: "840+", label: "Freshers Placed", icon: Users },
  { number: "45+", label: "Hiring Partners", icon: Building2 },
  { number: "87%", label: "Success Rate", icon: TrendingUp },
  { number: "1.8x", label: "Average Salary Growth", icon: Award },
];

const values = [
  { title: "Student First", description: "Every decision we make revolves around helping students achieve meaningful career growth." },
  { title: "Transparency", description: "We believe in honest guidance, realistic expectations, and complete transparency." },
  { title: "Industry Alignment", description: "Our programs are designed according to real industry requirements and hiring trends." },
  { title: "Long-Term Success", description: "We focus on building careers, not just securing the first job offer." },
];

const process = [
  { step: "01", title: "Registration & Profile Analysis", description: "Register free, upload your resume, and complete your career profile with education and skills." },
  { step: "02", title: "Career Counselling", description: "Your dedicated counsellor identifies your strengths, goals, and the most suitable opportunities." },
  { step: "03", title: "Resume & Interview Preparation", description: "Professional resume building, mock interviews, aptitude training, and communication coaching." },
  { step: "04", title: "Job Matching & Applications", description: "We apply to a minimum of 3 companies on your behalf from our network of 45+ hiring partners." },
  { step: "05", title: "Offer & Joining Support", description: "We assist with offer negotiation and support until your successful onboarding." },
];

const industries = [
  "Information Technology", "Software Development", "Banking & Finance",
  "Digital Marketing", "Data Analytics", "Cybersecurity",
  "Healthcare", "E-Commerce", "Consulting",
  "Manufacturing", "Telecommunications", "EdTech",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <OrganizationJsonLd />
      <ServiceJsonLd />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a2332] via-[#232F3E] to-[#2d3f52] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 bg-[#FF9900]/15 border border-[#FF9900]/25 text-[#FF9900] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            About HireVexa Consultancy
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
            Empowering Careers.<br />
            <span className="text-[#FF9900]">Creating Futures.</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
            HireVexa Consultancy is dedicated to bridging the gap between education and employment. We help freshers and young professionals gain the skills, confidence, and opportunities required to thrive in today's competitive job market.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg hover:scale-[1.02]">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link href="/jobs" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 text-center shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                <s.icon size={22} className="text-[#FF9900]" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{s.number}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-3">Our Story</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Helping Talent Meet Opportunity</h2>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>Every year, millions of graduates enter the workforce with ambition, talent, and determination. Yet many struggle to find the right opportunities because of limited industry exposure, inadequate preparation, and lack of professional guidance.</p>
                <p>HireVexa was established to solve this challenge. We recognised that students needed more than just job listings — they needed a trusted partner who could guide them throughout their career journey.</p>
                <p>Today, HireVexa works with freshers and employers across India to create meaningful career outcomes. Through personalised counselling, resume enhancement, interview preparation, and placement assistance, we help candidates confidently enter the professional world.</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-5">
                <GraduationCap size={32} className="text-[#FF9900]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Commitment</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">We are committed to helping every student discover their potential and achieve professional success through expert mentorship, industry-relevant preparation, and strategic placement support.</p>
              <div className="space-y-2">
                {["Free registration — no upfront barrier", "Dedicated counsellor from Day 1", "Apply to minimum 3 companies on your behalf", "Support until you join your first company"].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-gradient-to-br from-[#1a2332] to-[#232F3E] text-white rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-[#FF9900]/15 flex items-center justify-center mb-5">
              <Target size={24} className="text-[#FF9900]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
            <p className="text-gray-300 text-sm leading-relaxed">To empower students and fresh graduates with the guidance, skills, and opportunities necessary to build successful careers while helping organisations connect with talented professionals.</p>
          </div>
          <div className="bg-[#FF9900] text-gray-900 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-black/10 flex items-center justify-center mb-5">
              <Eye size={24} className="text-gray-900" />
            </div>
            <h3 className="text-xl font-bold mb-3">Our Vision</h3>
            <p className="text-gray-800 text-sm leading-relaxed">To become India's most trusted career consultancy platform, enabling every student to transition seamlessly from education to employment and achieve long-term professional growth.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">Our Values</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What Drives Us</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(v => (
              <div key={v.title} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3 group-hover:bg-[#FF9900] transition">
                  <CheckCircle size={18} className="text-[#FF9900] group-hover:text-gray-900 transition" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{v.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">How We Work</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Placement Process</h2>
        </div>
        <div className="space-y-4">
          {process.map((item, i) => (
            <div key={item.step} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex items-start gap-5 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 rounded-2xl bg-[#232F3E] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">{item.step}</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Industries */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">Industries We Serve</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Opportunities Across Sectors</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {industries.map(ind => (
              <div key={ind} className="bg-white border border-gray-200 rounded-xl p-4 text-center text-sm font-medium text-gray-700 hover:border-[#FF9900] hover:text-[#FF9900] transition shadow-sm">
                {ind}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Director message */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-br from-[#1a2332] to-[#232F3E] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="relative max-w-3xl">
            <div className="inline-block bg-[#FF9900]/15 border border-[#FF9900]/30 text-[#FF9900] text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
              Message From Director
            </div>
            <div className="text-4xl text-[#FF9900]/30 font-serif leading-none mb-4">&ldquo;</div>
            <p className="text-gray-200 text-base sm:text-lg leading-relaxed mb-4">
              At HireVexa, our vision has always been simple — bridge the gap between education and employment. Every year thousands of talented graduates struggle not because they lack potential, but because they lack guidance, opportunities, and industry exposure.
            </p>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8">
              Our mission is to ensure that every student receives the right career direction, professional training, and placement opportunities required to succeed in today's competitive job market.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF9900] flex items-center justify-center text-gray-900 font-bold text-lg flex-shrink-0">S</div>
              <div>
                <p className="font-bold text-white">Mr. Siddharth Vats</p>
                <p className="text-[#FF9900] text-sm font-medium">Director & Founder, HireVexa Consultancy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-[#FF9900] rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Ready to Start Your Career Journey?</h2>
          <p className="text-gray-800 text-sm mb-8 max-w-lg mx-auto">Join hundreds of freshers who trusted HireVexa to land their first job. Free to register.</p>
          <Link href="/onboarding"
            className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-[#1a2332] text-white font-bold px-10 py-4 rounded-xl text-sm transition-all shadow-lg">
            Register Today <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}