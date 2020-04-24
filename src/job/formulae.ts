export const profitSelling = (ownedChunks: number, price: number) =>
  ownedChunks * price;

export const profitHeld = (
  ownedChunks: number,
  price: number,
  chunkReward: number,
  tax: number,
) => ownedChunks * chunkReward - ownedChunks * price * tax;
// + potential for selling?
// - cost of retention?

export const profitBuying = (
  ownedChunks: number,
  wantedChunks: number,
  ownPrice: number,
  purchasePrice: number,
  chunkReward: number,
  tax: number,
) =>
  (ownedChunks + wantedChunks) * chunkReward -
  (ownedChunks + wantedChunks) * ownPrice * tax -
  wantedChunks * purchasePrice;

export const profit = (
  funds: number,
  ownedChunks: number,
  wantedChunks: number,
  ownPrice: number,
  chunkReward: number,
  tax: number,
  purchasePrice: number,
) => {
  const profits = [profitHeld(ownedChunks, ownPrice, chunkReward, tax)];

  for (let i = 0; i < wantedChunks; i++) {
    if (i * purchasePrice < funds) break;

    // profit for different number of chunks
    profits.push(
      profitBuying(
        ownedChunks,
        i + 1,
        ownPrice,
        purchasePrice,
        chunkReward,
        tax,
      ),
    );
  }

  // index corresponds to number of blocks to purchase
  return profits.indexOf(Math.max(...profits));
};
