import Parser from 'rss-parser'
import feedsData from '@/data/feeds.json'

const feeds = feedsData as Record<string, string>

const parser = new Parser()

export interface Post {
  title: string;
  link: string;
  pubDate: string;
  account: string;
  image?: string;
  contentSnippet?: string;
}

// List of accounts you want to fetch from
const accounts = ["okstate", "releaseradar"];

export async function fetchPostsFromAllAccounts(): Promise<Post[]> {
  const allPosts: Post[] = [];

  for (const account of accounts) {
    try {
      const res = await fetch(`http://127.0.0.1:8000/posts?username=${account}`);
      if (!res.ok) {
        console.error(`Failed to fetch posts for ${account}: ${res.statusText}`);
        continue;
      }

      const posts = await res.json();

      // Map backend posts to frontend Post interface
      posts.forEach((p: any) => {
        allPosts.push({
          title: p.title || "Untitled Post",
          link: p.link || "",
          pubDate: p.published || new Date().toISOString(),
          account,
          image: p.image || "",
          contentSnippet: p.title || "",
        });
      });
    } catch (error) {
      console.error(`Error fetching posts for ${account}:`, error);
    }
  }

  // Sort all posts newest first
  allPosts.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return allPosts;
}

export function getAccountNames(): string[] {
  return accounts;
}


