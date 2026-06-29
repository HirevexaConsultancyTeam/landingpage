"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Users, Layout } from "lucide-react";
import ModuleList from "@/components/admin/curriculum/ModuleList";

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  notesUrl?: string | null;
  duration?: string | null;
  isPreview: boolean;
  order: number;
  resources: { id: string; title: string; url: string; type: string }[];
}

interface Module {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  _count: { enrollments: number; modules: number };
}

export default function CurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingModules, setLoadingModules] = useState(true);

  // Fetch course info
  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await axios.get(`/api/admin/courses/${courseId}`);
        setCourse(res.data);
      } catch {
        toast.error("Course not found.");
        router.push("/admin/courses");
      } finally {
        setLoadingCourse(false);
      }
    }
    loadCourse();
  }, [courseId, router]);

  // Fetch modules
  const fetchModules = useCallback(async () => {
    try {
      setLoadingModules(true);
      const res = await axios.get(`/api/admin/modules?courseId=${courseId}`);
      setModules(res.data);
    } catch {
      toast.error("Failed to load curriculum.");
    } finally {
      setLoadingModules(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Stats
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDuration = modules
    .flatMap((m) => m.lessons)
    .reduce((acc, l) => {
      if (!l.duration) return acc;
      const parts = l.duration.split(":").map(Number);
      const seconds =
        parts.length === 2
          ? parts[0] * 60 + parts[1]
          : parts[0] * 3600 + parts[1] * 60 + (parts[2] ?? 0);
      return acc + seconds;
    }, 0);

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "—";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  if (loadingCourse) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="mx-auto max-w-3xl py-8">
      {/* Back */}
      <button
        onClick={() => router.push("/admin/courses")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </button>

      {/* Course Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                course.published
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {course.published ? "Live" : "Draft"}
            </span>
          </div>
          <p className="mt-1 font-mono text-sm text-gray-400">{course.slug}</p>
        </div>

        {/* Quick link to edit course */}
        <button
          onClick={() => router.push(`/admin/courses/${courseId}/edit`)}
          className="flex-shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Edit Course Details
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Layout className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Modules</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{modules.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Lessons</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{totalLessons}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Students</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {course._count.enrollments}
          </p>
        </div>
      </div>

      {/* Curriculum */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Curriculum</h2>
          {totalLessons > 0 && (
            <span className="text-xs text-gray-400">
              Total duration: {formatDuration(totalDuration)}
            </span>
          )}
        </div>

        {loadingModules ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
          </div>
        ) : (
          <ModuleList
            courseId={courseId}
            modules={modules}
            onRefresh={fetchModules}
          />
        )}
      </div>
    </div>
  );
}