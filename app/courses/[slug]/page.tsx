"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BookOpen, Clock, Users, ChevronDown, ChevronRight,
  Play, Lock, CheckCircle, ArrowLeft, Globe, BarChart2,
  Loader2, Calendar, Award, Zap, ShieldCheck, Star,
  TrendingUp, Briefcase, GraduationCap, ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface Lesson { id: string; title: string; duration?: string | null; isPreview: boolean; order: number; }
interface Module { id: string; title: string; description?: string | null; order: number; lessons: Lesson[]; }
interface Course {
  id: string; title: string; slug: string; shortDescription: string; description: string;
  thumbnailUrl?: string | null; previewVideoUrl?: string | null; instructor?: string | null;
  language: string; duration?: string | null; level: string; price: number; discount: number;
  featured: boolean; category?: { name: string; slug: string } | null;
  modules: Module[];
  _count: { enrollments: number; reviews: number };
}

const LEVEL_LABELS: Record<string, string> = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };
const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-50 text-green-700",
  INTERMEDIATE: "bg-yellow-50 text-yellow-700",
  ADVANCED: "bg-red-50 text-red-700",
};

// Parse description into sections for beautiful rendering
function parseDescription(text: string) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const sections: { type: "heading" | "divider" | "bullet" | "text"; content: string }[] = [];

  for (const line of lines) {
    if (line.startsWith("━") || line.startsWith("—") || line.startsWith("===")) {
      sections.push({ type: "divider", content: line });
    } else if (line.match(/^[A-Z\s]{5,}$/) && line.length < 60) {
      sections.push({ type: "heading", content: line });
    } else if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
      sections.push({ type: "bullet", content: line.replace(/^[•\-*]\s*/, "") });
    } else {
      sections.push({ type: "text", content: line });
    }
  }
  return sections;
}

function DescriptionRenderer({ text }: { text: string }) {
  const sections = parseDescription(text);
  const groups: { heading?: string; items: typeof sections }[] = [];
  let current: { heading?: string; items: typeof sections } = { items: [] };

  for (const s of sections) {
    if (s.type === "heading") {
      if (current.items.length > 0 || current.heading) groups.push(current);
      current = { heading: s.content, items: [] };
    } else if (s.type === "divider") {
      // skip divider lines
    } else {
      current.items.push(s);
    }
  }
  if (current.items.length > 0 || current.heading) groups.push(current);

  return (
    <div className="space-y-6">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.heading && (
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gray-100" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF9900] flex-shrink-0">{group.heading}</h3>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
          )}
          <div className="space-y-2">
            {group.items.map((item, ii) => {
              if (item.type === "bullet") {
                return (
                  <div key={ii} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle size={11} className="text-[#FF9900]" />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">{item.content}</span>
                  </div>
                );
              }
              return (
                <p key={ii} className="text-sm text-gray-600 leading-relaxed">{item.content}</p>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [thumbError, setThumbError] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${slug}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        setCourse(data);
        if (data.modules?.length > 0) {
          const initial = new Set<string>([data.modules[0].id]);
          if (data.modules[1]) initial.add(data.modules[1].id);
          setExpandedModules(initial);
        }
      })
      .catch(() => router.push("/courses"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  useEffect(() => {
    if (!session || !course) return;
    axios.get("/api/enrollments").then(res => {
      setEnrolled(res.data.some((e: any) => e.courseId === course.id));
    }).catch(() => {});
  }, [session, course]);

  async function handleEnroll() {
    if (!session) { router.push("/login"); return; }
    if (enrolled) { router.push("/dashboard/courses"); return; }
    try {
      setEnrolling(true);
      await axios.post("/api/enrollments", { courseId: course!.id });
      setEnrolled(true);
      toast.success("Enrolled! Start learning now.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to enroll.");
    } finally { setEnrolling(false); }
  }

  function toggleModule(id: string) {
    setExpandedModules(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const totalLessons = course?.modules.reduce((a, m) => a + m.lessons.length, 0) ?? 0;
  const effectivePrice = course ? course.price - (course.price * course.discount) / 100 : 0;
  // Module count is a curriculum-structure number, NOT a time duration.
  // The actual course duration (e.g. "3 Weeks") lives on course.duration and must be used
  // anywhere we display how long the course takes.
  const totalModules = course?.modules.length ?? 0;
  const durationLabel = course?.duration?.trim() || "Self-paced";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-[#FF9900]" size={32} />
    </div>
  );
  if (!course) return null;

  const showThumbnail = course.thumbnailUrl && !thumbError;

  const EnrollButton = ({ full = false }: { full?: boolean }) => (
    <button onClick={handleEnroll} disabled={enrolling}
      className={`inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold rounded-xl text-sm transition-all disabled:opacity-60 shadow-lg shadow-orange-500/20 hover:scale-[1.01] ${full ? "w-full py-3.5" : "px-5 py-2.5"}`}>
      {enrolling ? <><Loader2 size={14} className="animate-spin" /> Enrolling...</>
        : enrolled ? <><CheckCircle size={14} /> Go to My Course</>
        : effectivePrice === 0 ? "🎉 Enroll Free" : `Enroll Now — ₹${effectivePrice.toFixed(0)}`}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a2332] via-[#232F3E] to-[#2d3f52] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Link href="/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition">
            <ArrowLeft size={15} /> Back to Courses
          </Link>
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              {course.category && (
                <span className="inline-block bg-[#FF9900]/15 border border-[#FF9900]/25 text-[#FF9900] text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                  {course.category.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-4">{course.title}</h1>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">{course.shortDescription}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${LEVEL_COLORS[course.level]}`}>
                  <BarChart2 size={11} /> {LEVEL_LABELS[course.level]}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full">
                  <Globe size={11} /> {course.language}
                </span>
                {course.duration && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full">
                    <Clock size={11} /> {course.duration}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full">
                  <Users size={11} /> {course._count.enrollments} enrolled
                </span>
                {totalModules > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full">
                    <Calendar size={11} /> {totalModules} module{totalModules !== 1 ? "s" : ""} · {totalLessons} lessons
                  </span>
                )}
              </div>

              {course.instructor && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FF9900] flex items-center justify-center text-gray-900 font-bold text-sm">
                    {course.instructor[0]}
                  </div>
                  <p className="text-sm text-gray-400">Instructor: <span className="text-white font-semibold">{course.instructor}</span></p>
                </div>
              )}
            </div>

            {/* Desktop enrollment card */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-900 sticky top-6">
                {/* Thumbnail */}
                {showThumbnail ? (
                  <img
                    src={course.thumbnailUrl!}
                    alt={course.title}
                    className="w-full h-44 object-cover"
                    onError={() => setThumbError(true)}
                  />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-[#232F3E] to-[#37475A] flex flex-col items-center justify-center gap-2">
                    <GraduationCap className="h-12 w-12 text-[#FF9900]" />
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">{course.category?.name ?? "Course"}</p>
                  </div>
                )}
                <div className="p-5">
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {effectivePrice === 0 ? "Free" : `₹${effectivePrice.toFixed(0)}`}
                      </span>
                      {course.discount > 0 && <span className="text-sm text-gray-400 line-through">₹{course.price}</span>}
                    </div>
                    {course.discount > 0 && (
                      <span className="inline-block mt-1 text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full">{course.discount}% OFF</span>
                    )}
                  </div>
                  <EnrollButton full />
                  {!session && (
                    <p className="text-xs text-center text-gray-400 mt-2">
                      <Link href="/login" className="text-[#FF9900] font-semibold hover:underline">Login</Link> to enroll
                    </p>
                  )}
                  <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
                    {[
                      { icon: Calendar, text: `${durationLabel} of structured content` },
                      { icon: BookOpen, text: `${totalLessons} lessons included` },
                      { icon: Globe, text: `Taught in ${course.language}` },
                      { icon: Award, text: `${LEVEL_LABELS[course.level]} level` },
                      { icon: Zap, text: "Lifetime access" },
                      { icon: ShieldCheck, text: "Placement support included" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 text-xs text-gray-600">
                        <Icon size={13} className="text-[#FF9900] flex-shrink-0" /> {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">{effectivePrice === 0 ? "Free" : `₹${effectivePrice.toFixed(0)}`}</span>
            {course.discount > 0 && <span className="text-xs text-gray-400 line-through">₹{course.price}</span>}
          </div>
          {course.discount > 0 && <span className="text-xs font-bold text-emerald-600">{course.discount}% off</span>}
        </div>
        <EnrollButton />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Calendar, label: "Duration", value: durationLabel },
                { icon: BookOpen, label: "Lessons", value: `${totalLessons}` },
                { icon: Users, label: "Enrolled", value: `${course._count.enrollments}+` },
                { icon: Award, label: "Level", value: LEVEL_LABELS[course.level] },
              ].map(s => (
                <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-center shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mx-auto mb-2">
                    <s.icon size={15} className="text-[#FF9900]" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="bg-gradient-to-br from-[#1a2332] to-[#232F3E] rounded-2xl p-5 sm:p-6 text-white">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <Star size={16} className="text-[#FF9900]" /> Why This Course?
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: ShieldCheck, text: "100% Effort guaranteed" },
                  { icon: Briefcase, text: "Direct referrals to 45+ companies" },
                  { icon: GraduationCap, text: "Azure AZ-900 certification prep" },
                  { icon: TrendingUp, text: "Live projects & portfolio building" },
                  { icon: Users, text: "Dedicated counsellor from Day 1" },
                  { icon: Zap, text: "Fast-track placement — avg 6 weeks" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#FF9900]/15 flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-[#FF9900]" />
                    </div>
                    <span className="text-xs text-gray-300">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">About This Course</h2>
              <DescriptionRenderer text={course.description} />
            </div>

            {/* Curriculum */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Course Curriculum</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{totalModules} module{totalModules !== 1 ? "s" : ""} · {totalLessons} lessons</p>
                </div>
                <button
                  onClick={() => {
                    const allIds = new Set(course.modules.map(m => m.id));
                    const allOpen = course.modules.every(m => expandedModules.has(m.id));
                    setExpandedModules(allOpen ? new Set() : allIds);
                  }}
                  className="text-xs font-semibold text-[#FF9900] hover:underline self-start sm:self-auto">
                  {course.modules.every(m => expandedModules.has(m.id)) ? "Collapse all" : "Expand all"}
                </button>
              </div>

              {course.modules.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-400">Curriculum coming soon.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {course.modules.map((mod, mi) => {
                    const isOpen = expandedModules.has(mod.id);
                    const previewCount = mod.lessons.filter(l => l.isPreview).length;
                    return (
                      <div key={mod.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => toggleModule(mod.id)}
                          className="w-full flex items-center gap-3 px-4 py-4 bg-gray-50 hover:bg-gray-100 transition text-left group">
                          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[#232F3E] to-[#37475A] text-white flex flex-col items-center justify-center shadow-sm group-hover:from-[#FF9900] group-hover:to-[#e88d00] group-hover:text-gray-900 transition-all duration-200">
                            <span className="text-[9px] font-semibold opacity-70 leading-none uppercase tracking-wider">Module</span>
                            <span className="text-2xl font-bold leading-tight">{mi + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 leading-snug">{mod.title}</p>
                            {mod.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{mod.description}</p>}
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                              <span>{mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}</span>
                              {previewCount > 0 && <span className="text-[#FF9900] font-semibold">{previewCount} free preview</span>}
                            </div>
                          </div>
                          {isOpen ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="divide-y divide-gray-50">
                            {mod.lessons.map((lesson, li) => (
                              <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                                <span className="text-xs text-gray-300 w-5 flex-shrink-0 text-right">{li + 1}</span>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${lesson.isPreview ? "bg-orange-50" : "bg-gray-100"}`}>
                                  {lesson.isPreview ? <Play size={12} className="text-[#FF9900]" /> : <Lock size={12} className="text-gray-300" />}
                                </div>
                                <span className={`text-sm flex-1 min-w-0 truncate ${lesson.isPreview ? "text-gray-800 font-medium" : "text-gray-500"}`}>{lesson.title}</span>
                                {lesson.isPreview && (
                                  <span className="text-[10px] font-bold text-[#FF9900] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 flex-shrink-0">FREE</span>
                                )}
                                {lesson.duration && <span className="text-xs text-gray-400 flex-shrink-0">{lesson.duration}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!enrolled && (
                <div className="mt-6 p-5 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-xl text-center">
                  <p className="text-sm font-bold text-gray-900 mb-1">Ready to start your journey?</p>
                  <p className="text-xs text-gray-500 mb-4">Get full access to the entire {durationLabel} program · 100% Effort guaranteed</p>
                  <EnrollButton full />
                </div>
              )}
            </div>

            {/* What you'll learn */}
            {course.modules.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">What You&apos;ll Learn</h2>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {course.modules.map((mod, mi) => (
                    <div key={mod.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 hover:bg-orange-50 transition">
                      <div className="w-6 h-6 rounded-full bg-[#FF9900] text-gray-900 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {mi + 1}
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{mod.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Desktop sidebar spacer */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </div>
  );
}