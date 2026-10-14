// Pure functions: no React, no browser APIs — numbers in, numbers out.
// That keeps the money math easy to read and easy to test.

const hasCost = (h) => h.costBasis !== null && h.costBasis !== undefined;

// Adds price, value, and profit/loss to each holding, all in the display currency.
export function enrichHoldings(holdings, prices, currency) {
  return holdings.map((h) => {
    const priceData = prices[h.coinId];
    const price = priceData?.[currency] ?? null;
    const change24h = priceData?.[`${currency}_24h_change`] ?? null;
    const value = price !== null ? price * h.quantity : null;

    // What you paid, expressed in the display currency
    let costTotal = null;
    if (hasCost(h)) {
      const paidIn = h.costCurrency ?? "usd";
      const paid = h.costBasis * h.quantity;

      if (paidIn === currency) {
        costTotal = paid;
      } else {
        // Convert at today's rate, using this coin's own two prices as the exchange rate
        const priceInPaidCurrency = priceData?.[paidIn];
        costTotal =
          price !== null && priceInPaidCurrency
            ? paid * (price / priceInPaidCurrency)
            : null;
      }
    }

    const profitLoss = value !== null && costTotal !== null ? value - costTotal : null;
    const profitLossPct =
      profitLoss !== null && costTotal ? (profitLoss / costTotal) * 100 : null;

    return { ...h, price, change24h, value, costTotal, profitLoss, profitLossPct };
  });
}

// Portfolio-wide totals. Overall profit/loss only counts holdings that have a
// cost entered — comparing the value of ALL holdings to the cost of SOME would
// inflate the number.
export function summarize(enriched) {
  let totalValue = 0;
  let trackedValue = 0;
  let trackedCost = 0;
  let trackedCount = 0;

  for (const h of enriched) {
    if (h.value === null) continue;
    totalValue += h.value;

    if (h.costTotal !== null) {
      trackedValue += h.value;
      trackedCost += h.costTotal;
      trackedCount += 1;
    }
  }

  const totalProfitLoss = trackedCount > 0 ? trackedValue - trackedCost : null;
  const totalProfitLossPct =
    totalProfitLoss !== null && trackedCost > 0
      ? (totalProfitLoss / trackedCost) * 100
      : null;

  return { totalValue, totalProfitLoss, totalProfitLossPct };
}

// Each holding's share of the total. Holdings with no price count as 0%.
export function withAllocation(enriched, totalValue) {
  return enriched.map((h) => ({
    ...h,
    allocationPct: totalValue && h.value !== null ? (h.value / totalValue) * 100 : 0,
  }));
}