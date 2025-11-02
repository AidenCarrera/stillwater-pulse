'use client';

import type { Post } from '@/lib/rss';

interface PostCardProps {
  post: Post;
  index: number;
}

export default function PostCard({ post, index }: PostCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-4">
        {/* Post Header */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-secondary-600">
            @{post.account}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(post.pubDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        
        {/* Instagram Blockquote Embed */}
        <div className="instagram-embed-wrapper">
          <blockquote
            className="instagram-media"
            data-instgrm-captioned
            data-instgrm-permalink={post.link}
            data-instgrm-version="14"
          >
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              Loading Instagram post...
            </a>
          </blockquote>
        </div>
      </div>
    </div>
  );
}