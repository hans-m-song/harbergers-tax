import {random, randomFloat} from './utils';

export const BlockChain = {
  blockTime: 1, // block time
  interval: 0.2, // interval duration
  reward: 3, // reward for mining a block
};

export const Company = {
  computeShare: 0.3, // total compute power of company (company/global)
  chunks: 100, // number of chunks of compute power
  freeChunks: 100, // amount of unowned chunks
  tax: 0.02, // tax on set price
};

export type Participant = {
  id: number;
  funds: number;
  ownedChunks: number;
  wantedChunks: number;
  price: number;
  auction: {
    participate: (price: number) => number; // decide of participating in an auction depending on price
    bid: (price: number) => number; // decide to bid at an auction depending on price
    bidMax: () => number; // maximum bid before giving up based on current funds
  };
};

export const Participants = {
  count: 100, // number of participants
  new: (id: number): Participant => ({
    // new participant
    id,
    funds: random(1, 10),
    ownedChunks: 0,
    wantedChunks: random(1, 100),
    price: randomFloat(2, 4),
    auction: {
      participate: () => randomFloat(1, 4),
      bid: () => randomFloat(2, 5),
      bidMax: () => randomFloat(1, 3),
    },
  }),
  newParticipantList: (): Participant[] => {
    const participants = [];
    while (participants.length < Participants.count) {
      participants.push(Participants.new(participants.length));
    }
    return participants;
  },
};
