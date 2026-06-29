"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Link as LinkIcon, Info } from "lucide-react";

const lessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z.string().trim().optional(),
  videoUrl: z.string().trim().optional(),
  notesUrl: z.string().trim().optional(),
  duration: z.string().trim().optional(),
  isPreview: z.boolean(),
});

type LessonInput = z.infer<typeof lessonSchema>;

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  notesUrl?: string | null;
  duration?: string | null;
  isPreview: boolean;
}

interface LessonFormProps {
  moduleId: string;
  lesson?: Lesson;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LessonForm({
  moduleId,
  lesson,
  onSuccess,
  onCancel,
}: LessonFormProps) {
  const isEdit = Boolean(lesson);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LessonInput>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title ?? "",
      description: lesson?.description ?? "",
      videoUrl: lesson?.videoUrl ?? "",
      notesUrl: lesson?.notesUrl ?? "",
      duration: lesson?.duration ?? "",
      isPreview: lesson?.isPreview ?? false,
    },
  });

  useEffect(() => {
    reset({
      title: lesson?.title ?? "",
      description: lesson?.description ?? "",
      videoUrl: lesson?.videoUrl ?? "",
      notesUrl: lesson?.notesUrl ?? "",
      duration: lesson?.duration ?? "",
      isPreview: lesson?.isPreview ?? false,
    });
  }, [lesson, reset]);

  async function onSubmit(values: LessonInput) {
    try {
      const payload = {
        ...values,
        videoUrl: values.videoUrl || null,
        notesUrl: values.notesUrl || null,
        duration: values.duration || null,
        description: values.description || null,
      };

      if (isEdit) {
        await axios.patch(`/api/admin/lessons/${lesson!.id}`, payload);
        toast.success("Lesson updated.");
      } else {
        await axios.post("/api/admin/lessons", { ...payload, moduleId });
        toast.success("Lesson added.");
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
      className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-4"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-600">
        {isEdit ? "Edit Lesson" : "New Lesson"}
      </p>

      <div className="space-y-3">
        {/* Title */}
        <div>
          <input
            {...register("title")}
            disabled={isSubmitting}
            placeholder="Lesson title e.g. Setting Up Your Environment"
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
          <textarea
            {...register("description")}
            disabled={isSubmitting}
            rows={2}
            placeholder="Short description (optional)"
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-black disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Video URL */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Video URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                {...register("videoUrl")}
                disabled={isSubmitting}
                placeholder="https://youtube.com/..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-8 pr-4 text-sm outline-none transition focus:border-black disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Notes URL */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Notes / PDF URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                {...register("notesUrl")}
                disabled={isSubmitting}
                placeholder="https://drive.google.com/..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-8 pr-4 text-sm outline-none transition focus:border-black disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Duration + Preview toggle */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">Duration:</label>
            <input
              {...register("duration")}
              disabled={isSubmitting}
              placeholder="e.g. 12:30"
              className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-black disabled:cursor-not-allowed"
            />
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Info className="h-3 w-3" /> mm:ss
            </span>
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              {...register("isPreview")}
              type="checkbox"
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-gray-300 accent-black disabled:cursor-not-allowed"
            />
            <span className="text-sm font-medium text-gray-700">
              Free preview
            </span>
            <span className="text-xs text-gray-400">
              (visible without enrollment)
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
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
            : isEdit ? "Save" : "Add Lesson"}
        </button>
      </div>
    </form>
  );
}