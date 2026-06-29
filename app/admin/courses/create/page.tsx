"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CourseForm from "@/components/admin/CourseForm";

export default function CreateCoursePage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl py-8">
      <button
        onClick={() => router.push("/admin/courses")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details. You can add modules and lessons after saving.
        </p>
      </div>

      <CourseForm
        onSuccess={() => router.push("/admin/courses")}
        onCancel={() => router.push("/admin/courses")}
      />
    </div>
  );
}