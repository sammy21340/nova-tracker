import { useEffect, useState } from "react";

const SEARCH_DELAY_MS = 350;
const MAX_RESULTS = 6;

// A search box that looks coins up on CoinGecko as you type.
// When you pick a result it calls onSelect({ coinId, symbol, name }).
function CoinSearch({ onSelect }) {
  const [query, setQuery] = useState("");

  // The latest finished search, tagged with the text it was for. Tagging it
  // means we never show results for an old query next to a new one.
  const [search, setSearch] = useState({ forQuery: "", coins: [], failed: false });

  const trimmed = query.trim();
  const isSearching = trimmed.length >= 2;
  const hasCurrentResults = search.forQuery === trimmed;

  useEffect(() => {
    if (trimmed.length < 2) return;

    let isCurrent = true;

    // Debounce: wait until the user pauses typing before hitting the API,
    // so typing "bitcoin" makes one request instead of seven.
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(trimmed)}`
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();

        // If the user kept typing, this response is for an old query — ignore it
        if (isCurrent) {
          setSearch({
            forQuery: trimmed,
            coins: data.coins.slice(0, MAX_RESULTS),
            failed: false,
          });
        }
      } catch {
        if (isCurrent) {
          setSearch({ forQuery: trimmed, coins: [], failed: true });
        }
      }
    }, SEARCH_DELAY_MS);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [trimmed]);

  function pick(coin) {
    onSelect({ coinId: coin.id, symbol: coin.symbol, name: coin.name });
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setQuery("");
    } else if (e.key === "Enter") {
      // Enter would submit the whole form — use it to pick the top result instead
      e.preventDefault();
      if (hasCurrentResults && search.coins.length > 0) {
        pick(search.coins[0]);
      }
    }
  }

  let dropdown = null;

  if (isSearching) {
    if (!hasCurrentResults) {
      dropdown = <p className="coin-search-status">Searching…</p>;
    } else if (search.failed) {
      dropdown = (
        <p className="coin-search-status">
          Couldn't reach coin search. Wait a moment and edit your search to retry.
        </p>
      );
    } else if (search.coins.length === 0) {
      dropdown = <p className="coin-search-status">No coins found.</p>;
    } else {
      dropdown = search.coins.map((coin) => (
        <button
          type="button"
          key={coin.id}
          className="coin-result"
          onClick={() => pick(coin)}
        >
          <span>
            {coin.name} <span className="coin-result-symbol">{coin.symbol}</span>
          </span>
          {coin.market_cap_rank && (
            <span className="coin-result-meta">#{coin.market_cap_rank}</span>
          )}
        </button>
      ));
    }
  }

  return (
    <div className="coin-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search by name or symbol, e.g. solana or ETH"
        aria-label="Search for a coin"
        autoComplete="off"
      />

      {dropdown && <div className="coin-results">{dropdown}</div>}
    </div>
  );
}

export default CoinSearch;