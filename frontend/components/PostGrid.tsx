'use client';

import { useInstagramEmbed } from '@/hooks/useInstagramEmbed';
import PostCard from '@/components/PostCard';
import type { Post } from '@/lib/rss';

interface PostGridProps {
  posts: Post[];
  selectedAccount?: string | null;
}

export default function PostGrid({ posts, selectedAccount }: PostGridProps) {
  // Use custom hook to handle Instagram embeds
  useInstagramEmbed([posts]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-card">
        <p className="text-gray-600">
          {selectedAccount 
            ? `No posts available from @${selectedAccount}`
            : 'No posts available at this time'
          }
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {selectedAccount ? (
            <>
              Posts from <span className="text-secondary-600">@{selectedAccount}</span> ({posts.length})
            </>
          ) : (
            <>Latest Posts ({posts.length})</>
          )}
        </h2>
        <p className="text-sm text-gray-600">
          Sorted chronologically • Latest 5 per account
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <PostCard 
            key={`${post.account}-${index}`} 
            post={post} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
}