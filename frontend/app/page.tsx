import { fetchPostsFromAllAccounts, getAccountNames } from '@/lib/rss'
import PostGrid from '@/components/PostGrid'

export default async function Home() {
  const posts = await fetchPostsFromAllAccounts()
  const accounts = getAccountNames()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Stillwater Pulse</h1>
          <p className="text-gray-600">
            Latest Instagram posts from {accounts.length} Stillwater accounts
          </p>
        </div>

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
      </div>
    </main>
  )
}
