interface IO {
  history: any[];
  close: () => Promise<void>;
  record: (...args: any[]) => void;
  log: (...args: any[]) => void;
}

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

interface Metrics {
  tradeRoundTime: number;
  tradeRoundCount: number;
  tradeCount: number;
  rewardCount: number;
  averageTradeTime: number;
}

interface Chunk {
  hashRate: number;
}