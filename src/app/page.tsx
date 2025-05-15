/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/prefer-optional-chain, @typescript-eslint/prefer-optional-chain */


'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { trpc } from '@/utils/trpc';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function HomePage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch all companies
  const { data: companies = [], isLoading } = trpc.company.list.useQuery();

  // Derive unique categories from companies
  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    companies.forEach(c => {
      c.categories.forEach(cat => map.set(cat.id, cat));
    });
    return Array.from(map.values());
  }, [companies]);

  // Filter companies by search and category
  const filtered = useMemo(() => {
    return companies.filter(c => {
      const matchName = c.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory
        ? c.categories.some(cat => cat.id === selectedCategory)
        : true;
      return matchName && matchCat;
    });
  }, [companies, search, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">French SaaS Directory</h1>
          <nav className="space-x-4">
            {session ? (
              <>
                <span>{session.user?.name}</span>
                <button onClick={() => signOut()} className="text-blue-600">Sign out</button>
              </>
            ) : (
              <button onClick={() => signIn()} className="text-blue-600">Sign in</button>
            )}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-10">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-xl mb-2">Categories</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 border rounded ${!selectedCategory ? 'bg-blue-500 text-white' : ''}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 border rounded ${selectedCategory === cat.id ? 'bg-blue-500 text-white' : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Company Grid */}
        {isLoading ? (
          <p>Loading companies...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.length > 0 ? (
              filtered.map(company => (
                <Link
                  key={company.id}
                  href={`/companies/${company.id}`}
                  className="block bg-white p-4 rounded shadow hover:shadow-lg"
                >
                  <h3 className="text-lg font-semibold">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.description}</p>
                </Link>
              ))
            ) : (
              <p>No companies found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
