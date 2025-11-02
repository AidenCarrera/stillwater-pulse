import feedsData from '@/data/feeds.json'

export interface Post {
  title: string;
  link: string;
  pubDate: string;
  account: string;
  image?: string;
  contentSnippet?: string;
}

const accounts = Object.keys(feedsData);

// Use environment variable for backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function fetchPostsFromAllAccounts(): Promise<Post[]> {
  const allPosts: Post[] = [];

  for (const account of accounts) {
    try {
      const res = await fetch(`${API_URL}/posts?username=${account}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        console.error(`Failed to fetch posts for ${account}: ${res.status} ${res.statusText}`);
        continue;
      }

      const posts = await res.json();

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

  allPosts.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return allPosts;
}

export function getAccountNames(): string[] {
  return accounts;
}
