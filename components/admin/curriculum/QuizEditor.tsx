"use client";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2, Award, Check, Loader2, Settings2 } from "lucide-react";

type QType = "MCQ" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "FILL_BLANK" | "OUTPUT_PREDICTION" | "SHORT_ANSWER";

const TYPES: { value: QType; label: string }[] = [
  { value: "MCQ", label: "Multiple choice" },
  { value: "MULTIPLE_SELECT", label: "Multiple select" },
  { value: "TRUE_FALSE", label: "True / false" },
  { value: "OUTPUT_PREDICTION", label: "Output prediction" },
  { value: "FILL_BLANK", label: "Fill the blank" },
  { value: "SHORT_ANSWER", label: "Short answer" },
];

const USES_OPTIONS: QType[] = ["MCQ", "MULTIPLE_SELECT", "TRUE_FALSE", "OUTPUT_PREDICTION"];
const USES_TEXT: QType[] = ["FILL_BLANK", "SHORT_ANSWER"];

interface Question {
  id: string; question: string; options: string[]; correctOption: number;
  correctOptions: number[]; acceptableAnswers: string[];
  type: QType; difficulty: "EASY" | "MEDIUM" | "HARD"; points: number;
  topic: string | null; explanation: string | null; order: number;
}
interface Quiz {
  id: string; title: string; passScore: number;
  questionsPerAttempt: number | null; questions: Question[];
}

const input =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-black";

export default function QuizEditor({ moduleId }: { moduleId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  // draft question
  const [type, setType] = useState<QType>("MCQ");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState<number[]>([0]);
  const [acceptable, setAcceptable] = useState("");
  const [topic, setTopic] = useState("");
  const [points, setPoints] = useState(1);
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [explanation, setExplanation] = useState("");

  const load = useCallback(async () => {
    const { data } = await axios.get(`/api/admin/modules/${moduleId}/quiz`);
    setQuiz(data);
  }, [moduleId]);

  useEffect(() => { load(); }, [load]);

  const effectiveOptions = type === "TRUE_FALSE" ? ["True", "False"] : options;

  function resetDraft() {
    setQuestion(""); setOptions(["", "", "", ""]); setCorrect([0]);
    setAcceptable(""); setTopic(""); setPoints(1); setDifficulty("MEDIUM"); setExplanation("");
  }

  function changeType(next: QType) {
    setType(next);
    setCorrect(next === "MULTIPLE_SELECT" ? [] : [0]);
  }

  function toggleCorrect(i: number) {
    if (type === "MULTIPLE_SELECT") {
      setCorrect((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
    } else {
      setCorrect([i]);
    }
  }

  async function createQuiz() {
    try {
      const { data } = await axios.post(`/api/admin/modules/${moduleId}/quiz`, {
        title: "Module assessment",
        passScore: 70,
      });
      setQuiz({ ...data, questions: data.questions ?? [] });
      toast.success("Assessment created.");
    } catch {
      toast.error("Couldn't create the assessment.");
    }
  }

  async function saveSettings(patch: Partial<Quiz>) {
    if (!quiz) return;
    try {
      await axios.patch(`/api/admin/quizzes/${quiz.id}`, patch);
      await load();
      toast.success("Settings saved.");
    } catch {
      toast.error("Couldn't save settings.");
    }
  }

  async function addQuestion() {
    if (!quiz) return;

    const cleanOptions = type === "TRUE_FALSE" ? ["True", "False"] : options.map((o) => o.trim()).filter(Boolean);
    const cleanAcceptable = acceptable.split(",").map((a) => a.trim()).filter(Boolean);

    setSaving(true);
    try {
      await axios.post(`/api/admin/quizzes/${quiz.id}/questions`, {
        question: question.trim(),
        options: USES_OPTIONS.includes(type) ? cleanOptions : [],
        correctOptions: USES_OPTIONS.includes(type) ? correct : [],
        acceptableAnswers: USES_TEXT.includes(type) ? cleanAcceptable : [],
        type, difficulty, points,
        topic, explanation,
      });
      resetDraft();
      await load();
      toast.success("Question added.");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Couldn't add the question.");
    } finally {
      setSaving(false);
    }
  }

  async function removeQuestion(id: string) {
    if (!confirm("Delete this question?")) return;
    try {
      await axios.delete(`/api/admin/questions/${id}`);
      await load();
    } catch {
      toast.error("Couldn't delete the question.");
    }
  }

  /* ── states ── */

  if (quiz === undefined) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading assessment...
      </div>
    );
  }

  if (quiz === null) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-6 text-center">
        <Award className="mx-auto mb-2 h-6 w-6 text-gray-300" />
        <p className="text-sm font-medium text-gray-700">No assessment on this module</p>
        <p className="mb-4 text-xs text-gray-500">
          Students can&apos;t clear the module without one, so the next module stays locked.
        </p>
        <button onClick={createQuiz}
          className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          <Plus className="h-4 w-4" /> Add assessment
        </button>
      </div>
    );
  }

  const bank = quiz.questions.length;
  const served = quiz.questionsPerAttempt ?? bank;
  const totalPoints = quiz.questions.reduce((a, q) => a + q.points, 0);

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <Award className="h-4 w-4 text-gray-400" /> {quiz.title}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {bank} question{bank === 1 ? "" : "s"} in the bank · {served} served per attempt ·
            pass mark {quiz.passScore}% · {totalPoints} points total
          </p>
          {quiz.questionsPerAttempt !== null && quiz.questionsPerAttempt > bank && (
            <p className="mt-1 text-xs text-amber-600">
              Set to serve {quiz.questionsPerAttempt} but only {bank} exist — students will see all {bank}.
            </p>
          )}
        </div>
        <button onClick={() => setShowSettings((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
          <Settings2 className="h-3.5 w-3.5" /> Settings
        </button>
      </div>

      {showSettings && (
        <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Title</label>
            <input defaultValue={quiz.title} className={input}
              onBlur={(e) => e.target.value !== quiz.title && saveSettings({ title: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Pass mark (%)</label>
            <input type="number" min={1} max={100} defaultValue={quiz.passScore} className={input}
              onBlur={(e) => Number(e.target.value) !== quiz.passScore && saveSettings({ passScore: Number(e.target.value) })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Questions per attempt</label>
            <input type="number" min={1} placeholder="All" defaultValue={quiz.questionsPerAttempt ?? ""} className={input}
              onBlur={(e) => saveSettings({ questionsPerAttempt: e.target.value === "" ? null : Number(e.target.value) })} />
            <p className="mt-1 text-[11px] text-gray-400">Leave blank to serve every question.</p>
          </div>
        </div>
      )}

      {/* existing questions */}
      {quiz.questions.length > 0 && (
        <div className="space-y-2">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                      {TYPES.find((t) => t.value === q.type)?.label ?? q.type}
                    </span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                      {q.difficulty.toLowerCase()} · {q.points} pt
                    </span>
                    {q.topic && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">{q.topic}</span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm font-medium text-gray-900">{i + 1}. {q.question}</p>

                  {q.options.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {q.options.map((opt, oi) => {
                        const right = (q.correctOptions.length ? q.correctOptions : [q.correctOption]).includes(oi);
                        return (
                          <li key={oi} className={`flex items-start gap-1.5 text-xs ${right ? "font-medium text-emerald-600" : "text-gray-500"}`}>
                            {right ? <Check className="mt-0.5 h-3 w-3 shrink-0" /> : <span className="mt-0.5 h-3 w-3 shrink-0" />}
                            <span className="whitespace-pre-wrap">{opt}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-emerald-600">Accepts: {q.acceptableAnswers.join(", ")}</p>
                  )}

                  {q.explanation && <p className="mt-2 text-xs text-gray-500">{q.explanation}</p>}
                </div>

                <button onClick={() => removeQuestion(q.id)} className="text-gray-300 transition hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* new question */}
      <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-600">New question</p>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
              <select value={type} onChange={(e) => changeType(e.target.value as QType)} className={input}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")} className={input}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Points</label>
              <input type="number" min={1} value={points} onChange={(e) => setPoints(Number(e.target.value))} className={input} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Question</label>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3}
              placeholder="Paste the question. Code blocks keep their line breaks."
              className={`${input} resize-y font-mono`} />
          </div>

          {USES_OPTIONS.includes(type) && type !== "TRUE_FALSE" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Options — click the circle to mark {type === "MULTIPLE_SELECT" ? "every correct answer" : "the correct answer"}
              </label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button type="button" onClick={() => toggleCorrect(i)}
                      className={`h-5 w-5 shrink-0 rounded-full border-2 transition ${
                        correct.includes(i) ? "border-emerald-500 bg-emerald-500" : "border-gray-300 bg-white"
                      }`}>
                      {correct.includes(i) && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </button>
                    <input value={opt} placeholder={`Option ${i + 1}`} className={input}
                      onChange={(e) => setOptions((p) => p.map((o, oi) => (oi === i ? e.target.value : o)))} />
                    {options.length > 2 && (
                      <button type="button"
                        onClick={() => {
                          setOptions((p) => p.filter((_, oi) => oi !== i));
                          setCorrect((p) => p.filter((c) => c !== i).map((c) => (c > i ? c - 1 : c)));
                        }}
                        className="text-gray-300 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 6 && (
                <button type="button" onClick={() => setOptions((p) => [...p, ""])}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black">
                  <Plus className="h-3 w-3" /> Add option
                </button>
              )}
            </div>
          )}

          {type === "TRUE_FALSE" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Correct answer</label>
              <div className="flex gap-2">
                {["True", "False"].map((label, i) => (
                  <button key={label} type="button" onClick={() => setCorrect([i])}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      correct[0] === i ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-300 bg-white text-gray-600"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {USES_TEXT.includes(type) && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Accepted answers</label>
              <input value={acceptable} onChange={(e) => setAcceptable(e.target.value)}
                placeholder="nonlocal, non-local" className={input} />
              <p className="mt-1 text-[11px] text-gray-400">
                Comma separated. Matching ignores case and extra spaces.
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Topic</label>
              <input value={topic} onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Scope & Closures" className={input} />
              <p className="mt-1 text-[11px] text-gray-400">Drives the &quot;topics to revise&quot; list.</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Explanation</label>
              <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2}
                placeholder="Shown after submission" className={`${input} resize-y`} />
            </div>
          </div>

          <button onClick={addQuestion} disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50">
            {saving ? "Adding..." : <><Plus className="h-4 w-4" /> Add question</>}
          </button>
        </div>
      </div>
    </div>
  );
}