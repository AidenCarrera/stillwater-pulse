'use client';

import { useState, useEffect } from 'react';
import { fetchPostsFromAllAccounts, getAccountNames } from '@/lib/rss';
import { useInstagramEmbed } from '@/hooks/useInstagramEmbed';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccountBadges from '@/components/AccountBadges';
import PostGrid from '@/components/PostGrid';
import ChatWindow from '@/components/ChatWindow';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use Instagram embed hook
  useInstagramEmbed([posts]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header accountCount={accounts.length} />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <LoadingState />}
        
        {error && <ErrorState message={error} />}

        {!loading && !error && (
          <>
            {/* Account Badges */}
            <AccountBadges accounts={accounts} />

            {/* Posts Grid */}
            <PostGrid posts={posts} />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Chat Window - Floating on right side */}
      <ChatWindow posts={posts} />
    </div>
  );
}
