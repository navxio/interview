import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from '~/server/api/root';
import { createCaller } from '~/server/api/root';

// Mock deps
vi.mock('~/server/db', () => ({ db: {} })); // Prevent db connection
global.fetch = vi.fn(); // Mock the global fetch fn

const caller = createCaller({ db: null }); // tRPC caller for testing

describe('userRouter.getUsers', () => {

  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    vi.mocked(fetch).mockReset();
  });

  const mockUsers = [
    // Use valid placeholder URLs for the image property
    { id: 1, firstName: 'Terry', lastName: 'Medhurst', email: 'atuny0@sohu.com', age: 50, gender: 'male', image: 'https://robohash.org/Terry.png' },
    { id: 2, firstName: 'Sheldon', lastName: 'Quigley', email: 'hbingley1@plala.or.jp', age: 28, gender: 'male', image: 'https://robohash.org/Sheldon.png' },
    { id: 3, firstName: 'Clementine', lastName: 'Bauch', email: 'clementine@bauch.com', age: 40, gender: 'female', image: 'https://robohash.org/Clementine.png' },
  ];

  const mockApiResponse = { users: mockUsers, total: 3, skip: 0, limit: 3 };

  // Base Case
  it('should fetch all users when no input is provided', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await caller.user.getUsers({});

    expect(fetch).toHaveBeenCalledWith('https://dummyjson.com/users?limit=0');
    expect(result.users.length).toBe(3);
  });

  // Search
  it('should call the search endpoint when a searchQuery is provided', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockApiResponse, users: [mockUsers[0]] }),
    });

    await caller.user.getUsers({ searchQuery: 'Terry' });

    expect(fetch).toHaveBeenCalledWith('https://dummyjson.com/users/search?q=Terry');
  });

  // Filtering
  it('should call the filter endpoint when a filter is provided', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockApiResponse, users: [mockUsers[2]] }),
    });

    await caller.user.getUsers({ filterByGender: 'female' });

    expect(fetch).toHaveBeenCalledWith('https://dummyjson.com/users/filter?key=gender&value=female&limit=0');
  });

  // Sorting
  it('should return users sorted by name in ascending order', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse), // Return unsorted mock data
    });

    const result = await caller.user.getUsers({ sortBy: 'name', sortOrder: 'asc' });

    // Assert the ORDER of the returned items
    expect(result.users.map(u => u.firstName)).toEqual(['Clementine', 'Sheldon', 'Terry']);
  });

  // Sorting by another property
  it('should return users sorted by age in descending order', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await caller.user.getUsers({ sortBy: 'age', sortOrder: 'desc' });

    expect(result.users.map(u => u.age)).toEqual([50, 40, 28]);
  });
});
