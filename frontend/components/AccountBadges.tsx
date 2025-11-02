'use client';

interface AccountBadgesProps {
  accounts: string[];
  selectedAccount: string | null;
  onAccountClick: (account: string) => void;
}

export default function AccountBadges({ accounts, selectedAccount, onAccountClick }: AccountBadgesProps) {
  return (
    <div className="bg-white rounded-lg shadow-card p-6 mb-8 animate-fade-in">
      <p className="text-sm font-medium text-gray-700 mb-3">
        Active Accounts: 
        {selectedAccount && (
          <span className="ml-2 text-xs text-gray-500">
            (Click again to show all)
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {accounts.map((account) => {
          const isSelected = selectedAccount === account;
          return (
            <button
              key={account}
              onClick={() => onAccountClick(account)}
              className={`px-3 py-1 text-sm rounded-full transition-all cursor-pointer ${
                isSelected
                  ? 'bg-secondary-600 text-white shadow-md scale-105'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              @{account}
            </button>
          );
        })}
      </div>
    </div>
  );
}