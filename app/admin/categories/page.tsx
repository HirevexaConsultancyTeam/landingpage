"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen, Search, X } from "lucide-react";
import CategoryForm from "@/components/admin/categories/CategoryForm";

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count: { courses: number };
}

type ViewMode = "list" | "create" | "edit";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/categories");
      setCategories(res.data);
    } catch {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function handleEdit(cat: Category) {
    setEditTarget(cat);
    setViewMode("edit");
  }

  function handleFormSuccess() {
    setViewMode("list");
    setEditTarget(null);
    fetchCategories();
  }

  function handleFormCancel() {
    setViewMode("list");
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await axios.delete(`/api/admin/categories/${deleteTarget.id}`);
      toast.success("Category deleted.");
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (viewMode === "create") {
    return (
      <div className="mx-auto max-w-xl py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">New Category</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a category to group your courses.
          </p>
        </div>
        <CategoryForm onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
      </div>
    );
  }

  if (viewMode === "edit" && editTarget) {
    return (
      <div className="mx-auto max-w-xl py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Category</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update the name or slug for this category.
          </p>
        </div>
        <CategoryForm
          category={editTarget}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            {categories.length} {categories.length === 1 ? "category" : "categories"} total
          </p>
        </div>
        <button
          onClick={() => setViewMode("create")}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          New Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-black"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="mb-3 h-10 w-10 text-gray-300" />
            <p className="font-medium text-gray-600">
              {search ? "No categories match your search." : "No categories yet."}
            </p>
            {!search && (
              <button
                onClick={() => setViewMode("create")}
                className="mt-4 text-sm font-medium text-black underline underline-offset-4"
              >
                Create your first category
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3 text-center">Courses</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((cat) => (
                <tr key={cat.id} className="group transition hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium">{cat.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-500">
                    {cat.slug}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                      {cat._count.courses}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {new Date(cat.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">Delete Category</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTarget.name}</span>?{" "}
              {deleteTarget._count.courses > 0 ? (
                <span className="text-red-500">
                  This category has {deleteTarget._count.courses} course
                  {deleteTarget._count.courses > 1 ? "s" : ""} — move or delete
                  them first.
                </span>
              ) : (
                "This action cannot be undone."
              )}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || deleteTarget._count.courses > 0}
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