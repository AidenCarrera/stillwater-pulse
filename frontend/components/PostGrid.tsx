'use client'

import { useEffect } from 'react'
import type { Post } from '@/lib/rss'

interface PostGridProps {
  posts: Post[]
}

export default function PostGrid({ posts }: PostGridProps) {
  // Load Instagram embed script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    document.body.appendChild(script)

    // Re-initialize embeds after script loads
    script.onload = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process()
      }
    }

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Process embeds when posts change or script loads
  useEffect(() => {
    const processEmbeds = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process()
      }
    }

    // Process immediately if script is already loaded
    processEmbeds()

    // Also process after a short delay to ensure script is ready
    const timeout = setTimeout(processEmbeds, 1000)

    return () => clearTimeout(timeout)
  }, [posts])

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-gray-600">No posts available at this time</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Latest Posts ({posts.length})
        </h2>
        <p className="text-sm text-gray-600">
          Sorted chronologically • Latest 5 per account
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <div
            key={`${post.account}-${index}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Instagram Post Embed */}
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-600">
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
        ))}
      </div>
    </div>
  )
}

// Extend Window interface for Instagram embed
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}

