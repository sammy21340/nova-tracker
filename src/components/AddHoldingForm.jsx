import { useState } from "react";
import CoinSearch from "./CoinSearch";

function AddHoldingForm({ onAdd }) {
  const [coin, setCoin] = useState(null); // { coinId, symbol, name } once picked
  const [quantity, setQuantity] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!coin) {
      setError("Search for a coin and pick one first.");
      return;
    }

    const numericQuantity = Number(quantity);

    if (!quantity || numericQuantity <= 0) {
      setError("Enter a quantity greater than 0.");
      return;
    }

    onAdd({
      coinId: coin.coinId,
      symbol: coin.symbol,
      name: coin.name,
      quantity: numericQuantity,
      costBasis: costBasis ? Number(costBasis) : null,
    });

    setCoin(null);
    setQuantity("");
    setCostBasis("");
    setError("");
  }

  return (
    <form className="add-holding-form" onSubmit={handleSubmit}>
      <h3>Add a holding</h3>

      <div className="form-row">
        <label>Coin</label>
        {coin ? (
          <div className="selected-coin">
            <span>
              {coin.name} <span className="selected-coin-symbol">{coin.symbol}</span>
            </span>
            <button
              type="button"
              className="link-button"
              onClick={() => setCoin(null)}
            >
              Change
            </button>
          </div>
        ) : (
          <CoinSearch
            onSelect={(picked) => {
              setCoin(picked);
              setError("");
            }}
          />
        )}
      </div>

      <div className="form-row">
        <label>Quantity</label>
        <input
          type="number"
          step="any"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="form-row">
        <label>Cost per coin (optional)</label>
        <input
          type="number"
          step="any"
          min="0"
          value={costBasis}
          onChange={(e) => setCostBasis(e.target.value)}
          placeholder="What you paid, in USD"
        />
      </div>

      {error && <small className="error">{error}</small>}

      <button type="submit" className="add-holding-submit">
        Add Holding
      </button>
    </form>
  );
}

export default AddHoldingForm;