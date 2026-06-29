"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import slugify from "slugify";
import axios from "axios";
import { toast } from "sonner";

import {
  categorySchema,
  type CategoryInput,
} from "@/lib/validations/category";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFormProps {
  category?: Category;
  onSuccess: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const isEdit = Boolean(category);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
    },
  });

  // Reset form when category prop changes (switching between create/edit)
  useEffect(() => {
    reset({
      name: category?.name ?? "",
      slug: category?.slug ?? "",
    });
  }, [category, reset]);

  // Auto-generate slug from name only on create
  const watchedName = watch("name");
  useEffect(() => {
    if (isEdit) return;
    setValue(
      "slug",
      slugify(watchedName ?? "", {
        lower: true,
        strict: true,
        trim: true,
      }),
      { shouldValidate: false }
    );
  }, [watchedName, isEdit, setValue]);

  async function onSubmit(values: CategoryInput) {
    try {
      if (isEdit) {
        await axios.patch(`/api/admin/categories/${category!.id}`, values);
        toast.success("Category updated.");
      } else {
        await axios.post("/api/admin/categories", values);
        toast.success("Category created.");
      }
      reset();
      onSuccess();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Something went wrong. Try again.";
      toast.error(message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      {/* Name */}
      <div>
        <label
          htmlFor="cat-name"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Category Name <span className="text-red-500">*</span>
        </label>
        <input
          id="cat-name"
          type="text"
          disabled={isSubmitting}
          placeholder="e.g. Web Development"
          {...register("name")}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition
            focus:border-black disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400
            ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="cat-slug"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          id="cat-slug"
          type="text"
          disabled={isSubmitting}
          placeholder="e.g. web-development"
          {...register("slug")}
          className={`w-full rounded-lg border px-4 py-2.5 font-mono text-sm outline-none transition
            focus:border-black disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400
            ${errors.slug ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"}`}
        />
        {errors.slug ? (
          <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-400">
            Auto-generated from name. Only lowercase letters, numbers and hyphens.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={() => {
            reset();
            onCancel();
          }}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700
            transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[120px] rounded-lg bg-black px-4 py-2 text-sm font-medium text-white
            transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? isEdit
              ? "Saving..."
              : "Creating..."
            : isEdit
              ? "Save Changes"
              : "Create Category"}
        </button>
      </div>
    </form>
  );
}