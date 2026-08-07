"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Play, CheckCircle, Circle, BookOpen, Loader2, ChevronDown, ChevronRight, Award, FileText, Download } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Lesson {
  id: string; title: string; content?: string | null; videoUrl?: string | null; notesUrl?: string | null;
  duration?: string | null; isPreview: boolean; order: number;
}
interface Module {
  id: string; title: string; order: number; lessons: Lesson[];
  quiz: { id: string } | null;
}
interface Course {
  id: string; title: string; slug: string; modules: Module[];
}

export default function LearnPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;

    fetch(`/api/courses/${slug}`).then(r => r.json()).then(async courseData => {
      const enrollRes = await axios.get("/api/enrollments");
      const enrollment = enrollRes.data.find((e: any) => e.course.slug === slug);
      if (!enrollment) { toast.error("You are not enrolled."); router.push(`/courses/${slug}`); return; }

      setCourse(courseData);
      setExpanded(new Set(courseData.modules.map((m: Module) => m.id)));
      const first = courseData.modules?.[0]?.lessons?.[0];
      if (first) setActiveLesson(first);

      // Load real completion state
      try {
        const progRes = await axios.get(`/api/enrollments/${courseData.id}/progress`);
        setProgressMap(progRes.data);
      } catch { /* non-fatal — progress just starts empty */ }
    }).finally(() => setLoading(false));
  }, [slug, status, router]);

  async function markComplete() {
    if (!activeLesson) return;
    setMarking(true);
    try {
      await axios.post(`/api/lessons/${activeLesson.id}/complete`);
      setProgressMap(prev => ({ ...prev, [activeLesson.id]: true }));
      toast.success("Marked complete!");
    } catch {
      toast.error("Failed to update progress.");
    } finally {
      setMarking(false);
    }
  }

  function toggleModule(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  if (loading || status === "loading") {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" /></div>;
  }
  if (!course) return null;

  const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
  const doneCount = Object.values(progressMap).filter(Boolean).length;
  const overallProgress = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <aside className="hidden lg:flex flex-col w-80 flex-shrink-0 h-screen sticky top-0 bg-[#1a2332] border-r border-white/10">
        <div className="p-4 border-b border-white/10">
          <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-3">
            <ArrowLeft size={13} /> My Courses
          </Link>
          <h2 className="text-white font-bold text-sm leading-snug">{course.title}</h2>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span><span>{overallProgress}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF9900] transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {course.modules.map((mod, mi) => {
            const isOpen = expanded.has(mod.id);
            const moduleDone = mod.lessons.length > 0 && mod.lessons.every(l => progressMap[l.id]);
            return (
              <div key={mod.id}>
                <button onClick={() => toggleModule(mod.id)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 text-left">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${moduleDone ? "bg-emerald-500 text-white" : "bg-[#FF9900] text-gray-900"}`}>
                    {moduleDone ? <CheckCircle size={13} /> : mi + 1}
                  </span>
                  <span className="flex-1 text-white text-xs font-semibold truncate">{mod.title}</span>
                  {isOpen ? <ChevronDown size={13} className="text-gray-500" /> : <ChevronRight size={13} className="text-gray-500" />}
                </button>
                {isOpen && (
                  <>
                    {mod.lessons.map(lesson => {
                      const isActive = activeLesson?.id === lesson.id;
                      const done = progressMap[lesson.id];
                      return (
                        <button key={lesson.id} onClick={() => setActiveLesson(lesson)}
                          className={`w-full flex items-center gap-2 pl-10 pr-4 py-2.5 text-left ${isActive ? "bg-[#FF9900]/15 border-r-2 border-[#FF9900]" : "hover:bg-white/5"}`}>
                          {done ? <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" /> : <Circle size={14} className="text-gray-600 flex-shrink-0" />}
                          <span className={`text-xs flex-1 truncate ${isActive ? "text-white font-semibold" : "text-gray-400"}`}>{lesson.title}</span>
                        </button>
                      );
                    })}
                    {mod.quiz && (
                      <Link href={`/dashboard/courses/${slug}/quiz/${mod.id}`}
                        className="flex items-center gap-2 pl-10 pr-4 py-2.5 text-xs text-[#FF9900] font-semibold hover:bg-white/5">
                        <Award size={14} /> Module Quiz
                      </Link>
                    )}
                  </>
                )}
              </div>
            );
          })}
          {overallProgress === 100 && (
            <Link href={`/dashboard/courses/${slug}/certificate`}
              className="mx-4 mt-4 flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl">
              <Award size={14} /> Get Certificate
            </Link>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="bg-[#232F3E] border-b border-white/10 px-4 py-3">
          <p className="text-white text-sm font-semibold truncate">{activeLesson?.title ?? "Select a lesson"}</p>
        </div>
        <div className="flex-1 p-4 sm:p-8">
          {!activeLesson ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <BookOpen className="h-12 w-12 text-gray-700 mb-4" />
              <p className="text-gray-400 font-semibold">Select a lesson to start</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-5">
              {activeLesson.videoUrl && (
                <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
                  {activeLesson.videoUrl.includes("youtube") ? (
                    <iframe src={activeLesson.videoUrl.replace("watch?v=", "embed/")} className="w-full h-full" allowFullScreen />
                  ) : (
                    <video controls className="w-full h-full" key={activeLesson.id}><source src={activeLesson.videoUrl} /></video>
                  )}
                </div>
              )}

              {!activeLesson.videoUrl && !activeLesson.content && (
                <div className="bg-[#1a2332] border border-white/10 rounded-2xl aspect-video flex items-center justify-center">
                  <Play size={28} className="text-[#FF9900]" />
                </div>
              )}

              {activeLesson.content && (
                <div className="bg-[#1a2332] border border-white/10 rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-4 text-[#FF9900]">
                    <FileText size={16} /><span className="text-xs font-semibold uppercase tracking-wide">Lesson Content</span>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-300 text-[15px] leading-relaxed font-mono">
                    {activeLesson.content}
                  </div>
                </div>
              )}

              {activeLesson.notesUrl && (
                <a href={activeLesson.notesUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1a2332] hover:bg-[#232F3E] border border-white/10 text-gray-300 text-sm px-4 py-2.5 rounded-xl transition">
                  <Download size={14} /> Download notes
                </a>
              )}

              <div className="bg-[#1a2332] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                <h1 className="text-white text-lg font-bold">{activeLesson.title}</h1>
                <button onClick={markComplete} disabled={marking || progressMap[activeLesson.id]}
                  className="flex-shrink-0 inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] disabled:opacity-50 text-gray-900 font-bold text-sm px-4 py-2 rounded-xl transition">
                  {progressMap[activeLesson.id] ? <><CheckCircle size={15} /> Completed</> : marking ? "Saving..." : "Mark Complete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}