import { useState, useEffect, useCallback, useMemo } from "react";
import { enrichHoldings, summarize, withAllocation } from "../utils/portfolioMath";
import { CURRENCIES } from "../utils/format";

// No backend for v1: holdings are just a local list of {coin, quantity,
// optional cost basis} — there's no account to protect, so localStorage
// here is a completely different risk than the auth-token case in Login.jsx.

const STORAGE_KEY = "portfolio-holdings";
const CURRENCY_KEY = "portfolio-currency";
const REFRESH_INTERVAL_MS = 60_000; // CoinGecko's free, no-key tier is comfortable with one batched call/min

function loadHoldings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadCurrency() {
  try {
    const saved = localStorage.getItem(CURRENCY_KEY);
    return CURRENCIES.includes(saved) ? saved : "usd";
  } catch {
    return "usd";
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
  const [currency, setCurrency] = useState(loadCurrency);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    saveHoldings(holdings);
  }, [holdings]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_KEY, currency);
    } catch {
      // Same as holdings: not worth crashing over
    }
  }, [currency]);

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
        costCurrency: holding.costCurrency ?? "usd", // currency the cost was entered in
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
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${CURRENCIES.join(",")}&include_24hr_change=true`
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

  // Derived values — the maths lives in utils/portfolioMath.js
  const enriched = useMemo(
    () => enrichHoldings(holdings, prices, currency),
    [holdings, prices, currency]
  );

  const { totalValue, totalProfitLoss, totalProfitLossPct } = useMemo(
    () => summarize(enriched),
    [enriched]
  );

  const allocation = useMemo(
    () => withAllocation(enriched, totalValue),
    [enriched, totalValue]
  );

  return {
    holdings: allocation,
    totalValue,
    totalProfitLoss,
    totalProfitLossPct,
    currency,
    setCurrency,
    loading,
    error,
    addHolding,
    removeHolding,
    updateHolding,
  };
}