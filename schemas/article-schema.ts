import { z } from "zod";

// Schema for creating a new article
export const createArticleSchema = z.object({
  title: z.string().trim().min(1, { message: "Title is required" }),
  content: z.string().trim().min(1, { message: "Content is required" }),
  excerpt: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  coverImage: z.string().url({ message: "Invalid URL for cover image" }).optional().or(z.literal('')),
  tags: z.array(z.string().trim()).optional(),
});

// Type for the form data
export type CreateArticleFormValues = z.infer<typeof createArticleSchema>;

// Schema for updating an existing article
export const updateArticleSchema = z.object({
  title: z.string().trim().min(1, { message: "Title cannot be empty" }).optional(),
  content: z.string().trim().min(1, { message: "Content cannot be empty" }).optional(),
  excerpt: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(['draft', 'published']).optional(),
  coverImage: z.string().url({ message: "Invalid URL for cover image" }).optional().or(z.literal('')),
  tags: z.array(z.string().trim()).optional(),
});

// Type for the update form data
export type UpdateArticleFormValues = z.infer<typeof updateArticleSchema>; 