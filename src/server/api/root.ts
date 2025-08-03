import { createTRPCRouter } from '@/server/api/trpc';
import { papersRouter } from '@/server/api/routers/papers';
import { usersRouter } from '@/server/api/routers/users';
import { categoriesRouter } from '@/server/api/routers/categories';

export const appRouter = createTRPCRouter({
  papers: papersRouter,
  users: usersRouter,
  categories: categoriesRouter,
});

export type AppRouter = typeof appRouter;

