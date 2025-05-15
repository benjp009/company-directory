/* eslint-disable @typescript-eslint/consistent-type-imports, @typescript-eslint/no-unused-vars */

import { initTRPC } from "@trpc/server";

import SuperJSON from "superjson";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { prisma } from "@/server/db";

/**
 * Inner context for tRPC procedures
 */
export function createTRPCContext(opts: CreateNextContextOptions) {
  return { prisma };
}
export type Context = ReturnType<typeof createTRPCContext>;

// Initialize tRPC with context
const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const { router, procedure } = t;