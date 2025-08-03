import { createTRPCRouter } from '@/server/api/trpc';
import { papersRouter } from '@/server/api/routers/papers';
import { usersRouter } from '@/server/api/routers/users';
import { categoriesRouter } from '@/server/api/routers/categories';
import { interactionsRouter } from '@/server/api/routers/interactions';

export const appRouter = createTRPCRouter({
  papers: papersRouter,
  users: usersRouter,
  categories: categoriesRouter,
  interactions: interactionsRouter,
});

export type AppRouter = typeof appRouter;

