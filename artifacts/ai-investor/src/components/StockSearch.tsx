import React, { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";

const POPULAR_STOCKS = ["RELIANCE.NS", "AAPL", "TSLA", "TATAMOTORS.NS", "NVDA"];

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  isLoading: boolean;
}

export function StockSearch({ onSearch, isLoading }: StockSearchProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim().toUpperCase());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <form onSubmit={handleSubmit} className="w-full relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter stock symbol (e.g. RELIANCE.NS, AAPL)..."
          className="w-full h-14 pl-12 pr-32 rounded-2xl glass-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg shadow-lg font-mono tracking-wider transition-all"
          disabled={isLoading}
        />
        <div className="absolute inset-y-1.5 right-1.5">
          <Button 
            type="submit" 
            disabled={!query.trim() || isLoading}
            className="h-full rounded-xl px-6 font-semibold"
          >
            Analyze
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 uppercase tracking-wider">
          <TrendingUp className="w-3 h-3" /> Trending
        </span>
        {POPULAR_STOCKS.map((stock) => (
          <button
            key={stock}
            onClick={() => {
              setQuery(stock);
              onSearch(stock);
            }}
            disabled={isLoading}
            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-white/10 hover:border-primary/50 transition-all disabled:opacity-50"
          >
            {stock}
          </button>
        ))}
      </div>
    </div>
  );
}
