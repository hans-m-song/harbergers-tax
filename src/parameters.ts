import {randomFloat} from './utils';

export const PARTICIPANT = {
  COUNT: 100,
};

export const BLOCK = {
  INTERVAL: 1,
  REWARD: randomFloat(10.1, 10.5),
  ROUNDS: 5,
};

export const TRADE = {
  INTERVAL: 0.2,
};

export const POOL = {
  CHUNKS: 100,
  TAX: 0.02,
  COMPUTESHARE: randomFloat(0.25, 0.35),
};
