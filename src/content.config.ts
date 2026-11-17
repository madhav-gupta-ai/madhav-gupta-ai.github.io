import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { parse as parseCsv } from 'csv-parse/sync';

// Papers & projects are managed as CSVs (src/data/*.csv) — one row per entry,
// quoted cells may contain commas/newlines/markdown. See CLAUDE.md for columns.
const csvParser = (text: string) =>
  parseCsv(text, { columns: true, bom: true, skip_empty_lines: true });

// Cell normalizers: CSV gives strings; blanks fall back to defaults.
const optStr = z.preprocess((v) => {
  const s = String(v ?? '').trim();
  return s === '' ? undefined : s;
}, z.string().optional());

const boolCell = (def: boolean) =>
  z.preprocess((v) => {
    const s = String(v ?? '').trim().toLowerCase();
    if (s === '') return def;
    return ['true', 'yes', '1'].includes(s);
  }, z.boolean());

const optNum = z.preprocess((v) => {
  const s = String(v ?? '').trim();
  return s === '' ? undefined : Number(s);
}, z.number().optional());

const numCell = (def: number) =>
  z.preprocess((v) => {
    const s = String(v ?? '').trim();
    return s === '' ? def : Number(s);
  }, z.number());

const keywordsCell = z.preprocess(
  (v) =>
    String(v ?? '')
      .split(';')
      .map((t) => t.trim())
      .filter(Boolean),
  z.array(z.string())
);

const papers = defineCollection({
  loader: file('src/data/papers.csv', { parser: csvParser }),
  schema: z
    .object({
      card_title: optStr,
      full_title: z.string(),
      venue: z.string(),
      year: optNum,
      status: z.preprocess((v) => {
        const s = String(v ?? '').trim();
        return s === '' ? 'published' : s;
      }, z.enum(['published', 'in-press', 'under-review', 'presented'])),
      role: optStr,
      award: optStr,
      card_text: z.string(),
      details_md: optStr,
      paper_url: optStr,
      code_url: optStr,
      pdf_url: optStr,
      keywords: keywordsCell,
      visible: boolCell(true),
      homepage: boolCell(false),
      featured: boolCell(false),
      order: numCell(999),
    })
    .transform((r) => ({
      title: r.card_title ?? r.full_title,
      fullTitle: r.full_title,
      venue: r.venue,
      year: r.year,
      status: r.status,
      role: r.role,
      award: r.award,
      summary: r.card_text,
      detailsMd: r.details_md ?? r.card_text,
      paperUrl: r.paper_url,
      codeUrl: r.code_url,
      pdfUrl: r.pdf_url,
      tags: r.keywords,
      visible: r.visible,
      homepage: r.homepage,
      featured: r.featured,
      order: r.order,
    })),
});

const projects = defineCollection({
  loader: file('src/data/projects.csv', { parser: csvParser }),
  schema: z
    .object({
      title: z.string(),
      card_text: z.string(),
      details_md: optStr,
      code_url: optStr,
      keywords: keywordsCell,
      visible: boolCell(true),
      homepage: boolCell(false),
      featured: boolCell(false),
      order: numCell(999),
      context: optStr,
      status: z.preprocess((v) => {
        const s = String(v ?? '').trim();
        return s === '' ? 'completed' : s;
      }, z.enum(['ongoing', 'completed'])),
      pdf_url: optStr,
      link_url: optStr,
    })
    .transform((r) => ({
      title: r.title,
      summary: r.card_text,
      // card-only projects (blank details_md) get no page and no "Details →"
      hasPage: r.details_md !== undefined,
      detailsMd: r.details_md ?? r.card_text,
      codeUrl: r.code_url,
      pdfUrl: r.pdf_url,
      linkUrl: r.link_url,
      context: r.context,
      ongoing: r.status === 'ongoing',
      tags: r.keywords,
      visible: r.visible,
      homepage: r.homepage,
      featured: r.featured,
      order: r.order,
    })),
});

const blog = defineCollection({
  // Posts are either flat files (hello-world.md) or folders with co-located
  // assets (polarised-perspectives/index.md + figures/) — both get a clean id.
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\.md$/, '').replace(/\/index$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { papers, projects, blog };
