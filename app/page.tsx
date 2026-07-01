"use client";

import Footer from "./components/Footer";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Star, Users, Briefcase, TrendingUp, Award,
  BookOpen, ArrowRight, ChevronLeft, ChevronRight,
  CheckCircle, Clock, Shield, Target, Zap, HeartHandshake
} from "lucide-react";

const stats = [
  { label: "Candidates Placed", rawValue: 840, suffix: "+", decimals: 0, icon: Users },
  { label: "Hiring Partners", rawValue: 45, suffix: "+", decimals: 0, icon: Briefcase },
  { label: "Placement Rate", rawValue: 87, suffix: "%", decimals: 0, icon: TrendingUp },
  { label: "Avg. Salary Hike", rawValue: 1.8, suffix: "x", decimals: 1, icon: Award },
];

const testimonials = [
  { name: "Rahul Sharma", college: "SRM University", stars: 5, text: "The resume review and mock interview sessions gave me real confidence. Got my first offer within 3 weeks of joining.", role: "Software Engineer @ TCS" },
  { name: "Priya Verma", college: "Delhi University", stars: 5, text: "The counsellors actually listened to what I wanted and matched me to relevant roles. Very different from other consultancies.", role: "Analyst @ Wipro" },
  { name: "Aman Gupta", college: "AKTU", stars: 5, text: "Professional, responsive, and genuinely invested in getting me placed. Highly recommend for freshers.", role: "Associate Engineer @ Infosys" },
  { name: "Sneha Kapoor", college: "IP University", stars: 5, text: "The mock interviews were tough but exactly what I needed. I felt fully prepared walking into the real thing.", role: "Graduate Trainee @ Cognizant" },
  { name: "Rohit Yadav", college: "Amity University", stars: 5, text: "From profile building to offer letter — the end-to-end support was excellent. Got placed in 6 weeks.", role: "Support Engineer @ HCL" },
  { name: "Neha Singh", college: "Galgotias University", stars: 5, text: "I was getting zero callbacks before. After their resume overhaul, interview calls started coming in immediately.", role: "Associate @ Capgemini" },
];

const companies = [
  { name: "TCS", logo: "/logos/tcs.png" },
  { name: "Infosys", logo: "/logos/infosys.png" },
  { name: "Wipro", logo: "/logos/wipro.png" },
  { name: "Accenture", logo: "/logos/accenture.png" },
  { name: "Deloitte", logo: "/logos/delloite.png" },
  { name: "HCL", logo: "/logos/hcl.png" },
  { name: "IBM", logo: "/logos/ibm.png" },
  { name: "Capgemini", logo: "/logos/capgemini.png" },
  { name: "Cognizant", logo: "/logos/cognizant1.png" },
  { name: "Tech Mahindra", logo: "/logos/techmahindra.png" },
  { name: "Techmaa", logo: "/logos/techmaa.jpeg" },
];

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced"
};

const whyUs = [
  { icon: Target, title: "Personalised Matching", desc: "We map your profile to roles that actually fit — no mass applying to irrelevant positions." },
  { icon: Shield, title: "End-to-End Support", desc: "Resume, prep, apply, negotiate — we're with you at every step until you join." },
  { icon: Zap, title: "Fast Turnaround", desc: "Most candidates see interview calls within 2–3 weeks of completing their profile." },
  
];

function useCountUp(target: number, duration = 1800, decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      observer.disconnect();
      const start = performance.now();
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setValue(parseFloat((target * easeOut(progress)).toFixed(decimals)));
        if (progress < 1) requestAnimationFrame(step);
        else setValue(target);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, decimals]);
  return [value, ref] as const;
}

function StatCard({ icon: Icon, rawValue, suffix, decimals, label }: {
  icon: React.ElementType; rawValue: number; suffix: string; decimals: number; label: string;
}) {
  const [value, ref] = useCountUp(rawValue, 1800, decimals);
  return (
    <div ref={ref} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
        <Icon size={22} className="text-[#FF9900]" />
      </div>
      <p className="text-3xl sm:text-4xl font-bold text-gray-900">
        {decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-gray-500 mt-1.5 font-medium">{label}</p>
    </div>
  );
}

interface Course {
  id: string; title: string; slug: string; shortDescription: string;
  thumbnailUrl?: string | null; instructor?: string | null; level: string;
  price: number; discount: number; duration?: string | null;
  category?: { name: string } | null;
  _count: { enrollments: number; modules: number };
}

function CourseCard({ course }: { course: Course }) {
  const effectivePrice = course.price - (course.price * course.discount) / 100;
  return (
    <Link href={`/courses/${course.slug}`}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-orange-200 transition-all group flex flex-col h-full">
      <div className="relative h-40 bg-gradient-to-br from-[#232F3E] to-[#37475A] overflow-hidden flex-shrink-0">
        {course.thumbnailUrl
          ? <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-12 w-12 text-white/20" /></div>}
        {course.discount > 0 && (
          <div className="absolute top-3 left-3 bg-[#FF9900] text-gray-900 text-xs font-bold px-2 py-0.5 rounded-md">{course.discount}% OFF</div>
        )}
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-md backdrop-blur-sm">
          {LEVEL_LABELS[course.level] ?? course.level}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        {course.category && <p className="text-xs font-semibold text-[#FF9900] uppercase tracking-wide mb-1">{course.category.name}</p>}
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-[#FF9900] transition-colors">{course.title}</h3>
        {course.instructor && <p className="text-xs text-gray-400 mb-2">by {course.instructor}</p>}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 mt-auto">
          <span className="flex items-center gap-1"><BookOpen size={11} /> {course._count.modules} modules</span>
          {course.duration && <span className="flex items-center gap-1"><Clock size={11} /> {course.duration}</span>}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-base font-bold text-gray-900">
            {effectivePrice === 0 ? "Free" : `₹${effectivePrice.toFixed(0)}`}
          </span>
          <span className="text-xs font-semibold text-[#FF9900]">View →</span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isLoggedIn = !!session;
  const isAdmin = role === "ADMIN";
  const isCandidate = role === "CANDIDATE";

  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setPerPage(1);
      else if (window.innerWidth < 1024) setPerPage(2);
      else setPerPage(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    fetch("/api/courses?featured=true")
      .then(r => r.json())
      .then(data => setCourses(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => {});
  }, []);

  const visible = testimonials.slice(testimonialIndex, testimonialIndex + perPage);
  const totalPages = Math.ceil(testimonials.length / perPage);
  const next = () => setTestimonialIndex(i => (i + perPage >= testimonials.length ? 0 : i + perPage));
  const prev = () => setTestimonialIndex(i => (i - perPage < 0 ? Math.max(0, testimonials.length - perPage) : i - perPage));

  // Dynamic CTA targets based on auth state
  const primaryCTA = isAdmin
    ? { href: "/admin", label: "Go to Admin Panel" }
    : isCandidate
    ? { href: "/jobs", label: "Browse Open Jobs" }
    : { href: "/onboarding", label: "Get Started" };

  const secondaryCTA = isAdmin
    ? { href: "/admin/courses", label: "Manage Courses" }
    : isCandidate
    ? { href: "/dashboard", label: "My Dashboard" }
    : { href: "/jobs", label: "Browse Open Jobs" };

  const placementCTA = isAdmin
    ? { href: "/admin", label: "Go to Admin Panel" }
    : isCandidate
    ? { href: "/dashboard/profile", label: "Complete My Profile" }
    : { href: "/onboarding", label: "Start Your Placement Journey" };

  const bottomPrimaryCTA = isAdmin
    ? { href: "/admin", label: "Admin Dashboard" }
    : isCandidate
    ? { href: "/dashboard", label: "Go to My Dashboard" }
    : { href: "/onboarding", label: "Create Account" };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-[#1a2332] via-[#232F3E] to-[#2d3f52] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#FF9900]/15 border border-[#FF9900]/25 text-[#FF9900] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-pulse" />
                India's Fresher Career Partner
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] mb-5 tracking-tight">
                Land Your First Job<br />
                <span className="text-[#FF9900]">With Confidence.</span>
              </h1>

              {isLoggedIn ? (
                <p className="text-gray-300 text-base sm:text-lg mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Welcome back{(session?.user as any)?.name ? `, ${((session?.user as any)?.name as string).split(" ")[0]}` : ""}!
                  {isAdmin ? " Manage your platform from the admin panel." : " Continue your placement journey from where you left off."}
                </p>
              ) : (
                <p className="text-gray-300 text-base sm:text-lg mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  HireVexa helps freshers bridge the gap between campus and career —
                  with personalised counselling, resume building, and direct placement support.
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href={primaryCTA.href}
                  className="inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.99]">
                  {primaryCTA.label} <ArrowRight size={16} />
                </Link>
                <Link href={secondaryCTA.href}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all">
                  {secondaryCTA.label}
                </Link>
              </div>

              {!isLoggedIn && (
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start text-xs text-gray-400">
                  {["Easy registration", "100% Transparent", "Dedicated counsellor"].map(t => (
                    <span key={t} className="flex items-center gap-1.5">
                      <CheckCircle size={12} className="text-[#FF9900]" /> {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Stats card */}
            <div className="flex-shrink-0 w-full max-w-xs lg:max-w-sm">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#FF9900] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                    <img src="/logo.png" alt="HireVexa" className="w-10 h-10 object-contain" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">HireVexa Consultancy</h3>
                  <p className="text-gray-400 text-xs mb-5">Your career. Our mission.</p>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    {[
                      { v: "840+", l: "Placed" },
                      { v: "87%", l: "Success Rate" },
                      { v: "45+", l: "Companies" },
                      { v: "2–3 wks", l: "Avg. Time" },
                    ].map(s => (
                      <div key={s.l} className="bg-white/10 rounded-xl p-3">
                        <p className="text-[#FF9900] font-bold text-lg leading-none">{s.v}</p>
                        <p className="text-gray-400 text-xs mt-1">{s.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg flex items-center gap-1.5">
                  <CheckCircle size={13} /> Placements Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info strip */}
        <div className="relative border-t border-white/10 bg-black/20 py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-gray-300">
            <span>📍 Serving <strong className="text-white">Pan India</strong></span>
            <span className="hidden sm:inline">📞 <strong className="text-white">Best counselling</strong> sessions available</span>
            <span>🤝 <strong className="text-white">45+ hiring partners</strong> onboard</span>
            {isLoggedIn
              ? <Link href={isAdmin ? "/admin" : "/dashboard"} className="text-[#FF9900] hover:underline font-semibold">Go to Dashboard →</Link>
              : <Link href="/onboarding" className="text-[#FF9900] hover:underline font-semibold">Register Now →</Link>
            }
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">Our Track Record</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Numbers That Speak</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── Why HireVexa ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">Why Choose Us</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Built Different. For Freshers.</h2>
            <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">
              We&apos;re not a job board. We&apos;re a placement partner — with real humans who care about your career.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {whyUs.map(item => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-[#FF9900] transition">
                  <item.icon size={22} className="text-[#FF9900] group-hover:text-gray-900 transition" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

     {/* ── Leadership Messages ── */}
<section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
  <div className="text-center mb-10">
    <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">Leadership</p>
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Message From Our Founders</h2>
    <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">The vision and values that drive everything we do at HireVexa.</p>
  </div>

  <div className="grid lg:grid-cols-2 gap-6">

    {/* Director */}
    <div className="bg-gradient-to-br from-[#1a2332] to-[#232F3E] rounded-3xl p-7 sm:p-10 text-white relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      <div className="relative flex-1 flex flex-col">
        <div className="inline-block bg-[#FF9900]/15 border border-[#FF9900]/30 text-[#FF9900] text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider w-fit">
          Director & Founder
        </div>
        <div className="text-4xl text-[#FF9900]/30 font-serif leading-none mb-3">&ldquo;</div>
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed mb-3 flex-1">
          At HireVexa, our vision has always been simple — bridge the gap between education and employment.
          Every year thousands of talented graduates struggle not because they lack potential, but because
          they lack guidance, opportunities, and industry exposure.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed mb-7">
          Our mission is to ensure that every student receives the right career direction, professional
          training, and placement opportunities required to succeed in today&apos;s competitive job market.
          I sincerely thank our students, recruiters, mentors, and partners for placing their trust in us.
        </p>
        <div className="flex items-center gap-4 pt-5 border-t border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#FF9900] flex items-center justify-center text-gray-900 font-bold text-lg flex-shrink-0">S</div>
          <div>
            <p className="font-bold text-white">Mr. Siddharth Vats</p>
            <p className="text-[#FF9900] text-sm font-medium">Director & Founder</p>
            <p className="text-gray-500 text-xs mt-0.5">HireVexa Consultancy</p>
          </div>
        </div>
      </div>
    </div>

    {/* Co-Founder */}
    <div className="bg-gradient-to-br from-[#FF9900] to-[#e88d00] rounded-3xl p-7 sm:p-10 text-gray-900 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, black 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      <div className="relative flex-1 flex flex-col">
        <div className="inline-block bg-black/10 border border-black/15 text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider w-fit">
          Co-Founder
        </div>
        <div className="text-4xl text-black/15 font-serif leading-none mb-3">&ldquo;</div>
        <p className="text-gray-900 text-sm sm:text-base leading-relaxed mb-3 flex-1">
          Building HireVexa has been about one thing — making sure no talented fresher gets left behind
          simply because they didn&apos;t know the right people or didn&apos;t get the right guidance at the right time.
        </p>
        <p className="text-gray-800 text-sm leading-relaxed mb-7">
          We built this platform to be the bridge that every fresher deserves — between where they are
          today and where they deserve to be. Our commitment is to stay by your side until you get there.
        </p>
        <div className="flex items-center gap-4 pt-5 border-t border-black/10">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">N</div>
          <div>
            <p className="font-bold text-gray-900">Mr. Nikhil Kumar Sharma</p>
            <p className="text-gray-900 text-sm font-semibold">Co-Founder</p>
            <p className="text-gray-800 text-xs mt-0.5">HireVexa Consultancy</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

      {/* ── How it works ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">The Process</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How HireVexa Works</h2>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { num: "01", title: "Register Easy", desc: "Create your profile, tell us your degree, skills, and job preferences.", icon: BookOpen },
              { num: "02", title: "Counselling Call", desc: "A dedicated counsellor reviews your profile and maps you to relevant openings.", icon: Users },
              { num: "03", title: "Prep & Apply", desc: "Resume polish, mock interviews, and direct applications to matched companies.", icon: Shield },
              { num: "04", title: "Get Placed", desc: "Accept your offer. We assist with negotiation and joining formalities too.", icon: Award },
            ].map((s, i) => (
              <div key={s.num} className="flex flex-col items-center text-center group">
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-[#232F3E] text-white flex items-center justify-center shadow-lg group-hover:bg-[#FF9900] transition-colors duration-300">
                    <s.icon size={28} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#FF9900] text-gray-900 text-xs font-bold flex items-center justify-center border-2 border-white shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm sm:text-base">{s.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 text-center">
          <Link href={placementCTA.href}
            className="inline-flex items-center gap-2 bg-[#232F3E] hover:bg-[#1a2332] text-white font-bold px-8 py-3.5 rounded-xl text-sm transition shadow-sm">
            {placementCTA.label} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      {courses.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">Skill Up</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Courses</h2>
              <p className="text-gray-500 text-sm mt-2">Learn in-demand skills and boost your placement chances.</p>
            </div>
            <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF9900] hover:underline flex-shrink-0">
              View all courses <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        </section>
      )}

      {/* ── Hiring Partners ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-12 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Hiring Partners</p>
          <h2 className="text-2xl font-bold text-gray-900">Companies We Work With</h2>
        </div>
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
          <div className="flex gap-5 animate-marquee w-max">
            {[...companies, ...companies].map((c, i) => (
              <div key={i} className="flex-shrink-0 bg-white border border-gray-200 rounded-xl px-6 py-4 min-w-[140px] sm:min-w-[160px] flex flex-col items-center gap-2 hover:shadow-md transition-shadow logo-card">
                <img src={c.logo} alt={c.name} className="h-8 sm:h-10 object-contain" />
                <p className="text-xs font-semibold text-gray-600">{c.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className={`py-14 sm:py-16 ${courses.length > 0 ? "bg-gray-50 border-y border-gray-100" : ""}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">Reviews</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What Candidates Say</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prev} className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition shadow-sm">
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs text-gray-400 min-w-[40px] text-center">
                {Math.floor(testimonialIndex / perPage) + 1} / {totalPages}
              </span>
              <button onClick={next} className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition shadow-sm">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map(t => (
              <div key={t.name} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#232F3E] text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.college}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className={i < t.stars ? "fill-[#FF9900] text-[#FF9900]" : "text-gray-200 fill-gray-200"} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-3 border-t border-gray-100">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <CheckCircle size={11} /> {t.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <div className="bg-gradient-to-br from-[#232F3E] to-[#1a2332] text-white rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="relative px-6 sm:px-12 py-12 sm:py-16 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
              {isLoggedIn ? "Continue Your Journey" : "Ready to Start Your Career?"}
            </h2>
            <p className="text-gray-300 mb-8 text-sm sm:text-base max-w-xl mx-auto">
              {isAdmin
                ? "Manage jobs, candidates, courses and track placements from your admin panel."
                : isCandidate
                ? "Check your applications, update your profile, and browse the latest job openings."
                : "Join hundreds of freshers who trusted HireVexa to land their first role. Easy to register. No strings attached."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={bottomPrimaryCTA.href}
                className="inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold px-8 sm:px-10 py-4 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20 hover:scale-[1.02]">
                {bottomPrimaryCTA.label} <ArrowRight size={16} />
              </Link>
              <Link href="/courses"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 sm:px-10 py-4 rounded-xl text-sm transition-all">
                <BookOpen size={15} /> Browse Courses
              </Link>
            </div>
            {!isLoggedIn && (
              <p className="mt-5 text-gray-500 text-xs">All payment modes · Easy registration · Placement support included</p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}