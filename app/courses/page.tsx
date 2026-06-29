"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { BookOpen, Search, Users, Clock, Star, Filter, Loader2, ChevronRight } from "lucide-react";

interface Course {
  id: string; title: string; slug: string; shortDescription: string;
  thumbnailUrl?: string | null; instructor?: string | null; level: string;
  price: number; discount: number; language: string; duration?: string | null;
  category?: { id: string; name: string } | null;
  _count: { enrollments: number; modules: number; reviews: number };
}
interface Category { id: string; name: string; slug: string; }

const LEVEL_LABELS: Record<string, string> = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };
const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-50 text-green-700 border-green-100",
  INTERMEDIATE: "bg-yellow-50 text-yellow-700 border-yellow-100",
  ADVANCED: "bg-red-50 text-red-700 border-red-100",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/courses").then(r => r.json()),
      fetch("/api/admin/categories").then(r => r.json()),
    ]).then(([c, cats]) => {
      setCourses(Array.isArray(c) ? c : []);
      setCategories(Array.isArray(cats) ? cats : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
      (c.instructor ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || c.category?.id === categoryFilter;
    const matchLevel = levelFilter === "all" || c.level === levelFilter;
    return matchSearch && matchCat && matchLevel;
  }), [courses, search, categoryFilter, levelFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#232F3E] to-[#1a2332] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-[#FF9900] text-xs font-semibold uppercase tracking-widest mb-3">Skill Up</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Course Marketplace</h1>
          <p className="text-gray-400 text-sm mb-8 max-w-lg">Learn job-ready skills from industry experts and boost your placement chances.</p>
          <div className="flex flex-wrap gap-8">
            <div><p className="text-2xl font-bold text-[#FF9900]">{courses.length}</p><p className="text-xs text-gray-400">Courses Available</p></div>
            <div><p className="text-2xl font-bold text-blue-400">{courses.reduce((a, c) => a + c._count.enrollments, 0)}</p><p className="text-xs text-gray-400">Total Enrollments</p></div>
            <div><p className="text-2xl font-bold text-emerald-400">{categories.length}</p><p className="text-xs text-gray-400">Categories</p></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Search + Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses, topics, instructors..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#FF9900] shadow-sm" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-4 w-4 text-gray-400" />
            {/* Category */}
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-[#FF9900]">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {/* Level */}
            {["all", "BEGINNER", "INTERMEDIATE", "ADVANCED"].map(l => (
              <button key={l} onClick={() => setLevelFilter(l)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${levelFilter === l ? "bg-[#232F3E] text-white border-[#232F3E]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
                {l === "all" ? "All Levels" : LEVEL_LABELS[l]}
              </button>
            ))}
          </div>
        </div>

        {!loading && <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-800">{filtered.length}</span> course{filtered.length !== 1 ? "s" : ""}</p>}

        {loading ? (
          <div className="flex flex-col items-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
            <p className="text-sm text-gray-500">Loading courses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center bg-white rounded-2xl border border-gray-200">
            <BookOpen className="h-12 w-12 text-gray-200 mb-4" />
            <h3 className="font-bold text-gray-700">No courses found</h3>
            <p className="text-gray-400 text-sm mt-2">Try a different search or filter.</p>
            <button onClick={() => { setSearch(""); setCategoryFilter("all"); setLevelFilter("all"); }}
              className="mt-4 text-[#FF9900] text-sm font-semibold hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(course => {
              const effectivePrice = course.price - (course.price * course.discount) / 100;
              return (
                <Link key={course.id} href={`/courses/${course.slug}`}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-orange-200 transition-all group flex flex-col">
                  <div className="relative h-44 bg-gradient-to-br from-[#232F3E] to-[#37475A]">
                    {course.thumbnailUrl
                      ? <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-14 w-14 text-white/20" /></div>}
                    {course.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-[#FF9900] text-gray-900 text-xs font-bold px-2.5 py-1 rounded-lg">{course.discount}% OFF</div>
                    )}
                    <div className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-lg border backdrop-blur-sm ${LEVEL_COLORS[course.level] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
                      {LEVEL_LABELS[course.level] ?? course.level}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    {course.category && <p className="text-xs font-semibold text-[#FF9900] uppercase tracking-wide mb-1">{course.category.name}</p>}
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-[#FF9900] transition-colors">{course.title}</h3>
                    {course.instructor && <p className="text-xs text-gray-500 mb-2">by {course.instructor}</p>}
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{course.shortDescription}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1"><BookOpen size={11} /> {course._count.modules} modules</span>
                      {course.duration && <span className="flex items-center gap-1"><Clock size={11} /> {course.duration}</span>}
                      <span className="flex items-center gap-1"><Users size={11} /> {course._count.enrollments}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-lg font-bold text-gray-900">{effectivePrice === 0 ? "Free" : `₹${effectivePrice.toFixed(0)}`}</span>
                        {course.discount > 0 && <span className="text-xs text-gray-400 line-through ml-2">₹{course.price}</span>}
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF9900]">View <ChevronRight size={13} /></span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}