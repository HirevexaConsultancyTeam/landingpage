"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import CourseTable, { type CourseRow } from "@/components/admin/courses/CourseTable";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CourseRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/courses");
      setCourses(res.data);
    } catch {
      toast.error("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  async function handleTogglePublish(course: CourseRow) {
    try {
      await axios.patch(`/api/admin/courses/${course.id}`, {
        title: course.title,
        slug: course.slug,
        shortDescription: course.slug,
        description: course.slug,
        language: course.language,
        level: course.level,
        price: course.price,
        discount: course.discount,
        featured: course.featured,
        published: !course.published,
        categoryId: course.category?.id ?? null,
      });
      toast.success(course.published ? "Course unpublished." : "Course published.");
      fetchCourses();
    } catch {
      toast.error("Failed to update course status.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await axios.delete(`/api/admin/courses/${deleteTarget.id}`);
      toast.success("Course deleted.");
      setDeleteTarget(null);
      fetchCourses();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete course.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="mt-1 text-sm text-gray-500">
            {courses.length} total &middot;{" "}
            {courses.filter((c) => c.published).length} published
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/courses/create")}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          New Course
        </button>
      </div>

      {/* Table */}
      <CourseTable
        data={courses}
        loading={loading}
        onEdit={(course) => router.push(`/admin/courses/${course.id}/edit`)}
        onDelete={setDeleteTarget}
        onTogglePublish={handleTogglePublish}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Delete Course</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTarget.title}</span>?
            </p>

            {deleteTarget._count.enrollments > 0 && (
              <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-600">
                This course has{" "}
                <span className="font-semibold">
                  {deleteTarget._count.enrollments} enrolled student
                  {deleteTarget._count.enrollments > 1 ? "s" : ""}
                </span>
                . Unpublish it instead of deleting.
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || deleteTarget._count.enrollments > 0}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}