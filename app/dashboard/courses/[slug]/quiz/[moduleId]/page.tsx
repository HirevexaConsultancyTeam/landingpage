"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Award, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Question { id: string; question: string; options: string[]; order: number; }
interface Quiz { id: string; title: string; passScore: number; questions: Question[]; }
interface Result { score: number; passed: boolean; correct: number; total: number; }

export default function QuizPage() {
  const { slug, moduleId } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`/api/modules/${moduleId}/quiz`)
      .then(r => setQuiz(r.data))
      .catch(() => toast.error("No quiz found for this module."))
      .finally(() => setLoading(false));
  }, [moduleId]);

  async function submit() {
    if (!quiz) return;
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error("Answer all questions first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/quizzes/${quiz.id}/submit`, { answers });
      setResult(res.data);
    } catch {
      toast.error("Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" /></div>;
  if (!quiz) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">No quiz for this module.</div>;

  if (result) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-[#1a2332] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
            {result.passed ? <CheckCircle size={28} className="text-emerald-400" /> : <XCircle size={28} className="text-red-400" />}
          </div>
          <h1 className="text-white text-xl font-bold mb-1">{result.passed ? "Passed!" : "Not Quite"}</h1>
          <p className="text-gray-400 text-sm mb-4">{result.correct} / {result.total} correct — {result.score}%</p>
          {!result.passed && (
            <button onClick={() => { setResult(null); setAnswers({}); }}
              className="bg-[#FF9900] text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm mr-2">Retry</button>
          )}
          <button onClick={() => router.push(`/dashboard/courses/${slug}/learn`)}
            className="border border-white/10 text-gray-300 px-5 py-2.5 rounded-xl text-sm">Back to Course</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-[#FF9900]"><Award size={18} /><h1 className="text-white text-xl font-bold">{quiz.title}</h1></div>
        {quiz.questions.map((q, i) => (
          <div key={q.id} className="bg-[#1a2332] border border-white/10 rounded-2xl p-5">
            <p className="text-white font-medium mb-3">{i + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <label key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border ${answers[q.id] === oi ? "border-[#FF9900] bg-[#FF9900]/10" : "border-white/10 hover:bg-white/5"}`}>
                  <input type="radio" name={q.id} checked={answers[q.id] === oi}
                    onChange={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                    className="accent-[#FF9900]" />
                  <span className="text-sm text-gray-300">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button onClick={submit} disabled={submitting}
          className="w-full bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold py-3 rounded-xl disabled:opacity-50">
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}