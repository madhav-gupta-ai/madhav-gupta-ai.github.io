import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const papers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/papers' }),
  schema: z.object({
    title: z.string(),
    venue: z.string(),
    year: z.number().optional(),
    status: z.enum(['published', 'in-press', 'under-review']),
    role: z.string(),
    tags: z.array(z.string()).default([]),
    summary: z.string(),
    pdf: z.string().optional(),
    doi: z.string().optional(),
    github: z.string().optional(),
    award: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    github: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { papers, projects, blog };
