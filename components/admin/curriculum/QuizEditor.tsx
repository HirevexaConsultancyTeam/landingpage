"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2, Award, Check } from "lucide-react";

interface Question { id: string; question: string; options: string[]; correctOption: number; order: number; }
interface Quiz { id: string; title: string; passScore: number; questions: Question[]; }

export default function QuizEditor({ moduleId }: { moduleId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined); // undefined = loading
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = () => axios.get(`/api/admin/modules/${moduleId}/quiz`).then(r => setQuiz(r.data));
  useEffect(() => { load(); }, [moduleId]);

  async function createQuiz() {
    try {
      const res = await axios.post(`/api/admin/modules/${moduleId}/quiz`, { title: "Module Quiz", passScore: 70 });
      setQuiz(res.data);
    } catch { toast.error("Failed to create quiz."); }
  }

  async function addQuestion() {
    const options = newOptions.filter(o => o.trim());
    if (!newQuestion.trim() || options.length < 2) {
      toast.error("Enter a question and at least 2 options.");
      return;
    }
    setSaving(true);
    try {
      await axios.post(`/api/admin/quizzes/${quiz!.id}/questions`, {
        question: newQuestion.trim(), options, correctOption,
      });
      setNewQuestion(""); setNewOptions(["", "", "", ""]); setCorrectOption(0);
      load();
      toast.success("Question added.");
    } catch { toast.error("Failed to add question."); }
    finally { setSaving(false); }
  }

  async function deleteQuestion(id: string) {
    try { await axios.delete(`/api/admin/questions/${id}`); load(); }
    catch { toast.error("Failed to delete question."); }
  }

  if (quiz === undefined) return <div className="p-4 text-xs text-gray-400">Loading quiz…</div>;

  if (quiz === null) {
    return (
      <div className="border-t border-gray-100 p-4">
        <button onClick={createQuiz}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#FF9900] hover:underline">
          <Award className="h-4 w-4" /> Add a quiz to this module
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 bg-orange-50/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#FF9900]">
          {quiz.title} · Pass {quiz.passScore}%
        </p>
        <span className="text-xs text-gray-400">{quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}</span>
      </div>

      {quiz.questions.map((q, i) => (
        <div key={q.id} className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-800">{i + 1}. {q.question}</p>
            <button onClick={() => deleteQuestion(q.id)} className="flex-shrink-0 text-gray-300 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 space-y-1">
            {q.options.map((opt, oi) => (
              <div key={oi} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${oi === q.correctOption ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-500"}`}>
                {oi === q.correctOption && <Check className="h-3 w-3" />} {opt}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3 space-y-2">
        <input value={newQuestion} onChange={e => setNewQuestion(e.target.value)}
          placeholder="New question"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black" />
        {newOptions.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="radio" checked={correctOption === i} onChange={() => setCorrectOption(i)} className="accent-emerald-600" />
            <input value={opt} onChange={e => setNewOptions(prev => prev.map((o, oi) => oi === i ? e.target.value : o))}
              placeholder={`Option ${i + 1}`}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-black" />
          </div>
        ))}
        <p className="text-[11px] text-gray-400">Select the radio button next to the correct answer.</p>
        <button onClick={addQuestion} disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
          <Plus className="h-3.5 w-3.5" /> {saving ? "Adding..." : "Add Question"}
        </button>
      </div>
    </div>
  );
}