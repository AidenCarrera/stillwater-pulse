'use client';

interface AccountBadgesProps {
  accounts: string[];
  selectedAccounts: string[];
  onAccountClick: (account: string) => void;
  onClearFilters: () => void;
}

export default function AccountBadges({ 
  accounts, 
  selectedAccounts, 
  onAccountClick,
  onClearFilters 
}: AccountBadgesProps) {
  return (
    <div className="mb-10 animate-fade-in">
      <div className="flex items-baseline gap-3 mb-4 flex-wrap">
        <h3 className="text-lg font-semibold text-gray-800">Filter Posts</h3>
        {selectedAccounts.length > 0 && (
          <>
            <span className="text-sm text-gray-500">
              • {selectedAccounts.length} {selectedAccounts.length === 1 ? 'account' : 'accounts'} selected
            </span>
            <button
              onClick={onClearFilters}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium underline"
            >
              Clear all filters
            </button>
          </>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {accounts.map((account) => {
          const isSelected = selectedAccounts.includes(account);
          return (
            <button
              key={account}
              onClick={() => onAccountClick(account)}
              className={`group relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap ${
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