interface IO {
  history: any[];
  close: () => Promise<void>;
  record: (...args: any[]) => void;
  log: (...args: any[]) => void;
}

interface Metrics {
  tradeRoundTime: number;
  tradeRoundCount: number;
  tradeCount: number;
  rewardCount: number;
  averageTradeTime: number;
}
