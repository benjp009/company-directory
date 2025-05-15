import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter, type AppRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export default trpcNext.createNextApiHandler<AppRouter>({
  router: appRouter,
  createContext: createTRPCContext,
});