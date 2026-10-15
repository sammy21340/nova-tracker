import { useEffect, useState } from "react";

// Lives for the whole session. Switching back to a coin/range you already
// loaded costs zero API calls.
const cache = new Map();
const MAX_AGE = 5 * 60 * 1000; // 5 minutes

export function usePriceHistory(coinId, currency, days) {
  const [result, setResult] = useState({ key: null, status: "idle", data: [], error: "" });
  const [attempt, setAttempt] = useState(0);

  // One string that identifies "which chart is this?"
  const key = coinId ? `${coinId}|${currency}|${days}` : null;

  useEffect(() => {
    if (!key) return;

    const hit = cache.get(key);
    if (hit && Date.now() - hit.time < MAX_AGE) {
      setResult({ key, status: "ready", data: hit.data, error: "" });
      return;
    }

    // Lets us cancel this request if the user clicks another coin/range
    // before it finishes. Without it, a slow old response can arrive late
    // and overwrite the chart you're actually looking at.
    const controller = new AbortController();

    const url =
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}` +
      `/market_chart?vs_currency=${currency}&days=${days}`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (res.status === 429) throw new Error("CoinGecko rate limit hit. Wait a minute, then retry.");
        if (!res.ok) throw new Error(`Couldn't load the chart (error ${res.status}).`);
        return res.json();
      })
      .then((json) => {
        const data = (json.prices || []).map(([t, p]) => ({ t, p }));
        cache.set(key, { time: Date.now(), data });
        setResult({ key, status: "ready", data, error: "" });
      })
      .catch((err) => {
        if (err.name === "AbortError") return; // we cancelled it ourselves
        const message =
          err instanceof TypeError ? "Network error. Check your connection." : err.message;
        setResult({ key, status: "error", data: [], error: message });
      });

    return () => controller.abort();
  }, [key, coinId, currency, days, attempt]);

  const retry = () => {
    setResult({ key: null, status: "idle", data: [], error: "" });
    setAttempt((n) => n + 1);
  };

  if (!key) return { status: "idle", data: [], error: "", retry };
  // The stored result belongs to a different coin/range: we're still loading this one.
  if (result.key !== key) return { status: "loading", data: [], error: "", retry };
  return { ...result, retry };
}