import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChange,
  placeholder = 'Search team or fixture...',
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto px-3 sm:px-6 my-2">
      <div className="relative flex items-center">
        <Search className="absolute left-6 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-sporty-green focus:ring-1 focus:ring-sporty-green transition"
        />
        {query && (
          <button
            onClick={() => onChange('')}
            className="absolute right-6 p-1 text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
