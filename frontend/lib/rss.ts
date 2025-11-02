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

// Get API URL from environment variable (required)
const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
  }
  return apiUrl;
};

export async function fetchPostsFromAllAccounts(): Promise<Post[]> {
  const allPosts: Post[] = [];
  const API_URL = getApiUrl();

  for (const account of accounts) {
    try {
      const res = await fetch(`${API_URL}/posts?username=${account}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
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
      // Error fetching posts for account - continue with other accounts
    }
  }

  allPosts.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return allPosts;
}

export function getAccountNames(): string[] {
  return accounts;
}
