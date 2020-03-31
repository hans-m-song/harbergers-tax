import {EventEmitter} from 'events';
import * as params from './parameters';
import {random, randomFloat, round} from './utils';

export enum TransactionType {
  Purchase = 'Purchase',
  Sale = 'Sale',
  Reward = 'Reward',
  Tax = 'Tax',
  None = 'None',
}

export type Metrics = {
  tradeRoundTime: number;
  tradeRoundCount: number;
  tradeCount: number;
  rewardCount: number;
  averageTradeTime: number;
};

export interface Transaction {
  balance: number;
  amount: number;
  description: TransactionType;
  ownedChunks: number;
  timestamp: number,
}

export class Participant {
  id: number;
  balance: number;
  ownedChunks: number;
  wantedChunks: number;
  price: number = 0;
  partipationChance: number;
  history: Transaction[];

  constructor(id: number, ownedChunks = 0) {
    this.id = id;
    this.ownedChunks = ownedChunks;
    this.balance = random(1, 10);
    this.wantedChunks = random(1, 100);
    this.updatePrice();
    this.partipationChance = randomFloat(0.1, 1);
    this.history = [
      {
        amount: this.balance,
        balance: 0,
        timestamp: Date.now(),
        description: TransactionType.None,
        ownedChunks,
      },
    ];
  }

  update(chunks: number, description: TransactionType, price: number) {
    const amount = (chunks || 1) * (price || this.price);

    this.balance = round(this.balance + amount);
    this.ownedChunks += chunks;
    this.wantedChunks -= chunks;
    this.updatePrice();
    this.history.push({
      amount,
      timestamp: Date.now(),
      balance: this.balance,
      description,
      ownedChunks: this.ownedChunks,
    });
  }

  purchase(price: number) {
    this.update(1, TransactionType.Purchase, -price);
  }

  sale(amount?: number) {
    this.update(-1, TransactionType.Sale, -(amount || this.price));
  }

  reward(amount: number) {
    this.update(0, TransactionType.Reward, amount);
  }

  tax(amount: number) {
    this.update(0, TransactionType.Tax, -amount);
  }

  updatePrice() {
    this.price = round(
      chunkReward +
      randomFloat(
        chunkReward * -0.1,
        Math.min(chunkReward * 0.1, this.balance / (this.ownedChunks || 1)),
      ),
    );
  }

  bid({price, sellerId, highestBidder, originalPrice}: Lot) {
    // decide to participate in an auction depending on price
    const participating =
      randomFloat(0, 1) < this.partipationChance && // arbritrary limiter on participation
      highestBidder !== this.id && // dont compete against yourself
      sellerId !== this.id && // dont buy your own chunk
      price < this.balance && // must be able to afford
      price - originalPrice < randomFloat(0.05 * price, 0.1 * price); // maxium amount before giving up (5% to 10% increase from original)
    // TODO incorporate profit consideration

    // amount to increase bid by 1% to 5%
    return participating
      ? round(
          price +
            randomFloat(0.01 * price, Math.min(0.05 * price, this.balance)),
        )
      : NaN;
  }
}

class PoolParticipant extends Participant {
  constructor(chunks: number) {
    super(0, chunks);
    this.balance = 0;
    this.price = chunkReward;
    this.partipationChance = 0;
  }

  tax(amount: number) {
    this.update(0, TransactionType.Tax, amount); // override tax to add instead of remove
  }
}

export const chunkReward = round(
  (params.BLOCK.REWARD * params.POOL.COMPUTESHARE) / params.POOL.CHUNKS,
);

export const BlockChain = {
  blockTime: params.BLOCK.INTERVAL, // block time (1 unit)
  reward: params.BLOCK.REWARD, // reward for mining a block
};

export const Pool = {
  computeShare: params.POOL.COMPUTESHARE, //randomFloat(0.25, 0.35), // percentage of total compute power of pool (pool/global)
  chunks: params.POOL.CHUNKS, // number of chunks of compute power
  tax: params.POOL.TAX, // percentage tax on set price
  interval: params.TRADE.INTERVAL, // trading interval
  participant: new PoolParticipant(params.POOL.CHUNKS),
};

console.log({BlockChain, Pool, chunkReward});

export const generateParticipants = (count: number): Participant[] => {
  const participants = [];
  while (participants.length < count)
    participants.push(new Participant(participants.length + 1));
  return participants;
};

interface Bid {
  id: number; // id of bidder
  amount: number; // how much they're bidding
}

interface Lot {
  price: number; // current price of item
  sellerId: number; // id of seller
  highestBidder?: number; // id of current highest bidder, eventually the buyer
  originalPrice: number; // original price at the beginning of the auction
}

export class Orchestrator extends EventEmitter {
  async auction(lot: Lot, bidders: Bidder[]): Promise<Bid | null> {
    const bidPromises: Promise<Bid>[] = [];

    this.setMaxListeners(bidders.length);
    // subscribe to valid bidders
    bidders.forEach((bidder) => {
      bidPromises.push(
        new Promise((resolve) =>
          bidder.once('bid', (bid: Bid) => resolve(bid)),
        ),
      );
      bidder.subscribe(this);
    });

    // emit bid event
    this.emit('bid', lot);

    // collect bids
    const bids = (await Promise.all(bidPromises)).filter(
      (bid) => !isNaN(bid.amount), // some bidders wont bid
    ); // TODO check if bids are valid e.g. if bidders can afford their bids

    switch (bids.length) {
      case 0:
        console.log(`no buyer found`);
        return null; // no buyer found

      case 1:
        console.log(`winning bid ${bids[0].id} at ${bids[0].amount}`);
        return bids[0]; // winning bid

      default: {
        // TODO tiebreaker? i.e. currentBid.amount === highestBid.amount -> next round will tiebreak
        const highestBid = bids.reduce(
          (highestBid, currentBid) =>
            currentBid.amount > highestBid.amount ? currentBid : highestBid,
          bids[0],
        );
        return this.auction(
          {...lot, price: highestBid.amount, highestBidder: highestBid.id},
          bidders,
        );
      }
    }
  }
}

export class Bidder extends EventEmitter {
  private orchestrator?: Orchestrator;
  participant: Participant;

  constructor(participant: Participant) {
    super();
    this.participant = participant;
  }

  private bid(lot: Lot) {
    this.emit('bid', {
      id: this.participant.id,
      amount: this.participant.bid(lot),
    });
  }

  subscribe(orchestrator: Orchestrator) {
    this.orchestrator = orchestrator;
    this.orchestrator.once('bid', this.bid.bind(this));
  }
}
