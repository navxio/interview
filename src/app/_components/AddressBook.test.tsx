import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddressBook from '../_components/AddressBook';
import { api } from '~/trpc/react';

// Mock the entire tRPC API and the debounce hook
vi.mock('~/trpc/react', () => ({
  api: {
    user: {
      getUsers: {
        useQuery: vi.fn(),
      },
    },
  },
}));

vi.mock('../_hooks/useDebounce', () => ({
  // For tests, we make debounce return the value immediately to simplify things
  useDebounce: (value: any) => value,
}));

const useQueryMock = vi.mocked(api.user.getUsers.useQuery);

describe('<AddressBook />', () => {

  // default, empty data object

  const mockInitialData = {
    users: [],
    total: 0,
    skip: 0,
    limit: 0
  }

  it('should render loading, error, and success states correctly', () => {
    // Test loading state
    useQueryMock.mockReturnValue({ isLoading: true, isError: false, data: undefined });
    const { rerender } = render(<AddressBook initialData={mockInitialData} />);
    expect(screen.getByText(/loading users.../i)).toBeInTheDocument();

    // Test error state
    useQueryMock.mockReturnValue({ isLoading: false, isError: true, data: undefined });
    rerender(<AddressBook initialData={mockInitialData} />);
    expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();

    // Test success state
    const successData = { users: [{ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@doe.com', age: 30, gender: 'male', image: 'https://robohash.org/John.png' }], total: 1, skip: 0, limit: 1 };
    useQueryMock.mockReturnValue({ isLoading: false, isError: false, data: successData });
    rerender(<AddressBook initialData={successData} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should call useQuery with correct search and sort parameters', async () => {
    useQueryMock.mockReturnValue({ isLoading: false, isError: false, data: { users: [] } });
    render(<AddressBook initialData={mockInitialData} />);

    // Use expect.objectContaining to only check the properties we care about(looser than direct object comparison)
    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        searchQuery: '',
        sortBy: 'name',
        filterByGender: undefined,
      }),
      expect.any(Object)
    );

    // 2. Simulate user changing the sort dropdown
    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.change(sortSelect, { target: { value: 'age' } });

    // 3. Assert that the hook was re-called with the new sort value
    await waitFor(() => {
      expect(useQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          searchQuery: '',
          sortBy: 'age',
          filterByGender: undefined,
        }),
        expect.any(Object)
      );

    });
  });
});
