"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BookOpen, Clock, Users, ChevronDown, ChevronRight,
  Play, Lock, CheckCircle, ArrowLeft, Globe, BarChart2,
  Loader2, Calendar, Award, Zap, ShieldCheck, Star,
  TrendingUp, Briefcase, GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import RazorpayCheckoutButton from "@/components/RazorpayCheckoutButton";

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

/* ─────────────────── description rendering ─────────────────── */

function parseDescription(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
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
      // skip
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
            <div className="mb-3 flex items-center gap-2 sm:gap-3">
              <div className="h-px flex-1 bg-gray-100" />
              <h3 className="flex-shrink-0 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#FF9900]">
                {group.heading}
              </h3>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
          )}
          <div className="space-y-2">
            {group.items.map((item, ii) =>
              item.type === "bullet" ? (
                <div key={ii} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-50">
                    <CheckCircle size={11} className="text-[#FF9900]" />
                  </div>
                  <span className="min-w-0 break-words text-sm leading-relaxed text-gray-700">{item.content}</span>
                </div>
              ) : (
                <p key={ii} className="break-words text-sm leading-relaxed text-gray-600">{item.content}</p>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── page ──────────────────────────── */

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
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
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
    axios
      .get("/api/enrollments")
      .then((res) => {
        setEnrolled(res.data.some((e: { courseId: string }) => e.courseId === course.id));
      })
      .catch(() => {});
  }, [session, course]);

  async function handleFreeEnroll() {
    if (!session) { router.push("/login"); return; }
    if (enrolled) { router.push("/dashboard/courses"); return; }
    try {
      setEnrolling(true);
      await axios.post("/api/enrollments", { courseId: course!.id });
      setEnrolled(true);
      toast.success("Enrolled! Start learning now.");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message ?? "Failed to enroll.");
    } finally {
      setEnrolling(false);
    }
  }

  function toggleModule(id: string) {
    setExpandedModules((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const totalLessons = course?.modules.reduce((a, m) => a + m.lessons.length, 0) ?? 0;
  const effectivePrice = course ? course.price - (course.price * course.discount) / 100 : 0;
  const totalModules = course?.modules.length ?? 0;
  const durationLabel = course?.duration?.trim() || "Self-paced";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF9900]" size={32} />
      </div>
    );
  }
  if (!course) return null;

  const showThumbnail = course.thumbnailUrl && !thumbError;

  /**
   * Single checkout entry point, used by the desktop card, the mobile bottom
   * bar and the inline CTA.
   *
   * The previous version rendered a plain "enroll" button on mobile that posted
   * to /api/enrollments — which rejects paid courses with a 402. Paid courses
   * were unbuyable on a phone. Routing every surface through this component is
   * what prevents that from coming back.
   */
  function CheckoutAction({ compact = false }: { compact?: boolean }) {
    const base = compact
      ? "px-4 py-2.5 text-sm whitespace-nowrap"
      : "w-full py-3.5 text-sm";
    const cls = `inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF9900] font-bold text-gray-900 shadow-lg shadow-orange-500/20 transition-all hover:bg-[#e88d00] disabled:opacity-60 ${base}`;

    if (enrolled) {
      return (
        <button onClick={() => router.push("/dashboard/courses")} className={cls}>
          <CheckCircle size={14} /> {compact ? "My Course" : "Go to My Course"}
        </button>
      );
    }

    if (effectivePrice === 0) {
      return (
        <button onClick={handleFreeEnroll} disabled={enrolling} className={cls}>
          {enrolling ? (<><Loader2 size={14} className="animate-spin" /> Enrolling...</>) : "Enroll Free"}
        </button>
      );
    }

    if (!session) {
      return (
        <button onClick={() => router.push("/login")} className={cls}>
          {compact ? "Login to Enroll" : `Login to Enroll — ₹${effectivePrice.toFixed(0)}`}
        </button>
      );
    }

    return (
      <RazorpayCheckoutButton
        type="COURSE"
        courseId={course!.id}
        label={compact ? "Enroll Now" : `Enroll Now — ₹${effectivePrice.toFixed(0)}`}
        className={cls}
        userEmail={session?.user?.email ?? undefined}
        userName={session?.user?.name ?? undefined}
        onSuccess={() => { setEnrolled(true); router.push("/dashboard/courses"); }}
      />
    );
  }

  const features = [
    { icon: Calendar, text: `${durationLabel} of structured content` },
    { icon: BookOpen, text: `${totalLessons} lessons included` },
    { icon: Globe, text: `Taught in ${course.language}` },
    { icon: Award, text: `${LEVEL_LABELS[course.level]} level` },
    { icon: Zap, text: "Lifetime access" },
    { icon: ShieldCheck, text: "Placement support included" },
  ];

  return (
    // Bottom padding clears the fixed mobile bar so the last card isn't hidden.
    <div className="min-h-screen bg-gray-50 pb-28 lg:pb-0">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-[#1a2332] via-[#232F3E] to-[#2d3f52] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
          <Link href="/courses" className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft size={15} /> Back to Courses
          </Link>

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
              {course.category && (
                <span className="mb-3 inline-block rounded-full border border-[#FF9900]/25 bg-[#FF9900]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FF9900] sm:mb-4 sm:text-xs">
                  {course.category.name}
                </span>
              )}

              <h1 className="mb-3 text-xl font-bold leading-tight sm:mb-4 sm:text-3xl lg:text-4xl">
                {course.title}
              </h1>
              <p className="mb-5 text-sm leading-relaxed text-gray-300 sm:mb-6 sm:text-base">
                {course.shortDescription}
              </p>

              {/* Chips scroll horizontally on narrow screens rather than
                  stacking into four cramped rows. */}
              <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mb-6 sm:flex-wrap sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${LEVEL_COLORS[course.level]}`}>
                  <BarChart2 size={11} /> {LEVEL_LABELS[course.level]}
                </span>
                <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs">
                  <Globe size={11} /> {course.language}
                </span>
                {course.duration && (
                  <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs">
                    <Clock size={11} /> {course.duration}
                  </span>
                )}
                <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs">
                  <Users size={11} /> {course._count.enrollments} enrolled
                </span>
                {totalModules > 0 && (
                  <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs">
                    <Calendar size={11} /> {totalModules} module{totalModules !== 1 ? "s" : ""} · {totalLessons} lessons
                  </span>
                )}
              </div>

              {course.instructor && (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FF9900] text-sm font-bold text-gray-900">
                    {course.instructor[0]}
                  </div>
                  <p className="min-w-0 truncate text-sm text-gray-400">
                    Instructor: <span className="font-semibold text-white">{course.instructor}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Desktop enrolment card */}
            <div className="hidden lg:block">
              <div className="sticky top-6 overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl">
                {showThumbnail ? (
                  <img src={course.thumbnailUrl!} alt={course.title} className="h-44 w-full object-cover" onError={() => setThumbError(true)} />
                ) : (
                  <div className="flex h-44 w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#232F3E] to-[#37475A]">
                    <GraduationCap className="h-12 w-12 text-[#FF9900]" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                      {course.category?.name ?? "Course"}
                    </p>
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
                      <span className="mt-1 inline-block rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                        {course.discount}% OFF
                      </span>
                    )}
                  </div>

                  <CheckoutAction />

                  <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
                    {features.map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 text-xs text-gray-600">
                        <Icon size={13} className="flex-shrink-0 text-[#FF9900]" /> {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-5 sm:space-y-6 lg:col-span-2">

            {/* Mobile-only course card: phones never saw the thumbnail,
                price breakdown or feature list before. */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:hidden">
              {showThumbnail ? (
                <img src={course.thumbnailUrl!} alt={course.title} className="h-40 w-full object-cover sm:h-52" onError={() => setThumbError(true)} />
              ) : (
                <div className="flex h-40 w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#232F3E] to-[#37475A] sm:h-52">
                  <GraduationCap className="h-10 w-10 text-[#FF9900]" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    {course.category?.name ?? "Course"}
                  </p>
                </div>
              )}
              <div className="p-4">
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {effectivePrice === 0 ? "Free" : `₹${effectivePrice.toFixed(0)}`}
                  </span>
                  {course.discount > 0 && (
                    <>
                      <span className="text-sm text-gray-400 line-through">₹{course.price}</span>
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {course.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2 xs:grid-cols-2">
                  {features.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-gray-600">
                      <Icon size={13} className="flex-shrink-0 text-[#FF9900]" />
                      <span className="min-w-0 truncate">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {[
                { icon: Calendar, label: "Duration", value: durationLabel },
                { icon: BookOpen, label: "Lessons", value: `${totalLessons}` },
                { icon: Users, label: "Enrolled", value: `${course._count.enrollments}+` },
                { icon: Award, label: "Level", value: LEVEL_LABELS[course.level] },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-3 text-center shadow-sm sm:p-4">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                    <s.icon size={15} className="text-[#FF9900]" />
                  </div>
                  <p className="truncate text-sm font-bold text-gray-900">{s.value}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1a2332] to-[#232F3E] p-4 text-white sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
                <Star size={16} className="text-[#FF9900]" /> Why This Course?
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: ShieldCheck, text: "100% Effort guaranteed" },
                  { icon: Briefcase, text: "Direct referrals to 45+ companies" },
                  { icon: GraduationCap, text: "Azure AZ-900 certification prep" },
                  { icon: TrendingUp, text: "Live projects & portfolio building" },
                  { icon: Users, text: "Dedicated counsellor from Day 1" },
                  { icon: Zap, text: "Fast-track placement — avg 6 weeks" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#FF9900]/15">
                      <Icon size={13} className="text-[#FF9900]" />
                    </div>
                    <span className="min-w-0 text-xs text-gray-300">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-base font-bold text-gray-900 sm:mb-5 sm:text-lg">About This Course</h2>
              <DescriptionRenderer text={course.description} />
            </div>

            {/* Curriculum */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900 sm:text-lg">Course Curriculum</h2>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {totalModules} module{totalModules !== 1 ? "s" : ""} · {totalLessons} lessons
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allIds = new Set(course.modules.map((m) => m.id));
                    const allOpen = course.modules.every((m) => expandedModules.has(m.id));
                    setExpandedModules(allOpen ? new Set() : allIds);
                  }}
                  className="self-start text-xs font-semibold text-[#FF9900] hover:underline sm:self-auto"
                >
                  {course.modules.every((m) => expandedModules.has(m.id)) ? "Collapse all" : "Expand all"}
                </button>
              </div>

              {course.modules.length === 0 ? (
                <div className="py-10 text-center">
                  <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-200" />
                  <p className="text-sm text-gray-400">Curriculum coming soon.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {course.modules.map((mod, mi) => {
                    const isOpen = expandedModules.has(mod.id);
                    const previewCount = mod.lessons.filter((l) => l.isPreview).length;
                    return (
                      <div key={mod.id} className="overflow-hidden rounded-xl border border-gray-200">
                        <button
                          onClick={() => toggleModule(mod.id)}
                          className="group flex w-full items-center gap-2.5 bg-gray-50 px-3 py-3 text-left transition hover:bg-gray-100 sm:gap-3 sm:px-4 sm:py-4"
                        >
                          {/* Badge shrinks on phones so the title keeps its width */}
                          <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#232F3E] to-[#37475A] text-white shadow-sm transition-all duration-200 group-hover:from-[#FF9900] group-hover:to-[#e88d00] group-hover:text-gray-900 sm:h-14 sm:w-14">
                            <span className="text-[8px] font-semibold uppercase leading-none tracking-wider opacity-70 sm:text-[9px]">
                              Module
                            </span>
                            <span className="text-lg font-bold leading-tight sm:text-2xl">{mi + 1}</span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold leading-snug text-gray-900">{mod.title}</p>
                            {mod.description && (
                              <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{mod.description}</p>
                            )}
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
                              <span>{mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}</span>
                              {previewCount > 0 && (
                                <span className="font-semibold text-[#FF9900]">{previewCount} free preview</span>
                              )}
                            </div>
                          </div>

                          {isOpen
                            ? <ChevronDown size={16} className="flex-shrink-0 text-gray-400" />
                            : <ChevronRight size={16} className="flex-shrink-0 text-gray-400" />}
                        </button>

                        {isOpen && (
                          <div className="divide-y divide-gray-50">
                            {mod.lessons.map((lesson, li) => (
                              <div key={lesson.id} className="flex items-center gap-2.5 px-3 py-3 transition hover:bg-gray-50 sm:gap-3 sm:px-4">
                                <span className="w-4 flex-shrink-0 text-right text-xs text-gray-300 sm:w-5">{li + 1}</span>
                                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${lesson.isPreview ? "bg-orange-50" : "bg-gray-100"}`}>
                                  {lesson.isPreview
                                    ? <Play size={12} className="text-[#FF9900]" />
                                    : <Lock size={12} className="text-gray-300" />}
                                </div>
                                {/* Wraps to two lines on phones instead of truncating mid-word */}
                                <span className={`min-w-0 flex-1 text-sm leading-snug ${lesson.isPreview ? "font-medium text-gray-800" : "text-gray-500"}`}>
                                  {lesson.title}
                                </span>
                                {lesson.isPreview && (
                                  <span className="flex-shrink-0 rounded-full border border-orange-100 bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold text-[#FF9900] sm:px-2 sm:text-[10px]">
                                    FREE
                                  </span>
                                )}
                                {lesson.duration && (
                                  <span className="hidden flex-shrink-0 text-xs text-gray-400 xs:inline">{lesson.duration}</span>
                                )}
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
                <div className="mt-6 rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 text-center sm:p-5">
                  <p className="mb-1 text-sm font-bold text-gray-900">Ready to start your journey?</p>
                  <p className="mb-4 text-xs text-gray-500">
                    Get full access to the entire {durationLabel} program · 100% Effort guaranteed
                  </p>
                  <CheckoutAction />
                </div>
              )}
            </div>

            {/* What you'll learn */}
            {course.modules.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="mb-4 text-base font-bold text-gray-900 sm:text-lg">What You&apos;ll Learn</h2>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {course.modules.map((mod, mi) => (
                    <div key={mod.id} className="flex items-start gap-2.5 rounded-xl bg-gray-50 p-3 transition hover:bg-orange-50">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#FF9900] text-xs font-bold text-gray-900">
                        {mi + 1}
                      </div>
                      <span className="min-w-0 text-sm font-medium text-gray-700">{mod.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile checkout bar ──
          Fixed to the bottom rather than sticky at the top: it stays reachable
          by thumb, doesn't fight the navbar for the top of the screen, and can't
          be scrolled past. safe-area padding keeps it clear of the iPhone home
          indicator. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden"
           style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">
                {effectivePrice === 0 ? "Free" : `₹${effectivePrice.toFixed(0)}`}
              </span>
              {course.discount > 0 && (
                <span className="text-xs text-gray-400 line-through">₹{course.price}</span>
              )}
            </div>
            {course.discount > 0 && (
              <span className="text-[11px] font-bold text-emerald-600">{course.discount}% off</span>
            )}
          </div>
          <CheckoutAction compact />
        </div>
      </div>
    </div>
  );
}