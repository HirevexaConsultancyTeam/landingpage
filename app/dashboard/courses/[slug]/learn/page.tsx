// ============================================================================
//  DESTINATION:  app/dashboard/courses/[slug]/learn/page.tsx
//  RENAME THIS FILE TO:  page.tsx
//
//  This is the COURSE PLAYER. It fetches /api/courses/[slug]/content
//  (the enrolled-only route) and renders the full structured lesson,
//  practice drills, and module locking.
//
//  Verify after saving:
//    grep -c "content" "app/dashboard/courses/[slug]/learn/page.tsx"
//  A result of 0 means the old file is still in place.
// ============================================================================
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, CheckCircle, Circle, Lock, Loader2, ChevronDown, ChevronRight,
  Award, Download, Target, Lightbulb, AlertTriangle, Briefcase, Globe, Flag, Play, FileText,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

/* ─────────────────────────── types ─────────────────────────── */

interface CodeExample { title: string; language: string; code: string; output?: string; notes?: string; }
interface VisualExample { caption: string; diagram: string; }
interface Exercise {
  id: string; order: number; type: string; prompt: string;
  payload: { options?: string[] }; hint?: string | null;
  starterCode?: string | null;
}
interface Lesson {
  id: string; title: string; order: number; locked: boolean; completed: boolean;
  durationMinutes?: number | null; duration?: string | null;
  videoUrl?: string | null; notesUrl?: string | null;
  content?: string | null; theory?: string | null;
  learningObjectives?: string[]; codeExamples?: CodeExample[] | null;
  visualExamples?: VisualExample[] | null; notes?: string | null;
  interviewTips?: string[]; commonMistakes?: string[]; bestPractices?: string[];
  realWorldExample?: string | null; summary?: string | null;
  exercises?: Exercise[];
}
interface Module {
  id: string; title: string; summary?: string | null; order: number;
  status: "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "COMPLETED";
  isFinalExam: boolean; hasQuiz: boolean; bestQuizScore: number;
  lessonsTotal: number; lessonsCompleted: number;
  quiz: { id: string; title: string; passScore: number } | null;
  lessons: Lesson[];
}
interface CourseContent { id: string; title: string; slug: string; modules: Module[]; }

/* ───────────────────────── small pieces ────────────────────── */

function Block({
  icon: Icon, label, children,
}: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <section className="bg-[#1a2332] border border-white/10 rounded-2xl p-5 sm:p-7">
      <div className="flex items-center gap-2 mb-4 text-[#FF9900]">
        <Icon size={15} />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em]">{label}</h2>
      </div>
      {children}
    </section>
  );
}

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="space-y-2.5">
    {items.map((t, i) => (
      <li key={i} className="flex gap-3 text-gray-300 text-[15px] leading-relaxed">
        <span className="text-[#FF9900] mt-1.5 h-1 w-1 rounded-full bg-current shrink-0" />
        <span>{t}</span>
      </li>
    ))}
  </ul>
);

const Prose = ({ text }: { text: string }) => (
  <div className="text-gray-300 text-[15px] leading-[1.75] whitespace-pre-wrap">{text}</div>
);

/* ───────────────────────────  drill  ───────────────────────── */

function Drill({ exercise, index }: { exercise: Exercise; index: number }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [multi, setMulti] = useState<number[]>([]);
  const [text, setText] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean; selfAssessed: boolean;
    solution?: string | null; explanation?: string | null; expectedOutput?: string | null;
  } | null>(null);

  const options = exercise.payload?.options ?? [];
  const isMulti = exercise.type === "MULTIPLE_SELECT";
  const isText = exercise.type === "FILL_BLANK" || exercise.type === "SHORT_ANSWER";
  const isTF = exercise.type === "TRUE_FALSE";
  const isCoding = exercise.type === "CODING";

  async function submit(selfMark?: boolean) {
    const response = isCoding ? (selfMark ?? false)
      : isMulti ? multi
      : isText ? text
      : isTF ? selected === 0
      : selected;

    if (!isCoding && response === null) { toast.error("Pick an answer first."); return; }
    if (isText && !text.trim()) { toast.error("Type an answer first."); return; }

    setBusy(true);
    try {
      const { data } = await axios.post(`/api/exercises/${exercise.id}/submit`, { response });
      setResult(data);
    } catch {
      toast.error("Couldn't check that answer.");
    } finally {
      setBusy(false);
    }
  }

  const label = exercise.type.replace(/_/g, " ").toLowerCase();

  return (
    <div className="bg-[#0f1720] border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9900] bg-[#FF9900]/10 px-2 py-1 rounded">
          Drill {index + 1} · {label}
        </span>
      </div>

      <p className="text-gray-200 text-[15px] leading-relaxed whitespace-pre-wrap mb-4">{exercise.prompt}</p>

      {isCoding && exercise.starterCode && (
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 text-[13px] text-gray-300 overflow-x-auto mb-4 font-mono">
          {exercise.starterCode}
        </pre>
      )}

      {!result && (
        <>
          {(isTF ? ["True", "False"] : options).length > 0 && (
            <div className="space-y-2 mb-4">
              {(isTF ? ["True", "False"] : options).map((opt, oi) => {
                const active = isMulti ? multi.includes(oi) : selected === oi;
                return (
                  <button
                    key={oi}
                    onClick={() =>
                      isMulti
                        ? setMulti((p) => (p.includes(oi) ? p.filter((x) => x !== oi) : [...p, oi]))
                        : setSelected(oi)
                    }
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-lg border transition ${
                      active ? "border-[#FF9900] bg-[#FF9900]/10" : "border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <span className={`mt-0.5 h-4 w-4 shrink-0 border ${isMulti ? "rounded" : "rounded-full"} ${
                      active ? "bg-[#FF9900] border-[#FF9900]" : "border-white/25"
                    }`} />
                    <span className="text-sm text-gray-300 whitespace-pre-wrap">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {isText && (
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your answer"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-[#FF9900] mb-4"
            />
          )}

          <div className="flex flex-wrap items-center gap-2">
            {isCoding ? (
              <button onClick={() => submit()} disabled={busy}
                className="bg-[#FF9900] text-gray-900 font-bold text-sm px-4 py-2 rounded-lg disabled:opacity-50">
                {busy ? "Loading..." : "Show reference solution"}
              </button>
            ) : (
              <button onClick={() => submit()} disabled={busy}
                className="bg-[#FF9900] text-gray-900 font-bold text-sm px-4 py-2 rounded-lg disabled:opacity-50">
                {busy ? "Checking..." : "Check answer"}
              </button>
            )}
            {exercise.hint && (
              <button onClick={() => setShowHint((s) => !s)}
                className="border border-white/10 text-gray-400 text-sm px-4 py-2 rounded-lg hover:bg-white/5">
                {showHint ? "Hide hint" : "Hint"}
              </button>
            )}
          </div>

          {showHint && exercise.hint && (
            <p className="mt-3 text-sm text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              {exercise.hint}
            </p>
          )}
        </>
      )}

      {result && (
        <div className="space-y-3">
          {!result.selfAssessed && (
            <div className={`flex items-center gap-2 text-sm font-semibold ${
              result.isCorrect ? "text-emerald-400" : "text-red-400"
            }`}>
              {result.isCorrect ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {result.isCorrect ? "Correct" : "Not quite"}
            </div>
          )}

          {result.solution && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Answer</p>
              <pre className="bg-black/40 border border-white/10 rounded-lg p-4 text-[13px] text-emerald-300 overflow-x-auto font-mono whitespace-pre-wrap">
                {result.solution}
              </pre>
            </div>
          )}

          {result.expectedOutput && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Expected output</p>
              <pre className="bg-black/40 border border-white/10 rounded-lg p-3 text-[13px] text-gray-300 font-mono">
                {result.expectedOutput}
              </pre>
            </div>
          )}

          {result.explanation && <Prose text={result.explanation} />}

          {result.selfAssessed && (
            <p className="text-xs text-gray-500">
              Coding drills aren't auto-graded — compare your version against the reference above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── page ──────────────────────────── */

export default function LearnPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { status } = useSession();

  const [course, setCourse] = useState<CourseContent | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get<CourseContent>(`/api/courses/${slug}/content`);
      setCourse(data);
      setExpanded(new Set(data.modules.filter((m) => m.status !== "LOCKED").map((m) => m.id)));
      setActiveId((prev) => {
        if (prev) return prev;
        const open = data.modules.find((m) => m.status !== "LOCKED");
        const next = open?.lessons.find((l) => !l.completed) ?? open?.lessons[0];
        return next?.id ?? null;
      });
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      if (e.response?.status === 403) {
        toast.error(e.response.data?.message ?? "You're not enrolled in this course.");
        router.push(`/courses/${slug}`);
        return;
      }
      toast.error("Couldn't load this course.");
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") load();
  }, [status, load, router]);

  const flat = useMemo(
    () => (course?.modules ?? []).flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id }))),
    [course]
  );
  const active = flat.find((l) => l.id === activeId) ?? null;
  const activeModule = course?.modules.find((m) => m.id === active?.moduleId) ?? null;
  const activeIdx = flat.findIndex((l) => l.id === activeId);
  const nextLesson = flat.slice(activeIdx + 1).find((l) => !l.locked) ?? null;

  const totals = useMemo(() => {
    const t = (course?.modules ?? []).reduce(
      (a, m) => ({ done: a.done + m.lessonsCompleted, all: a.all + m.lessonsTotal }),
      { done: 0, all: 0 }
    );
    return { ...t, pct: t.all > 0 ? Math.round((t.done / t.all) * 100) : 0 };
  }, [course]);

  async function markComplete() {
    if (!active) return;
    setMarking(true);
    try {
      await axios.post(`/api/lessons/${active.id}/complete`);
      await load();
      toast.success("Lesson complete.");
      if (nextLesson) setActiveId(nextLesson.id);
    } catch {
      toast.error("Couldn't save your progress.");
    } finally {
      setMarking(false);
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
      </div>
    );
  }
  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* ── sidebar ── */}
      <aside className="hidden lg:flex flex-col w-80 shrink-0 h-screen sticky top-0 bg-[#1a2332] border-r border-white/10">
        <div className="p-4 border-b border-white/10">
          <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs mb-3">
            <ArrowLeft size={13} /> My courses
          </Link>
          <h2 className="text-white font-bold text-sm leading-snug">{course.title}</h2>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>{totals.done} of {totals.all} lessons</span>
              <span>{totals.pct}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF9900] transition-all" style={{ width: `${totals.pct}%` }} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {course.modules.map((mod, mi) => {
            const locked = mod.status === "LOCKED";
            const done = mod.status === "COMPLETED";
            const open = expanded.has(mod.id);

            return (
              <div key={mod.id} className={locked ? "opacity-45" : ""}>
                <button
                  disabled={locked}
                  onClick={() =>
                    setExpanded((p) => {
                      const n = new Set(p);
                      n.has(mod.id) ? n.delete(mod.id) : n.add(mod.id);
                      return n;
                    })
                  }
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 text-left disabled:cursor-not-allowed"
                >
                  <span className={`w-6 h-6 rounded-lg grid place-items-center text-[11px] font-bold shrink-0 ${
                    done ? "bg-emerald-500 text-white"
                      : locked ? "bg-white/10 text-gray-500"
                      : "bg-[#FF9900] text-gray-900"
                  }`}>
                    {done ? <CheckCircle size={13} /> : locked ? <Lock size={11} /> : mi + 1}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-white text-xs font-semibold truncate">{mod.title}</span>
                    <span className="block text-[10px] text-gray-500">
                      {locked ? "Locked" : `${mod.lessonsCompleted}/${mod.lessonsTotal} lessons`}
                    </span>
                  </span>
                  {!locked && (open ? <ChevronDown size={13} className="text-gray-500" /> : <ChevronRight size={13} className="text-gray-500" />)}
                </button>

                {open && !locked && (
                  <>
                    {mod.lessons.map((lesson) => {
                      const isActive = activeId === lesson.id;
                      return (
                        <button key={lesson.id} onClick={() => setActiveId(lesson.id)}
                          className={`w-full flex items-center gap-2 pl-10 pr-4 py-2.5 text-left ${
                            isActive ? "bg-[#FF9900]/15 border-r-2 border-[#FF9900]" : "hover:bg-white/5"
                          }`}>
                          {lesson.completed
                            ? <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                            : <Circle size={14} className="text-gray-600 shrink-0" />}
                          <span className={`text-xs flex-1 truncate ${isActive ? "text-white font-semibold" : "text-gray-400"}`}>
                            {lesson.title}
                          </span>
                        </button>
                      );
                    })}
                    {mod.hasQuiz && (
                      <Link href={`/dashboard/courses/${slug}/quiz/${mod.id}`}
                        className="flex items-center gap-2 pl-10 pr-4 py-2.5 text-xs text-[#FF9900] font-semibold hover:bg-white/5">
                        <Award size={14} />
                        {mod.isFinalExam ? "Final assessment" : "Module assessment"}
                        {mod.bestQuizScore > 0 && (
                          <span className="ml-auto text-[10px] text-gray-500">best {mod.bestQuizScore}%</span>
                        )}
                      </Link>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {course.modules.length > 0 && course.modules.every((m) => m.status === "COMPLETED") && (
            <Link href={`/dashboard/courses/${slug}/certificate`}
              className="mx-4 mt-4 flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl">
              <Award size={14} /> Get your certificate
            </Link>
          )}
        </div>
      </aside>

      {/* ── main ── */}
      <main className="flex-1 min-w-0">
        <div className="bg-[#232F3E] border-b border-white/10 px-4 sm:px-8 py-3 sticky top-0 z-10">
          <p className="text-white text-sm font-semibold truncate">{active?.title ?? "Pick a lesson"}</p>
          {activeModule && <p className="text-[11px] text-gray-500">{activeModule.title}</p>}
        </div>

        <div className="p-4 sm:p-8">
          {!active ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
              <Lock className="h-10 w-10 mb-3 text-gray-700" />
              <p className="font-semibold text-gray-400">Nothing unlocked yet</p>
              <p className="text-sm">Your first module opens as soon as the course is published.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              <header className="pb-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500 mb-1">
                  Lesson {active.order}
                  {active.durationMinutes ? ` · ${active.durationMinutes} min` : ""}
                </p>
                <h1 className="text-white text-2xl font-bold leading-tight">{active.title}</h1>
              </header>

              {active.videoUrl && (
                <div className="bg-black rounded-2xl overflow-hidden aspect-video">
                  {active.videoUrl.includes("youtube") ? (
                    <iframe src={active.videoUrl.replace("watch?v=", "embed/")} className="w-full h-full" allowFullScreen />
                  ) : (
                    <video controls className="w-full h-full" key={active.id}>
                      <source src={active.videoUrl} />
                    </video>
                  )}
                </div>
              )}

              {!!active.learningObjectives?.length && (
                <Block icon={Target} label="What this tests">
                  <Bullets items={active.learningObjectives} />
                </Block>
              )}

              {active.theory && (
                <Block icon={FileText} label="The concept">
                  <Prose text={active.theory} />
                </Block>
              )}

              {/* Legacy fallback for lessons authored before the structured fields */}
              {!active.theory && active.content && (
                <Block icon={FileText} label="Lesson content">
                  <Prose text={active.content} />
                </Block>
              )}

              {!!active.visualExamples?.length && (
                <Block icon={Play} label="Visual model">
                  <div className="space-y-4">
                    {active.visualExamples.map((v, i) => (
                      <div key={i}>
                        <p className="text-sm text-gray-400 mb-2">{v.caption}</p>
                        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 text-[12.5px] leading-relaxed text-gray-300 overflow-x-auto font-mono">
                          {v.diagram}
                        </pre>
                      </div>
                    ))}
                  </div>
                </Block>
              )}

              {!!active.codeExamples?.length && (
                <Block icon={FileText} label="Worked examples">
                  <div className="space-y-6">
                    {active.codeExamples.map((ex, i) => (
                      <div key={i}>
                        <p className="text-sm text-white font-semibold mb-2">{i + 1}. {ex.title}</p>
                        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 text-[13px] text-gray-300 overflow-x-auto font-mono">
                          {ex.code}
                        </pre>
                        {ex.output && (
                          <div className="mt-2">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Output</p>
                            <pre className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 text-[13px] text-emerald-300 overflow-x-auto font-mono">
                              {ex.output}
                            </pre>
                          </div>
                        )}
                        {ex.notes && <p className="mt-2 text-sm text-gray-400">{ex.notes}</p>}
                      </div>
                    ))}
                  </div>
                </Block>
              )}

              {active.notes && (
                <Block icon={Lightbulb} label="Notes">
                  <Prose text={active.notes} />
                </Block>
              )}

              {!!active.interviewTips?.length && (
                <Block icon={Lightbulb} label="How to answer">
                  <Bullets items={active.interviewTips} />
                </Block>
              )}

              {!!active.commonMistakes?.length && (
                <Block icon={AlertTriangle} label="What loses marks">
                  <Bullets items={active.commonMistakes} />
                </Block>
              )}

              {!!active.bestPractices?.length && (
                <Block icon={Briefcase} label="Professional practice">
                  <Bullets items={active.bestPractices} />
                </Block>
              )}

              {active.realWorldExample && (
                <Block icon={Globe} label="Where it shows up">
                  <Prose text={active.realWorldExample} />
                </Block>
              )}

              {active.summary && (
                <div className="bg-[#FF9900]/10 border border-[#FF9900]/25 rounded-2xl p-5 sm:p-7">
                  <div className="flex items-center gap-2 mb-3 text-[#FF9900]">
                    <Flag size={15} />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.14em]">Takeaway</h2>
                  </div>
                  <Prose text={active.summary} />
                </div>
              )}

              {!!active.exercises?.length && (
                <Block icon={Target} label={`Practice drills (${active.exercises.length})`}>
                  <div className="space-y-4">
                    {active.exercises.map((ex, i) => (
                      <Drill key={ex.id} exercise={ex} index={i} />
                    ))}
                  </div>
                </Block>
              )}

              {active.notesUrl && (
                <a href={active.notesUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1a2332] hover:bg-[#232F3E] border border-white/10 text-gray-300 text-sm px-4 py-2.5 rounded-xl">
                  <Download size={14} /> Download notes
                </a>
              )}

              <div className="bg-[#1a2332] border border-white/10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
                <button onClick={markComplete} disabled={marking || active.completed}
                  className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] disabled:opacity-50 text-gray-900 font-bold text-sm px-4 py-2.5 rounded-xl">
                  {active.completed ? <><CheckCircle size={15} /> Completed</> : marking ? "Saving..." : "Mark complete and continue"}
                </button>

                {nextLesson ? (
                  <button onClick={() => setActiveId(nextLesson.id)}
                    className="inline-flex items-center gap-2 border border-white/10 text-gray-300 text-sm px-4 py-2.5 rounded-xl hover:bg-white/5">
                    Next lesson <ArrowRight size={14} />
                  </button>
                ) : activeModule?.hasQuiz ? (
                  <Link href={`/dashboard/courses/${slug}/quiz/${activeModule.id}`}
                    className="inline-flex items-center gap-2 border border-white/10 text-gray-300 text-sm px-4 py-2.5 rounded-xl hover:bg-white/5">
                    <Award size={14} /> Take the assessment
                  </Link>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}