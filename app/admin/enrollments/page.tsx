"use client";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Users, Loader2, Trash2, Search, BookOpen } from "lucide-react";

interface Enrollment {
  id: string;
  enrolledAt: string;
  progress: number;
  completed: boolean;
  user: { email: string };
  course: { id: string; title: string };
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Enrollment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/enrollments");
      setEnrollments(res.data);
    } catch {
      toast.error("Failed to load enrollments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await axios.delete(`/api/admin/enrollments/${deleteTarget.id}`);
      toast.success("Enrollment removed.");
      setDeleteTarget(null);
      fetchEnrollments();
    } catch {
      toast.error("Failed to remove enrollment.");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = enrollments.filter(e => {
    const q = search.toLowerCase();
    if (!q) return true;
    return e.user.email.toLowerCase().includes(q) || e.course.title.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
          <p className="text-sm text-gray-500 mt-1">{enrollments.length} total enrollments</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{enrollments.filter(e => e.completed).length}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by student email or course title..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FF9900] bg-white" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-[#FF9900]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users className="h-10 w-10 text-gray-200 mb-3" />
            <p className="font-semibold text-gray-600">No enrollments found</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Course</th>
                    <th className="px-5 py-3">Progress</th>
                    <th className="px-5 py-3">Enrolled</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 text-gray-700">{e.user.email}</td>
                      <td className="px-5 py-4 font-medium text-gray-900">
                        <div className="flex items-center gap-1.5"><BookOpen size={13} className="text-gray-400" /> {e.course.title}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${e.completed ? "bg-emerald-500" : "bg-[#FF9900]"}`} style={{ width: `${e.progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{e.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {new Date(e.enrolledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => setDeleteTarget(e)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600" title="Remove enrollment">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map(e => (
                <div key={e.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{e.course.title}</p>
                      <p className="text-xs text-gray-400">{e.user.email}</p>
                    </div>
                    <button onClick={() => setDeleteTarget(e)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${e.completed ? "bg-emerald-500" : "bg-[#FF9900]"}`} style={{ width: `${e.progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{e.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Remove Enrollment</h2>
            <p className="mt-2 text-sm text-gray-600">
              Remove <span className="font-semibold">{deleteTarget.user.email}</span> from{" "}
              <span className="font-semibold">{deleteTarget.course.title}</span>? This does not refund any payment.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50">
                {deleting ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}