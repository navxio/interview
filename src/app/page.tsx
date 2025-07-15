import AddressBook from "./_components/AddressBook";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900">Address Book</h1>
        </header>
        <AddressBook />
      </div>
    </main>
  );
}
