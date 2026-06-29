"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Play, Lock, CheckCircle, BookOpen, Loader2, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Lesson {
  id: string; title: string; description?: string | null;
  videoUrl?: string | null; notesUrl?: string | null;
  duration?: string | null; isPreview: boolean; order: number;
}
interface Module { id: string; title: string; description?: string | null; order: number; lessons: Lesson[]; }
interface Course {
  id: string; title: string; slug: string; thumbnailUrl?: string | null;
  instructor?: string | null; duration?: string | null;
  modules: Module[];
}

export default function CoursePlayerPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;

    // Fetch course + check enrollment
    Promise.all([
      fetch(`/api/courses/${slug}`).then(r => r.json()),
      axios.get("/api/enrollments"),
    ]).then(([courseData, enrollRes]) => {
      const isEnrolled = enrollRes.data.some((e: any) => e.courseId === courseData.id);
      if (!isEnrolled) {
        toast.error("You are not enrolled in this course");
        router.push(`/courses/${slug}`);
        return;
      }
      setCourse(courseData);
      // Auto-select first lesson
      const firstLesson = courseData.modules?.[0]?.lessons?.[0];
      if (firstLesson) setActiveLesson(firstLesson);
      // Expand all modules
      const allIds = new Set<string>(courseData.modules?.map((m: Module) => m.id) ?? []);
      setExpandedModules(allIds);
    }).catch(() => router.push("/dashboard/courses")).finally(() => setLoading(false));
  }, [slug, status, router]);

  function toggleModule(id: string) {
    setExpandedModules(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const totalLessons = course?.modules.reduce((a, m) => a + m.lessons.length, 0) ?? 0;

  if (loading || status === "loading") return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
    </div>
  );
  if (!course) return null;

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[#1a2332]">
      {/* Course title */}
      <div className="p-4 border-b border-white/10">
        <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-3 transition">
          <ArrowLeft size={13} /> My Courses
        </Link>
        <h2 className="text-white font-bold text-sm leading-snug line-clamp-2">{course.title}</h2>
        {course.instructor && <p className="text-gray-500 text-xs mt-1">{course.instructor}</p>}
        <p className="text-gray-500 text-xs mt-1">{totalLessons} lessons</p>
      </div>

      {/* Modules */}
      <div className="flex-1 overflow-y-auto py-2">
        {course.modules.map((mod, mi) => {
          const isOpen = expandedModules.has(mod.id);
          return (
            <div key={mod.id}>
              <button onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition text-left">
                <span className="w-6 h-6 rounded-lg bg-[#FF9900] text-gray-900 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {mi + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{mod.title}</p>
                  <p className="text-gray-500 text-[10px]">{mod.lessons.length} lessons</p>
                </div>
                {isOpen ? <ChevronDown size={13} className="text-gray-500 flex-shrink-0" /> : <ChevronRight size={13} className="text-gray-500 flex-shrink-0" />}
              </button>

              {isOpen && mod.lessons.map((lesson, li) => {
                const isActive = activeLesson?.id === lesson.id;
                return (
                  <button key={lesson.id} onClick={() => { setActiveLesson(lesson); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2 pl-10 pr-4 py-2.5 transition text-left ${isActive ? "bg-[#FF9900]/15 border-r-2 border-[#FF9900]" : "hover:bg-white/5"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "bg-[#FF9900] text-gray-900" : "bg-white/10"}`}>
                      <Play size={9} className={isActive ? "text-gray-900" : "text-gray-400"} />
                    </div>
                    <span className={`text-xs leading-snug flex-1 min-w-0 truncate ${isActive ? "text-white font-semibold" : "text-gray-400"}`}>
                      {lesson.title}
                    </span>
                    {lesson.duration && <span className="text-[10px] text-gray-600 flex-shrink-0">{lesson.duration}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 h-screen sticky top-0 overflow-hidden border-r border-white/10">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 h-full"><Sidebar /></aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="bg-[#232F3E] border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition">
            <BookOpen size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{activeLesson?.title ?? "Select a lesson"}</p>
            <p className="text-gray-500 text-xs">{course.title}</p>
          </div>
          <Link href={`/courses/${slug}`} className="text-xs text-gray-400 hover:text-white transition hidden sm:inline-flex items-center gap-1">
            <ExternalLink size={12} /> Course Page
          </Link>
        </div>

        {/* Video / Content area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {!activeLesson ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <BookOpen className="h-12 w-12 text-gray-700 mb-4" />
              <p className="text-gray-400 font-semibold">Select a lesson to start</p>
              <p className="text-gray-600 text-sm mt-1">Choose from the sidebar</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-5">
              {/* Video player */}
              {activeLesson.videoUrl ? (
                <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-video">
                    {activeLesson.videoUrl.includes("youtube.com") || activeLesson.videoUrl.includes("youtu.be") ? (
                      <iframe
                        src={activeLesson.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <video controls className="w-full h-full" key={activeLesson.id}>
                        <source src={activeLesson.videoUrl} />
                        Your browser does not support video playback.
                      </video>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#1a2332] border border-white/10 rounded-2xl aspect-video flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#FF9900]/15 flex items-center justify-center mb-3">
                    <Play size={28} className="text-[#FF9900]" />
                  </div>
                  <p className="text-gray-400 font-semibold">Video coming soon</p>
                  <p className="text-gray-600 text-xs mt-1">Content is being prepared</p>
                </div>
              )}

              {/* Lesson info */}
              <div className="bg-[#1a2332] border border-white/10 rounded-2xl p-5 sm:p-6">
                <h1 className="text-white text-xl font-bold mb-2">{activeLesson.title}</h1>
                {activeLesson.duration && (
                  <p className="text-gray-500 text-xs mb-4">Duration: {activeLesson.duration}</p>
                )}
                {activeLesson.description && (
                  <p className="text-gray-400 text-sm leading-relaxed">{activeLesson.description}</p>
                )}
                {activeLesson.notesUrl && (
                  <a href={activeLesson.notesUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-4 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold text-sm px-4 py-2.5 rounded-xl transition">
                    <ExternalLink size={14} /> Download Notes
                  </a>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                {(() => {
                  const allLessons = course.modules.flatMap(m => m.lessons);
                  const currentIdx = allLessons.findIndex(l => l.id === activeLesson.id);
                  const prev = allLessons[currentIdx - 1];
                  const next = allLessons[currentIdx + 1];
                  return (
                    <>
                      <button onClick={() => prev && setActiveLesson(prev)} disabled={!prev}
                        className="flex-1 border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold py-3 rounded-xl text-sm transition disabled:opacity-30 disabled:cursor-not-allowed">
                        ← Previous
                      </button>
                      <button onClick={() => next && setActiveLesson(next)} disabled={!next}
                        className="flex-1 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold py-3 rounded-xl text-sm transition disabled:opacity-30 disabled:cursor-not-allowed">
                        Next →
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}