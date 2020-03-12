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
