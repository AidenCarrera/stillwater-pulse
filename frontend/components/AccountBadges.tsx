'use client';

interface AccountBadgesProps {
  accounts: string[];
  selectedAccount: string | null;
  onAccountClick: (account: string) => void;
}

export default function AccountBadges({ accounts, selectedAccount, onAccountClick }: AccountBadgesProps) {
  return (
    <div className="mb-10 animate-fade-in">
      <div className="flex items-baseline gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filter Posts</h3>
        {selectedAccount && (
          <span className="text-sm text-gray-500">
            • Click <span className="font-medium text-orange-600">@{selectedAccount}</span> again to clear
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {accounts.map((account) => {
          const isSelected = selectedAccount === account;
          return (
            <button
              key={account}
              onClick={() => onAccountClick(account)}
              className={`group relative px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 text-white shadow-lg shadow-orange-500/40 bg-size-200 animate-gradient'
                  : 'bg-white text-gray-700 shadow-md hover:shadow-xl hover:scale-105 border border-gray-100'
              }`}
            >
              <span className="relative z-10">@{account}</span>
              {!isSelected && (
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}