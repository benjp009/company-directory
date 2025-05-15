/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access*/
import { z } from "zod";
import { router, procedure } from "../trpc";
import { prisma } from "@/server/db";

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

export const companyRouter = router({
  list: procedure
    .output(z.array(CompanySchema))
    .query(() => prisma.company.findMany({ include: { categories: true, keywords: true } })),

  getById: procedure
    .input(z.object({ id: z.string().cuid() }))
    .output(CompanySchema.nullable())
    .query(({ input }) =>
      prisma.company.findUnique({ where: { id: input.id }, include: { categories: true, keywords: true } })
    ),

  create: procedure
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
    .mutation(({ input }) => {
      const { categoryIds, keywordIds, ...data } = input;
      return prisma.company.create({ data: { ...data,
        categories: categoryIds ? { connect: categoryIds.map(id => ({ id })) } : undefined,
        keywords: keywordIds ? { connect: keywordIds.map(id => ({ id })) } : undefined,
      }, include: { categories: true, keywords: true } });
    }),

  update: procedure
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
    .mutation(({ input }) => {
      const { id, data } = input;
      const { categoryIds, keywordIds, ...rest } = data;
      return prisma.company.update({ where: { id }, data: { ...rest,
        categories: categoryIds ? { set: categoryIds.map(id => ({ id })) } : undefined,
        keywords: keywordIds ? { set: keywordIds.map(id => ({ id })) } : undefined,
      }, include: { categories: true, keywords: true } });
    }),

  delete: procedure
    .input(z.object({ id: z.string().cuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(({ input }) =>
      prisma.company.delete({ where: { id: input.id } }).then(() => ({ success: true }))
    ),
});
