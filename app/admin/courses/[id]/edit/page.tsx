"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import CourseForm from "@/components/admin/CourseForm";

interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl?: string | null;
  previewVideoUrl?: string | null;
  instructor?: string | null;
  language: string;
  duration?: string | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  price: number;
  discount: number;
  featured: boolean;
  published: boolean;
  categoryId?: string | null;
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`/api/admin/courses/${id}`);
        setCourse(res.data);
      } catch {
        toast.error("Course not found.");
        router.push("/admin/courses");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="mx-auto max-w-3xl py-8">
      <button
        onClick={() => router.push("/admin/courses")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
          <p className="mt-0.5 font-mono text-sm text-gray-400">{course.slug}</p>
        </div>
        <span
          className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            course.published
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {course.published ? "Live" : "Draft"}
        </span>
      </div>

      <CourseForm
        course={course}
        onSuccess={() => router.push("/admin/courses")}
        onCancel={() => router.push("/admin/courses")}
      />
    </div>
  );
}