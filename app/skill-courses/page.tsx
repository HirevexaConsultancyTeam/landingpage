"use client";
import { useEffect, useState } from "react";

import Footer from "../components/Footer";
import Link from "next/link";
import {
  BookOpen, Clock, Users, ArrowRight, CheckCircle,
  ChevronRight, Loader2, Star
} from "lucide-react";

interface Course {
  id: string; title: string; slug: string; shortDescription: string;
  thumbnailUrl?: string | null; instructor?: string | null; level: string;
  price: number; discount: number; duration?: string | null;
  language: string;
  category?: { name: string } | null;
  _count: { enrollments: number; modules: number };
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced"
};
const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-50 text-green-700 border-green-100",
  INTERMEDIATE: "bg-yellow-50 text-yellow-700 border-yellow-100",
  ADVANCED: "bg-red-50 text-red-700 border-red-100",
};

const whyLearn = [
  { title: "Job-Ready Skills", desc: "Every course is designed around what hiring companies actually test and look for." },
  { title: "Learn at Your Pace", desc: "Self-paced modules you can complete alongside your job search — no fixed schedule." },
  { title: "Expert Instructors", desc: "Courses built and reviewed by industry professionals with real placement experience." },
  { title: "Placement Boost", desc: "Candidates who complete skill courses see 2x more interview calls on average." },
];

export default function SkillCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then(r => r.json())
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a2332] via-[#232F3E] to-[#2d3f52] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FF9900]/15 border border-[#FF9900]/25 text-[#FF9900] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-pulse" />
            Skill Development
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
            Learn Skills That<br />
            <span className="text-[#FF9900]">Get You Hired.</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Browse our growing library of job-ready courses — from coding and aptitude
            to communication and resume building. All designed for freshers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/courses"
              className="inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg hover:scale-[1.02]">
              Browse All Courses <ArrowRight size={16} />
            </Link>
            <Link href="/onboarding"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all">
              Register Now
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-gray-400">
            {["Self-paced learning", "Industry-relevant curriculum", "Certificate on completion", "Easy enrollment available"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-[#FF9900]" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Why learn */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">Why Upskill</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Learn with HireVexa</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {whyLearn.map(w => (
            <div key={w.title} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                <Star size={18} className="text-[#FF9900]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{w.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">Courses</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Courses</h2>
              <p className="text-gray-500 text-sm mt-2">Enroll and start learning today.</p>
            </div>
            <Link href="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF9900] hover:underline flex-shrink-0">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center bg-white rounded-2xl border border-gray-200">
              <BookOpen className="h-12 w-12 text-gray-200 mb-4" />
              <h3 className="font-bold text-gray-700">Courses coming soon</h3>
              <p className="text-gray-400 text-sm mt-2 max-w-xs">
                We&apos;re building our course library. Register now and we&apos;ll notify you when new courses launch.
              </p>
              <Link href="/onboarding"
                className="mt-5 inline-flex items-center gap-2 bg-[#FF9900] text-gray-900 font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#e88d00] transition">
                Register Now <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.slice(0, 6).map(course => {
                const effectivePrice = course.price - (course.price * course.discount) / 100;
                return (
                  <Link key={course.id} href={`/courses/${course.slug}`}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-orange-200 transition-all group flex flex-col">
                    <div className="relative h-40 bg-gradient-to-br from-[#232F3E] to-[#37475A] overflow-hidden flex-shrink-0">
                      {course.thumbnailUrl
                        ? <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-12 w-12 text-white/20" /></div>}
                      {course.discount > 0 && (
                        <div className="absolute top-3 left-3 bg-[#FF9900] text-gray-900 text-xs font-bold px-2 py-0.5 rounded-md">{course.discount}% OFF</div>
                      )}
                      <div className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-0.5 rounded-lg border backdrop-blur-sm ${LEVEL_COLORS[course.level] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
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
                        <span className="flex items-center gap-1"><Users size={11} /> {course._count.enrollments}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-base font-bold text-gray-900">
                          {effectivePrice === 0 ? "Free" : `₹${effectivePrice.toFixed(0)}`}
                        </span>
                        <span className="text-xs font-semibold text-[#FF9900]">Enroll →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {courses.length > 6 && (
            <div className="mt-8 text-center">
              <Link href="/courses"
                className="inline-flex items-center gap-2 bg-[#232F3E] text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-[#1a2332] transition">
                View All {courses.length} Courses <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-br from-[#232F3E] to-[#1a2332] text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <BookOpen size={32} className="text-[#FF9900] mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Start Learning Today</h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto text-sm">
              Enroll in a course, build a skill, and boost your placement chances — all in one place.
            </p>
            <Link href="/courses"
              className="inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold px-10 py-4 rounded-xl text-sm transition-all shadow-lg hover:scale-[1.02]">
              Browse All Courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}