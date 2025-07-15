import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.post.create({
          data: {
            name: input.name,
          },
        });
      } catch (e) {
        return null;
      }
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    try {
      const post = await ctx.db.post.findFirst({
        orderBy: { createdAt: "desc" },
      });
      return post ?? null;
    } catch (e) {
      return null;
    }
  }),
});
