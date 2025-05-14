/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access*/
// ===============================================
// src/server/api/routers/company.ts
// ===============================================
import { z } from "zod";
import { t } from "../trpc";
import { prisma } from "@/server/db";

// Zod output schemas for validation
const CategorySchema = z.object({ id: z.string(), name: z.string() });
const KeywordSchema = z.object({ id: z.string(), name: z.string() });
const CompanyBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  website: z.string().url().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  siret: z.string().nullable(),
  revenue2023: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
const CompanySchema = CompanyBaseSchema.extend({
  categories: z.array(CategorySchema),
  keywords: z.array(KeywordSchema),
});

export type Company = z.infer<typeof CompanySchema>;

// Router definition with CRUD operations
export const companyRouter = t.router({
  // List all companies
  list: t.procedure
    .output(z.array(CompanySchema))
    .query(async () => {
      return prisma.company.findMany({ include: { categories: true, keywords: true } });
    }),

  // Get a single company by ID
  getById: t.procedure
    .input(z.object({ id: z.string().cuid() }))
    .output(CompanySchema.nullable())
    .query(async ({ input }) => {
      return prisma.company.findUnique({
        where: { id: input.id },
        include: { categories: true, keywords: true },
      });
    }),

  // Create a new company
  create: t.procedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        website: z.string().url().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        siret: z.string().optional(),
        revenue2023: z.number().int().optional(),
        categoryIds: z.array(z.string().cuid()).optional(),
        keywordIds: z.array(z.string().cuid()).optional(),
      })
    )
    .output(CompanySchema)
    .mutation(async ({ input }) => {
      const { categoryIds, keywordIds, ...data } = input;
      return prisma.company.create({
        data: {
          ...data,
          categories: categoryIds ? { connect: categoryIds.map(id => ({ id })) } : undefined,
          keywords: keywordIds ? { connect: keywordIds.map(id => ({ id })) } : undefined,
        },
        include: { categories: true, keywords: true },
      });
    }),

  // Update an existing company
  update: t.procedure
    .input(
      z.object({
        id: z.string().cuid(),
        data: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          website: z.string().url().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          siret: z.string().optional(),
          revenue2023: z.number().int().optional(),
          categoryIds: z.array(z.string().cuid()).optional(),
          keywordIds: z.array(z.string().cuid()).optional(),
        }),
      })
    )
    .output(CompanySchema)
    .mutation(async ({ input }) => {
      const { id, data } = input;
      const { categoryIds, keywordIds, ...rest } = data;
      return prisma.company.update({
        where: { id },
        data: {
          ...rest,
          categories: categoryIds ? { set: categoryIds.map(id => ({ id })) } : undefined,
          keywords: keywordIds ? { set: keywordIds.map(id => ({ id })) } : undefined,
        },
        include: { categories: true, keywords: true },
      });
    }),

  // Delete a company by ID
  delete: t.procedure
    .input(z.object({ id: z.string().cuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      await prisma.company.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
