interface DispatcherOptions {}

interface JobOptions {
  participant: {
    count: number;
  };
  block: {
    interval: number;
    reward: number;
    rounds: number;
  };
  trade: {
    interval: number;
  };
  pool: {
    chunks: number;
    tax: number;
    computeShare: number;
  };
}

interface ParticipantOptions {
  id: number;
  chunkReward: number;
  balance?: number;
  wantedChunks?: number;
}
