'use client';

interface AccountBadgesProps {
  accounts: string[];
}

export default function AccountBadges({ accounts }: AccountBadgesProps) {
  return (
    <div className="bg-white rounded-lg shadow-card p-6 mb-8 animate-fade-in">
      <p className="text-sm font-medium text-gray-700 mb-3">Active Accounts:</p>
      <div className="flex flex-wrap gap-2">
        {accounts.map((account) => (
          <span
            key={account}
            className="px-3 py-1 text-sm bg-secondary-100 text-secondary-700 rounded-full hover:bg-secondary-200 transition-colors"
          >
            @{account}
          </span>
        ))}
      </div>
    </div>
  );
}