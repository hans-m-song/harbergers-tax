interface Transaction {
  balance: number;
  amount: number;
  description: TransactionType;
  ownedChunks: number;
  timestamp: number;
}

declare enum TransactionType {
  Purchase = 'Purchase',
  Sale = 'Sale',
  Reward = 'Reward',
  ChunkReward = 'ChunkReward',
  Tax = 'Tax',
  None = 'None',
}

interface Chunk {
  hashRate: number;
}