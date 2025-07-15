import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

// --- Schemas / Data Contracts ---

const GetUsersInputSchema = z.object({
  searchQuery: z.string().optional(),
  filterByGender: z.enum(['male', 'female']).optional(),
  sortBy: z.enum(['name', 'email', 'age']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

const UserSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  age: z.number(),
  gender: z.string(),
  image: z.string().url(),
});

const UserApiResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

type User = z.infer<typeof UserSchema>;

// --- The Router Implementation ---

export const userRouter = createTRPCRouter({
  getUsers: publicProcedure
    .input(GetUsersInputSchema)
    .output(UserApiResponseSchema)
    .query(async ({ input }) => {
      // 1. Determine the correct remote API endpoint to call
      let url = 'https://dummyjson.com/users?limit=0';
      if (input.searchQuery) {
        url = `https://dummyjson.com/users/search?q=${input.searchQuery}`;
      } else if (input.filterByGender) {
        url = `https://dummyjson.com/users/filter?key=gender&value=${input.filterByGender}&limit=0`;
      }

      // 2. Fetch data and validate its shape
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch users from dummyjson.com');
      }
      const data = await response.json();
      const validatedData = UserApiResponseSchema.parse(data);

      // 3. Perform server-side sorting if requested
      const { sortBy, sortOrder } = input;
      if (sortBy) {
        validatedData.users.sort((a: User, b: User) => {
          const valA = sortBy === 'name' ? a.firstName : a[sortBy];
          const valB = sortBy === 'name' ? b.firstName : b[sortBy];

          let comparison = 0;
          if (valA > valB) {
            comparison = 1;
          } else if (valA < valB) {
            comparison = -1;
          }

          return sortOrder === 'desc' ? comparison * -1 : comparison;
        });
      }

      return validatedData;
    }),
});
