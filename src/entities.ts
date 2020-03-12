import {random, randomFloat} from './utils';

export const BlockChain = {
  blockTime: 1, // block time (1 unit)
  reward: 3, // reward for mining a block
};

export const Pool = {
  computeShare: 0.3, // percentage of total compute power of pool (pool/global)
  chunks: 100, // number of chunks of compute power
  freeChunks: 100, // amount of unowned chunks
  tax: 0.02, // percentage tax on set price
  interval: 0.2, // trading interval
};

export interface Participant {
  id: number;
  funds: number;
  ownedChunks: number;
  wantedChunks: number;
  price: number;
  auction: {
    participate: (price: number) => number; // decide to participate in an auction depending on price
    bid: (price: number) => number; // decide to bid at an auction depending on price
    bidMax: () => number; // maximum bid before giving up based on current funds
  };
}

export class Participant implements Participant {
  constructor(id: number) {
    this.id = id;
    this.funds = random(1, 10);
    this.ownedChunks = 0;
    this.wantedChunks = random(1, 100);
    this.price = randomFloat(2, 4);
  }
  auction = {
    participate: (_price: number) => randomFloat(1, 4),
    bid: (_price: number) => randomFloat(2, 5),
    bidMax: () => randomFloat(1, 3),
  };
}

export const generateParticipants = (count: number): Participant[] => {
  const participants = [];
  while (participants.length < count)
    participants.push(new Participant(participants.length));
  return participants;
};
