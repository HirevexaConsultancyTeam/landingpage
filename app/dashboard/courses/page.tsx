"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { BookOpen, Clock, Play, CheckCircle, ArrowLeft, Loader2, ChevronRight } from "lucide-react";

interface Enrollment {
  id: string; enrolledAt: string; progress: number; completed: boolean;
  course: {
    id: string; title: string; slug: string; thumbnailUrl?: string | null;
    instructor?: string | null; level: string; duration?: string | null;
    category?: { name: string } | null;
    modules: { lessons: { id: string }[] }[];
    _count: { modules: number };
  };
}

const LEVEL_LABELS: Record<string, string> = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };

export default function MyCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/enrollments").then(r => r.json())
      .then(data => setEnrollments(Array.isArray(data) ? data : []))
      .catch(() => {}).finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#FF9900]" size={28} /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-sm text-gray-500 mt-1">{enrollments.length} course{enrollments.length !== 1 ? "s" : ""} enrolled</p>
          </div>
          <Link href="/courses" className="inline-flex items-center gap-2 bg-[#FF9900] text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#e88d00] transition">
            <BookOpen size={15} /> Browse More Courses
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center bg-white rounded-2xl border border-gray-200">
            <BookOpen className="h-14 w-14 text-gray-200 mb-4" />
            <h2 className="font-bold text-gray-700 text-lg">No courses yet</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">Enroll in a course to start learning and boost your placement chances.</p>
            <Link href="/courses" className="mt-6 inline-flex items-center gap-2 bg-[#FF9900] text-gray-900 font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#e88d00] transition">
              Browse Courses <ChevronRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {enrollments.map(enrollment => {
              const course = enrollment.course;
              const totalLessons = course.modules.reduce((a: number, m: any) => a + m.lessons.length, 0);
              return (
                <div key={enrollment.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition group">
                  <div className="relative h-36 bg-gradient-to-br from-[#232F3E] to-[#37475A]">
                    {course.thumbnailUrl
                      ? <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-10 w-10 text-white/20" /></div>}
                    {enrollment.completed && (
                      <div className="absolute inset-0 bg-emerald-900/60 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-white font-bold"><CheckCircle size={20} /> Completed</div>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    {course.category && <p className="text-xs font-semibold text-[#FF9900] uppercase tracking-wide mb-1">{course.category.name}</p>}
                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{course.title}</h3>
                    {course.instructor && <p className="text-xs text-gray-500 mb-3">by {course.instructor}</p>}

                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                      <span><BookOpen size={11} className="inline mr-1" />{course._count.modules} modules</span>
                      <span><Play size={11} className="inline mr-1" />{totalLessons} lessons</span>
                      {course.duration && <span><Clock size={11} className="inline mr-1" />{course.duration}</span>}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">{Math.round(enrollment.progress)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF9900] rounded-full transition-all" style={{ width: `${enrollment.progress}%` }} />
                      </div>
                    </div>

                    <Link href={`/courses/${course.slug}`}
                      className="flex items-center justify-center gap-2 w-full bg-[#232F3E] text-white font-semibold text-xs py-2.5 rounded-xl hover:bg-gray-800 transition">
                      <Play size={13} /> {enrollment.progress > 0 ? "Continue Learning" : "Start Course"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}