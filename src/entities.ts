import {EventEmitter} from 'events';
import * as params from './parameters';
import {random, randomFloat, round} from './utils';

export const BlockChain = {
  blockTime: params.BLOCK_INTERVAL, // block time (1 unit)
  reward: randomFloat(10.1, 10.5), // reward for mining a block
};

export const Pool = {
  computeShare: randomFloat(0.25, 0.35), // percentage of total compute power of pool (pool/global)
  chunks: 100, // number of chunks of compute power
  freeChunks: 100, // amount of unowned chunks
  tax: 0.02, // percentage tax on set price
  interval: params.TRADE_INTERVAL, // trading interval
};

export const chunkReward = round(
  (BlockChain.reward * Pool.computeShare) / Pool.chunks,
);

console.log({BlockChain, Pool, chunkReward});

export enum TransactionType {
  Purchase = 'Purchase',
  Sale = 'Sale',
  Reward = 'Reward',
  Tax = 'Tax',
  None = 'None',
}

export interface Transaction {
  balance: number;
  amount: number;
  description: TransactionType;
}

export class Participant {
  id: number;
  balance: number;
  ownedChunks: number;
  wantedChunks: number;
  price: number = 0;
  partipationChance: number;
  history: Transaction[];

  constructor(id: number) {
    this.id = id;
    this.balance = random(1, 10);
    this.ownedChunks = 0;
    this.wantedChunks = random(1, 100);
    this.updatePrice();
    this.partipationChance = randomFloat(0.1, 1);
    this.history = [
      {amount: this.balance, balance: 0, description: TransactionType.None},
    ];
  }

  update(chunks: number, description: TransactionType, price: number) {
    const amount = (chunks || 1) * (price || this.price);

    this.balance += amount;
    this.ownedChunks += chunks;
    this.wantedChunks -= chunks;
    this.updatePrice();
    this.history.push({amount, balance: this.balance, description});
  }

  purchase(price: number, chunks = 1) {
    this.update(chunks, TransactionType.Purchase, -price);
  }

  sale(chunks = 1) {
    this.update(-chunks, TransactionType.Sale, -this.price);
  }

  reward(amount: number) {
    this.update(0, TransactionType.Reward, amount);
  }

  tax(amount: number) {
    console.log('taxing', amount);
    this.update(0, TransactionType.Tax, -amount);
  }

  updatePrice() {
    this.price = round(
      chunkReward +
        randomFloat(
          chunkReward * -0.5,
          Math.min(chunkReward * 0.5, this.balance / (this.ownedChunks || 1)),
        ),
    );
  }

  bid({price, sellerId, highestBidder, originalPrice}: Lot) {
    // decide to participate in an auction depending on price
    const participating =
      randomFloat(0, 1) > this.partipationChance && // arbritrary limiter on participation
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

export const generateParticipants = (count: number): Participant[] => {
  const participants = [];
  while (participants.length < count)
    participants.push(new Participant(participants.length));
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
    console.log('auction', lot);
    const bidPromises: Promise<Bid>[] = [];

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
    console.log('bids', bids);

    switch (bids.length) {
      case 0:
        console.log('no buyer found');
        return null; // no buyer found

      case 1:
        console.log('winning bid', bids[0]);
        return bids[0]; // winning bid

      default: {
        // TODO tiebreaker? i.e. currentBid.amount === highestBid.amount -> next round will tiebreak
        const highestBid = bids.reduce(
          (highestBid, currentBid) =>
            currentBid.amount > highestBid.amount ? currentBid : highestBid,
          bids[0],
        );
        console.log('many bids, highest bid', highestBid);
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
