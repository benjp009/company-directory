import { initTRPC } from '@trpc/server';
import SuperJSON from 'superjson';

// Create a tRPC instance
export const t = initTRPC.create({
  transformer: SuperJSON,
  errorFormatter({ shape }) {
    return shape;
  },
});
