import { router } from "./trpc";
import { companyRouter } from "./routers/company";
import { postRouter } from './routers/post';


export const appRouter = router({
  company: companyRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = appRouter.createCaller;
