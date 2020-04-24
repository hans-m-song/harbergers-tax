import {randomFloat} from './utils';

export interface Parameters {
  PARTICIPANT: {COUNT: number};
  BLOCK: {INTERVAL: number; REWARD: number; ROUNDS: number};
  TRADE: {INTERVAL: number};
  POOL: {CHUNKS: number; TAX: number; COMPUTESHARE: number};
}

export const parameters = {
  PARTICIPANT: {
    COUNT: 50,
  },
  BLOCK: {
    INTERVAL: 1,
    REWARD: randomFloat(10.1, 10.5),
    ROUNDS: 100,
  },
  TRADE: {
    INTERVAL: 0.2,
  },
  POOL: {
    CHUNKS: 100,
    TAX: 0.02,
    COMPUTESHARE: randomFloat(0.25, 0.35),
  },
};
