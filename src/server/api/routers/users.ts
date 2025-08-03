import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc';

export const usersRouter = createTRPCRouter({
  getProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
        include: {
          papers: {
            include: {
              category: true,
              _count: {
                select: {
                  likes: true,
                  comments: true,
                  citations: true,
                },
              },
            },
            orderBy: {
              publishedAt: 'desc',
            },
          },
          _count: {
            select: {
              followers: true,
              following: true,
              papers: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        institution: z.string().optional(),
        department: z.string().optional(),
        position: z.string().optional(),
        orcid: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });

      return user;
    }),

  follow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        throw new Error('Cannot follow yourself');
      }

      const existingFollow = await ctx.db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.session.user.id,
            followingId: input.userId,
          },
        },
      });

      if (existingFollow) {
        await ctx.db.follow.delete({
          where: { id: existingFollow.id },
        });
        return { following: false };
      } else {
        await ctx.db.follow.create({
          data: {
            followerId: ctx.session.user.id,
            followingId: input.userId,
          },
        });
        return { following: true };
      }
    }),

  getFollowers: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const followers = await ctx.db.follow.findMany({
        where: { followingId: input.userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              institution: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return followers.map((follow) => follow.follower);
    }),

  getFollowing: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const following = await ctx.db.follow.findMany({
        where: { followerId: input.userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              institution: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return following.map((follow) => follow.following);
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.db.user.findMany({
        where: {
          OR: [
            { name: { contains: input.query, mode: 'insensitive' } },
            { username: { contains: input.query, mode: 'insensitive' } },
            { institution: { contains: input.query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          institution: true,
          verified: true,
          _count: {
            select: {
              papers: true,
              followers: true,
            },
          },
        },
        take: input.limit,
        orderBy: {
          verified: 'desc',
        },
      });

      return users;
    }),
});

