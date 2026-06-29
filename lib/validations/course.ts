import { z } from "zod";

export const courseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title cannot exceed 120 characters"),

  slug: z
    .string()
    .trim()
    .min(3, "Slug is required")
    .max(140, "Slug cannot exceed 140 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens"
    ),

  shortDescription: z
    .string()
    .trim()
    .min(10, "Short description must be at least 10 characters")
    .max(300, "Short description cannot exceed 300 characters"),

  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters"),

  thumbnailUrl: z.string().trim().optional().nullable(),
  previewVideoUrl: z.string().trim().optional().nullable(),

  instructor: z
    .string()
    .trim()
    .max(80, "Instructor name cannot exceed 80 characters")
    .optional()
    .nullable(),

  language: z
    .string()
    .trim()
    .min(2, "Language is required")
    .max(40, "Language cannot exceed 40 characters"),

  duration: z.string().trim().optional().nullable(),

  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),

  price: z.number().min(0, "Price cannot be negative"),

  discount: z
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100"),

  featured: z.boolean(),
  published: z.boolean(),

  categoryId: z.string().optional().nullable(),
});

export type CourseInput = z.infer<typeof courseSchema>;