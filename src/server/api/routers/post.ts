import { z } from 'zod';
import { router, procedure } from '../trpc';

export const postRouter = router({
  hello: procedure
    .input(z.object({ text: z.string().optional() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.text ?? 'world'}!` };
    }),
});