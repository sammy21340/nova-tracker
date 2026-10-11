import { useState, useEffect, useCallback, useMemo } from "react";

// No backend for v1: holdings are just a local list of {coin, quantity,
// optional cost basis} — there's no account to protect, so localStorage
// here is a completely different risk than the auth-token case in Login.jsx.

const STORAGE_KEY = "portfolio-holdings";
const REFRESH_INTERVAL_MS = 60_000; // CoinGecko's free, no-key tier is comfortable with one batched call/min

function loadHoldings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHoldings(holdings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
  } catch {
    // Storage can fail (private browsing, quota) — losing persistence
    // isn't worth crashing the app over, so we just skip the save
  }
}

export function usePortfolio() {
  const [holdings, setHoldings] = useState(loadHoldings);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    saveHoldings(holdings);
  }, [holdings]);

  const addHolding = useCallback((holding) => {
    setHoldings((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        coinId: holding.coinId, // CoinGecko id, e.g. "bitcoin"
        symbol: holding.symbol, // e.g. "BTC"
        name: holding.name, // e.g. "Bitcoin"
        quantity: Number(holding.quantity),
        costBasis: holding.costBasis ? Number(holding.costBasis) : null, // price paid per unit, optional
      },
    ]);
  }, []);

  const removeHolding = useCallback((id) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const updateHolding = useCallback((id, changes) => {
    setHoldings((prev) => prev.map((h) => (h.id === id ? { ...h, ...changes } : h)));
  }, []);

  // Batch every held coin into one request rather than one fetch per coin
  useEffect(() => {
    let isCurrent = true;

    async function loadPrices() {
      if (holdings.length === 0) {
        setPrices({});
        setLoading(false);
        return;
      }

      setError("");

      try {
        const ids = [...new Set(holdings.map((h) => h.coinId))].join(",");
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );

        if (!response.ok) {
          throw new Error("Unable to reach the price feed.");
        }

        const data = await response.json();

        if (isCurrent) {
          setPrices(data);
        }
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.message || "Unable to load prices.");
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    loadPrices();
    const interval = setInterval(loadPrices, REFRESH_INTERVAL_MS);

    return () => {
      isCurrent = false;
      clearInterval(interval);
    };
  }, [holdings]);

  // Derived values — this is the actual "portfolio" part
  const enriched = useMemo(() => {
    return holdings.map((h) => {
      const price = prices[h.coinId]?.usd ?? null;
      const change24h = prices[h.coinId]?.usd_24h_change ?? null;
      const value = price !== null ? price * h.quantity : null;
      const costTotal = h.costBasis !== null ? h.costBasis * h.quantity : null;
      const profitLoss = value !== null && costTotal !== null ? value - costTotal : null;
      const profitLossPct = profitLoss !== null && costTotal ? (profitLoss / costTotal) * 100 : null;

      return { ...h, price, change24h, value, profitLoss, profitLossPct };
    });
  }, [holdings, prices]);

  const totalValue = useMemo(
    () => enriched.reduce((sum, h) => sum + (h.value ?? 0), 0),
    [enriched]
  );

  const totalCost = useMemo(
    () => enriched.reduce((sum, h) => sum + (h.costBasis ? h.costBasis * h.quantity : 0), 0),
    [enriched]
  );

  const totalProfitLoss = totalCost ? totalValue - totalCost : null;
  const totalProfitLossPct =
    totalProfitLoss !== null && totalCost ? (totalProfitLoss / totalCost) * 100 : null;

  // Every holding stays in the list, even if CoinGecko has no price for it —
  // otherwise it would silently vanish from the screen (and be impossible to remove)
  const allocation = useMemo(
    () =>
      enriched.map((h) => ({
        ...h,
        allocationPct:
          totalValue && h.value !== null ? (h.value / totalValue) * 100 : 0,
      })),
    [enriched, totalValue]
  );

  return {
    holdings: allocation,
    totalValue,
    totalProfitLoss,
    totalProfitLossPct,
    loading,
    error,
    addHolding,
    removeHolding,
    updateHolding,
  };
}