import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc';

export const categoriesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      include: {
        _count: {
          select: {
            papers: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              papers: true,
            },
          },
        },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      return category;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        nameAr: z.string().min(1),
        description: z.string().optional(),
        color: z.string().default('#3B82F6'),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can create categories
      if (ctx.session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }

      const category = await ctx.db.category.create({
        data: input,
      });

      return category;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        nameAr: z.string().optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can update categories
      if (ctx.session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }

      const { id, ...data } = input;
      const category = await ctx.db.category.update({
        where: { id },
        data,
      });

      return category;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Only admins can delete categories
      if (ctx.session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }

      // Check if category has papers
      const paperCount = await ctx.db.paper.count({
        where: { categoryId: input.id },
      });

      if (paperCount > 0) {
        throw new Error('Cannot delete category with existing papers');
      }

      await ctx.db.category.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

