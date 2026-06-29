"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";

const moduleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z.string().trim().optional(),
});

type ModuleInput = z.infer<typeof moduleSchema>;

interface Module {
  id: string;
  title: string;
  description?: string | null;
}

interface ModuleFormProps {
  courseId: string;
  module?: Module;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ModuleForm({
  courseId,
  module,
  onSuccess,
  onCancel,
}: ModuleFormProps) {
  const isEdit = Boolean(module);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ModuleInput>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: module?.title ?? "",
      description: module?.description ?? "",
    },
  });

  useEffect(() => {
    reset({
      title: module?.title ?? "",
      description: module?.description ?? "",
    });
  }, [module, reset]);

  async function onSubmit(values: ModuleInput) {
    try {
      if (isEdit) {
        await axios.patch(`/api/admin/modules/${module!.id}`, values);
        toast.success("Module updated.");
      } else {
        await axios.post("/api/admin/modules", { ...values, courseId });
        toast.success("Module added.");
      }
      reset();
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Something went wrong.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {isEdit ? "Edit Module" : "New Module"}
      </p>

      <div className="space-y-3">
        {/* Title */}
        <div>
          <input
            {...register("title")}
            disabled={isSubmitting}
            placeholder="Module title e.g. Introduction to React"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition
              focus:border-black disabled:cursor-not-allowed disabled:bg-white
              ${errors.title ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <input
            {...register("description")}
            disabled={isSubmitting}
            placeholder="Short description (optional)"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-black disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => { reset(); onCancel(); }}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600
            transition hover:bg-white disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[100px] rounded-lg bg-black px-4 py-2 text-sm font-medium text-white
            transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? isEdit ? "Saving..." : "Adding..."
            : isEdit ? "Save" : "Add Module"}
        </button>
      </div>
    </form>
  );
}