import AddressBook from "./_components/AddressBook";

import { api } from "~/trpc/server";

export default async function Home() {
  const initialUsers = await api.user.getUsers({ sortBy: 'name' });
  return (
    <main className="min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900">Address Book</h1>
        </header>
        <AddressBook initialData={initialUsers} />
      </div>
    </main>
  );
}
