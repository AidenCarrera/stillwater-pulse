'use client';

import { useState, useEffect } from 'react';
import { fetchPostsFromAllAccounts, getAccountNames } from '@/lib/rss';
import PostGrid from '@/components/PostGrid';
import Script from 'next/script';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load posts & accounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await fetchPostsFromAllAccounts();
        const fetchedAccounts = getAccountNames();
        setPosts(fetchedPosts);
        setAccounts(fetchedAccounts);
      } catch (err) {
        console.error('Failed to load posts:', err);
        setError('Failed to load Instagram posts.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Reprocess Instagram embeds whenever posts change
  useEffect(() => {
    if ((window as any).instgrm) {
      (window as any).instgrm.Embeds.process();
    }
  }, [posts]);

  return (
    <>
      {/* Instagram embed script */}
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => {
          if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
          }
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-orange-600">Stillwater Pulse</h1>
              <p className="text-sm text-gray-600 mt-1">
                Latest posts from {accounts.length} Stillwater Instagram accounts
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              <p className="mt-4 text-gray-600">Loading Stillwater Pulse...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Account Badges */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <p className="text-sm font-medium text-gray-700 mb-3">Active Accounts:</p>
                <div className="flex flex-wrap gap-2">
                  {accounts.map((account) => (
                    <span
                      key={account}
                      className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full"
                    >
                      @{account}
                    </span>
                  ))}
                </div>
              </div>

              {/* Posts Grid */}
              <PostGrid posts={posts} />
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Stillwater Pulse | Aggregating the best of Stillwater, Oklahoma
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Posts are embedded from public Instagram accounts. All content belongs to their respective creators.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
