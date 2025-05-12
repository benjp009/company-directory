import { t } from './trpc';
import { companyRouter } from './routers/company';

export const appRouter = t.router({
  company: companyRouter,
});

export type AppRouter = typeof appRouter;