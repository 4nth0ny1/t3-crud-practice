import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure
} from "~/server/api/trpc";
import { postInput } from "~/types"

export const postRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        });
    
        return posts;
      }),
      create: protectedProcedure.input(postInput).mutation(async ({ ctx, input }) => {
        return ctx.prisma.post.create({
            data: {
                content: input,
                user: {
                    connect: {
                        id: ctx.session.user.id
                    }
                }
            }
        })
    })
});