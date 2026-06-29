"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Video,
  Eye,
  GripVertical,
  BookOpen,
} from "lucide-react";
import ModuleForm from "@/components/admin/curriculum/ModuleForm";
import LessonForm from "@/components/admin/curriculum/LessonForm";

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  notesUrl?: string | null;
  duration?: string | null;
  isPreview: boolean;
  order: number;
  resources: Resource[];
}

interface Module {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  lessons: Lesson[];
}

interface ModuleListProps {
  courseId: string;
  modules: Module[];
  onRefresh: () => void;
}

export default function ModuleList({
  courseId,
  modules,
  onRefresh,
}: ModuleListProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  );
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [addingLessonToModule, setAddingLessonToModule] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    lesson: Lesson;
    moduleId: string;
  } | null>(null);
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  function toggleModule(id: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function deleteModule(moduleId: string) {
    try {
      setDeletingModuleId(moduleId);
      await axios.delete(`/api/admin/modules/${moduleId}`);
      toast.success("Module deleted.");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete module.");
    } finally {
      setDeletingModuleId(null);
    }
  }

  async function deleteLesson(lessonId: string) {
    try {
      setDeletingLessonId(lessonId);
      await axios.delete(`/api/admin/lessons/${lessonId}`);
      toast.success("Lesson deleted.");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete lesson.");
    } finally {
      setDeletingLessonId(null);
    }
  }

  async function moveModule(moduleId: string, direction: "up" | "down") {
    const index = modules.findIndex((m) => m.id === moduleId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === modules.length - 1)
    )
      return;

    const newOrder = [...modules];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];

    try {
      await axios.patch(`/api/admin/modules/${moduleId}`, {
        reorder: true,
        orderedIds: newOrder.map((m) => m.id),
      });
      onRefresh();
    } catch {
      toast.error("Failed to reorder modules.");
    }
  }

  async function moveLesson(
    lessonId: string,
    moduleId: string,
    direction: "up" | "down"
  ) {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;

    const index = module.lessons.findIndex((l) => l.id === lessonId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === module.lessons.length - 1)
    )
      return;

    const newOrder = [...module.lessons];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];

    try {
      await axios.patch(`/api/admin/lessons/${lessonId}`, {
        reorder: true,
        orderedIds: newOrder.map((l) => l.id),
      });
      onRefresh();
    } catch {
      toast.error("Failed to reorder lessons.");
    }
  }

  if (modules.length === 0 && !showModuleForm) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <BookOpen className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No modules yet.</p>
          <p className="mt-1 text-xs text-gray-400">
            Add your first module to start building the curriculum.
          </p>
          <button
            onClick={() => setShowModuleForm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Add Module
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Modules */}
      {modules.map((module, moduleIndex) => {
        const isExpanded = expandedModules.has(module.id);
        const isEditingThis = editingModule?.id === module.id;
        const isDeletingThis = deletingModuleId === module.id;

        return (
          <div
            key={module.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            {/* Module Header */}
            {isEditingThis ? (
              <div className="p-4">
                <ModuleForm
                  courseId={courseId}
                  module={module}
                  onSuccess={() => {
                    setEditingModule(null);
                    onRefresh();
                  }}
                  onCancel={() => setEditingModule(null)}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Expand toggle */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="flex-shrink-0 text-gray-400 transition hover:text-gray-700"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>

                {/* Order indicator */}
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                  {moduleIndex + 1}
                </span>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-gray-900">
                    {module.title}
                  </p>
                  {module.description && (
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {module.description}
                    </p>
                  )}
                </div>

                {/* Lesson count */}
                <span className="flex-shrink-0 text-xs text-gray-400">
                  {module.lessons.length}{" "}
                  {module.lessons.length === 1 ? "lesson" : "lessons"}
                </span>

                {/* Move buttons */}
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    onClick={() => moveModule(module.id, "up")}
                    disabled={moduleIndex === 0}
                    className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Move up"
                  >
                    <GripVertical className="h-4 w-4 rotate-90" />
                  </button>
                  <button
                    onClick={() => moveModule(module.id, "down")}
                    disabled={moduleIndex === modules.length - 1}
                    className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Move down"
                  >
                    <GripVertical className="h-4 w-4 -rotate-90" />
                  </button>
                </div>

                {/* Edit / Delete */}
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    onClick={() => setEditingModule(module)}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    title="Edit module"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteModule(module.id)}
                    disabled={isDeletingThis}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Delete module"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Lessons */}
            {isExpanded && !isEditingThis && (
              <div className="border-t border-gray-100 bg-gray-50">
                {module.lessons.length === 0 && !addingLessonToModule && (
                  <div className="px-6 py-4 text-center text-xs text-gray-400">
                    No lessons yet in this module.
                  </div>
                )}

                {module.lessons.map((lesson, lessonIndex) => {
                  const isEditingLesson =
                    editingLesson?.lesson.id === lesson.id;
                  const isDeletingLesson = deletingLessonId === lesson.id;

                  return (
                    <div key={lesson.id}>
                      {isEditingLesson ? (
                        <div className="border-t border-gray-100 p-4">
                          <LessonForm
                            moduleId={module.id}
                            lesson={lesson}
                            onSuccess={() => {
                              setEditingLesson(null);
                              onRefresh();
                            }}
                            onCancel={() => setEditingLesson(null)}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 border-t border-gray-100 px-6 py-3 transition hover:bg-white">
                          {/* Lesson number */}
                          <span className="flex-shrink-0 text-xs text-gray-400">
                            {lessonIndex + 1}.
                          </span>

                          {/* Video icon */}
                          <Video className="h-4 w-4 flex-shrink-0 text-gray-300" />

                          {/* Title */}
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm text-gray-800">
                              {lesson.title}
                            </p>
                            {lesson.duration && (
                              <p className="mt-0.5 text-xs text-gray-400">
                                {lesson.duration}
                              </p>
                            )}
                          </div>

                          {/* Preview badge */}
                          {lesson.isPreview && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                              <Eye className="h-3 w-3" />
                              Preview
                            </span>
                          )}

                          {/* Move buttons */}
                          <div className="flex flex-shrink-0 items-center gap-1">
                            <button
                              onClick={() =>
                                moveLesson(lesson.id, module.id, "up")
                              }
                              disabled={lessonIndex === 0}
                              className="rounded p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                              title="Move up"
                            >
                              <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                            </button>
                            <button
                              onClick={() =>
                                moveLesson(lesson.id, module.id, "down")
                              }
                              disabled={lessonIndex === module.lessons.length - 1}
                              className="rounded p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                              title="Move down"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Edit / Delete */}
                          <div className="flex flex-shrink-0 items-center gap-1">
                            <button
                              onClick={() =>
                                setEditingLesson({
                                  lesson,
                                  moduleId: module.id,
                                })
                              }
                              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                              title="Edit lesson"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteLesson(lesson.id)}
                              disabled={isDeletingLesson}
                              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              title="Delete lesson"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Lesson Form or Button */}
                <div className="border-t border-gray-100 p-4">
                  {addingLessonToModule === module.id ? (
                    <LessonForm
                      moduleId={module.id}
                      onSuccess={() => {
                        setAddingLessonToModule(null);
                        onRefresh();
                      }}
                      onCancel={() => setAddingLessonToModule(null)}
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setAddingLessonToModule(module.id);
                        setEditingLesson(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-black"
                    >
                      <Plus className="h-4 w-4" />
                      Add Lesson
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Module Form or Button */}
      {showModuleForm ? (
        <ModuleForm
          courseId={courseId}
          onSuccess={() => {
            setShowModuleForm(false);
            onRefresh();
          }}
          onCancel={() => setShowModuleForm(false)}
        />
      ) : (
        <button
          onClick={() => {
            setShowModuleForm(true);
            setEditingModule(null);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition hover:border-gray-400 hover:text-black"
        >
          <Plus className="h-4 w-4" />
          Add Module
        </button>
      )}
    </div>
  );
}