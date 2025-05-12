import { z } from 'zod';
import { t } from '../trpc';
import { prisma } from '@/schema'; // Import prisma from correct path

export const companyRouter = t.router({
  // List all companies
  list: t.procedure.query(async () => {
    return prisma.company.findMany({
      include: { categories: true, keywords: true },
    });
  }),

  // Get a single company by ID
  getById: t.procedure
    .input(z.object({ id: z.string().cuid() }))
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
        website: z.string().url().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        siret: z.string().optional(),
        revenue2023: z.number().int().optional(),
        categoryIds: z.array(z.string().cuid()).optional(),
        keywordIds: z.array(z.string().cuid()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.company.create({
        data: {
          name: input.name,
          website: input.website,
          email: input.email,
          phone: input.phone,
          siret: input.siret,
          revenue2023: input.revenue2023,
          categories: input.categoryIds
            ? { connect: input.categoryIds.map(id => ({ id })) }
            : undefined,
          keywords: input.keywordIds
            ? { connect: input.keywordIds.map(id => ({ id })) }
            : undefined,
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
    .mutation(async ({ input }) => {
      const { id, data } = input;
      return prisma.company.update({
        where: { id },
        data: {
          ...data,
          categories: data.categoryIds
            ? { set: data.categoryIds.map(id => ({ id })) }
            : undefined,
          keywords: data.keywordIds
            ? { set: data.keywordIds.map(id => ({ id })) }
            : undefined,
        },
        include: { categories: true, keywords: true },
      });
    }),

  // Delete a company
  delete: t.procedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      return prisma.company.delete({
        where: { id: input.id },
      });
    }),
});