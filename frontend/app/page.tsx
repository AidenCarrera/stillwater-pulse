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
import type { Post } from '@/lib/rss';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

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

  // Filter posts based on selected account
  const filteredPosts = selectedAccount
    ? posts.filter(post => post.account === selectedAccount)
    : posts;

  // Handle account selection
  const handleAccountClick = (account: string) => {
    setSelectedAccount(selectedAccount === account ? null : account);
  };

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
            <AccountBadges 
              accounts={accounts} 
              selectedAccount={selectedAccount}
              onAccountClick={handleAccountClick}
            />

            {/* Posts Grid */}
            <PostGrid posts={filteredPosts} selectedAccount={selectedAccount} />
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