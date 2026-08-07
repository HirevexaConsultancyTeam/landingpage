"use client";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2, Target, Check, Loader2 } from "lucide-react";

type DType = "MCQ" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "FILL_BLANK" | "OUTPUT_PREDICTION" | "SHORT_ANSWER" | "CODING";

const TYPES: { value: DType; label: string }[] = [
  { value: "MCQ", label: "Multiple choice" },
  { value: "MULTIPLE_SELECT", label: "Multiple select" },
  { value: "TRUE_FALSE", label: "True / false" },
  { value: "OUTPUT_PREDICTION", label: "Output prediction" },
  { value: "FILL_BLANK", label: "Fill the blank" },
  { value: "SHORT_ANSWER", label: "Short answer" },
  { value: "CODING", label: "Live coding" },
];

const USES_OPTIONS: DType[] = ["MCQ", "MULTIPLE_SELECT", "OUTPUT_PREDICTION"];
const USES_TEXT: DType[] = ["FILL_BLANK", "SHORT_ANSWER"];

interface Exercise {
  id: string; order: number; type: DType; prompt: string;
  payload: { options?: string[]; correctIndex?: number; correctIndexes?: number[]; correct?: boolean; acceptable?: string[] };
  hint: string | null; solution: string | null; explanation: string | null;
  starterCode: string | null; expectedOutput: string | null;
}

const input =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-black";

export default function ExerciseEditor({ lessonId }: { lessonId: string }) {
  const [items, setItems] = useState<Exercise[] | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<DType>("MCQ");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState<number[]>([0]);
  const [tfCorrect, setTfCorrect] = useState(true);
  const [acceptable, setAcceptable] = useState("");
  const [hint, setHint] = useState("");
  const [solution, setSolution] = useState("");
  const [explanation, setExplanation] = useState("");
  const [starterCode, setStarterCode] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");

  const load = useCallback(async () => {
    const { data } = await axios.get(`/api/admin/exercises`, { params: { lessonId } });
    setItems(data);
  }, [lessonId]);

  useEffect(() => { load(); }, [load]);

  function reset() {
    setPrompt(""); setOptions(["", "", "", ""]); setCorrect([0]); setTfCorrect(true);
    setAcceptable(""); setHint(""); setSolution(""); setExplanation("");
    setStarterCode(""); setExpectedOutput(""); setOpen(false);
  }

  function buildPayload() {
    if (type === "MULTIPLE_SELECT") {
      return { options: options.map((o) => o.trim()).filter(Boolean), correctIndexes: correct };
    }
    if (USES_OPTIONS.includes(type)) {
      return { options: options.map((o) => o.trim()).filter(Boolean), correctIndex: correct[0] ?? 0 };
    }
    if (type === "TRUE_FALSE") return { correct: tfCorrect };
    if (USES_TEXT.includes(type)) {
      return { acceptable: acceptable.split(",").map((a) => a.trim()).filter(Boolean) };
    }
    return {};
  }

  async function add() {
    if (!prompt.trim()) { toast.error("Add a prompt first."); return; }
    setSaving(true);
    try {
      await axios.post("/api/admin/exercises", {
        lessonId, type, prompt, payload: buildPayload(),
        hint, solution, explanation, starterCode, expectedOutput,
      });
      reset();
      await load();
      toast.success("Drill added.");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? "Couldn't add the drill.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this drill?")) return;
    try {
      await axios.delete(`/api/admin/exercises/${id}`);
      await load();
    } catch {
      toast.error("Couldn't delete the drill.");
    }
  }

  if (items === null) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading drills...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <Target className="h-3.5 w-3.5" /> Practice drills ({items.length})
      </div>

      {items.map((ex, i) => (
        <div key={ex.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3">
          <div className="min-w-0 flex-1">
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
              {TYPES.find((t) => t.value === ex.type)?.label ?? ex.type}
            </span>
            <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-sm text-gray-800">{i + 1}. {ex.prompt}</p>
            {ex.solution && <p className="mt-1 truncate text-xs text-emerald-600">Answer: {ex.solution}</p>}
          </div>
          <button onClick={() => remove(ex.id)} className="text-gray-300 transition hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      {!open ? (
        <button onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-black">
          <Plus className="h-4 w-4" /> Add drill
        </button>
      ) : (
        <div className="space-y-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">New drill</p>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
            <select value={type} onChange={(e) => {
              const t = e.target.value as DType;
              setType(t);
              setCorrect(t === "MULTIPLE_SELECT" ? [] : [0]);
            }} className={input}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
              placeholder="The question as the student sees it. Code keeps its formatting."
              className={`${input} resize-y font-mono`} />
          </div>

          {USES_OPTIONS.includes(type) && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Options — mark {type === "MULTIPLE_SELECT" ? "every correct answer" : "the correct answer"}
              </label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button type="button"
                      onClick={() => setCorrect((p) =>
                        type === "MULTIPLE_SELECT"
                          ? p.includes(i) ? p.filter((x) => x !== i) : [...p, i]
                          : [i]
                      )}
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
                        correct.includes(i) ? "border-emerald-500 bg-emerald-500" : "border-gray-300 bg-white"
                      }`}>
                      {correct.includes(i) && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </button>
                    <input value={opt} placeholder={`Option ${i + 1}`} className={input}
                      onChange={(e) => setOptions((p) => p.map((o, oi) => (oi === i ? e.target.value : o)))} />
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
                {[true, false].map((v) => (
                  <button key={String(v)} type="button" onClick={() => setTfCorrect(v)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      tfCorrect === v ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-300 bg-white text-gray-600"
                    }`}>
                    {v ? "True" : "False"}
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
              <p className="mt-1 text-[11px] text-gray-400">Comma separated. Case and spacing are ignored.</p>
            </div>
          )}

          {type === "CODING" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Starter code</label>
                <textarea value={starterCode} onChange={(e) => setStarterCode(e.target.value)} rows={5}
                  className={`${input} resize-y font-mono`} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Expected output</label>
                <textarea value={expectedOutput} onChange={(e) => setExpectedOutput(e.target.value)} rows={2}
                  className={`${input} resize-y font-mono`} />
              </div>
              <p className="rounded-lg bg-amber-100/60 p-2 text-[11px] text-amber-700">
                Coding drills aren&apos;t auto-graded — the student compares their work against the reference
                solution and marks it themselves.
              </p>
            </>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Hint</label>
              <textarea value={hint} onChange={(e) => setHint(e.target.value)} rows={2} className={`${input} resize-y`} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Answer</label>
              <textarea value={solution} onChange={(e) => setSolution(e.target.value)} rows={2}
                className={`${input} resize-y font-mono`} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Explanation</label>
            <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2}
              placeholder="Why that answer is right — shown after the student checks."
              className={`${input} resize-y`} />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={add} disabled={saving}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50">
              {saving ? "Adding..." : "Add drill"}
            </button>
            <button onClick={reset}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-white">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}