'use client';

import React, { useState } from 'react';
import { api } from '~/trpc/react';
import { useDebounce } from '../_hooks/useDebounce';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '~/server/api/root';

// Infer the user type from the API output for type safety
type User = inferRouterOutputs<AppRouter>['user']['getUsers']['users'][number];

// A simple, visually clean card for displaying a single user
function UserCard({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-lg">
      <img src={user.image} alt={`${user.firstName} ${user.lastName}`} className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-200" />
      <div>
        <p className="text-xl font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
        <p className="text-xs text-gray-400">Age: {user.age} | Gender: {user.gender}</p>
      </div>
    </div>
  );
}

export default function AddressBook() {
  // --- State Management ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'email'>('name');
  const [filterGender, setFilterGender] = useState<'male' | 'female' | undefined>(undefined);

  // Apply debounce to the search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // --- Data Fetching ---
  const { data, isLoading, isError } = api.user.getUsers.useQuery({
    searchQuery: debouncedSearchTerm,
    sortBy: sortBy,
    filterByGender: filterGender,
  }, {
    // Keep previous data visible while new data is loading for a smoother UX
    placeholderData: (previousData) => previousData,
  });

  // --- Conditional Rendering ---
  const renderContent = () => {
    if (isLoading && !data) { // Show loading only on the initial fetch
      return <p className="py-8 text-center text-gray-500">Loading users...</p>;
    }
    if (isError) {
      return <p className="py-8 text-center text-red-500">Failed to load users. Please try again later.</p>;
    }
    if (!data || data.users.length === 0) {
      return <p className="py-8 text-center text-gray-500">No users found matching your criteria.</p>;
    }
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* --- Interactive Controls --- */}
      <div className="grid grid-cols-1 gap-4 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:col-span-3 lg:col-span-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <label htmlFor="filter-gender" className="text-sm font-medium text-gray-700">Filter by Gender:</label>
          <select
            id="filter-gender"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={filterGender ?? ''}
            onChange={(e) => setFilterGender(e.target.value as 'male' | 'female' | undefined || undefined)}
          >
            <option value="">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            id="sort-by"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'age' | 'email')}
          >
            <option value="name">Name</option>
            <option value="age">Age</option>
            <option value="email">Email</option>
          </select>
        </div>
      </div>

      {/* --- Content Display --- */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
}
