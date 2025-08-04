import { createTRPCRouter } from '@/server/api/trpc';
import { papersRouter } from '@/server/api/routers/papers';
import { usersRouter } from '@/server/api/routers/users';
import { categoriesRouter } from '@/server/api/routers/categories';
import { interactionsRouter } from '@/server/api/routers/interactions';
import { submissionsRouter } from '@/server/api/routers/submissions';
import { discoveryRouter } from '@/server/api/routers/discovery';

export const appRouter = createTRPCRouter({
  papers: papersRouter,
  users: usersRouter,
  categories: categoriesRouter,
  interactions: interactionsRouter,
  submissions: submissionsRouter,
  discovery: discoveryRouter,
});

export type AppRouter = typeof appRouter;

