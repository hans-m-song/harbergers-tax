import {EventEmitter} from 'events';
import {random, randomFloat} from './utils';
import {profit} from './formulae';

export const BlockChain = {
  blockTime: 1, // block time (1 unit)
  reward: randomFloat(10.1, 10.5), // reward for mining a block
};

export const Pool = {
  computeShare: randomFloat(0.25, 0.35), // percentage of total compute power of pool (pool/global)
  chunks: 100, // number of chunks of compute power
  freeChunks: 100, // amount of unowned chunks
  tax: 0.02, // percentage tax on set price
  interval: 0.2, // trading interval
};

export const chunkReward =
  (BlockChain.reward * Pool.computeShare) / Pool.chunks;

console.log({BlockChain, Pool, chunkReward})

export class Participant {
  id: number;
  funds: number;
  ownedChunks: number;
  wantedChunks: number;
  price: number = 0;

  constructor(id: number) {
    this.id = id;
    this.funds = random(1, 10);
    this.ownedChunks = 0;
    this.wantedChunks = random(1, 100);
    this.updatePrice();
  }

  updatePrice() {
    this.price = randomFloat(
      0.1,
      Math.min(0.5, this.funds / (this.ownedChunks || 1)),
    );
  }

  auction = {
    participate: ({price, currentBidder, originalPrice}: Lot) =>
      // decide to participate in an auction depending on price
      currentBidder !== this.id && // dont compete against yourself
      price < this.funds && // must be able to afford
      price - originalPrice < randomFloat(0.1, 0.5) && // maxium amount before giving up
      profit(
        this.funds,
        this.ownedChunks,
        this.wantedChunks,
        this.price,
        chunkReward,
        Pool.tax,
        price,
      ) > 0, // potential profit from buying a chunk

    bid: () => Math.min(randomFloat(0.1, 0.5), this.funds - 0.1), // decide to bid at an auction depending on price, can't bid more than own funds
  };
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
  currentBidder?: number; // id of current highest bidder, eventually the buyer
  originalPrice: number; // original price at the beginning of the auction
}

export class Orchestrator extends EventEmitter {
  async auction(lot: Lot, bidders: Bidder[]): Promise<Bid | null> {
    console.log('auction', lot);
    const bidPromises: Promise<Bid>[] = [];

    // subscribe to valid bidders
    bidders.forEach((bidder) => {
      if (bidder.participant.funds >= lot.price) {
        bidPromises.push(
          new Promise((resolve) =>
            bidder.once('bid', (bid: Bid) => resolve(bid)),
          ),
        );
        bidder.subscribe(this);
      }
    });

    // emit bid event
    this.emit('bid', lot);

    // collect bids
    const bids = (await Promise.all(bidPromises)).filter(
      (bid) => !isNaN(bid.amount), // some bidders wont bid
    );
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
          {...lot, price: highestBid.amount, currentBidder: highestBid.id},
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
      amount: this.participant.auction.participate(lot)
        ? lot.price + this.participant.auction.bid()
        : NaN,
    });
  }

  subscribe(orchestrator: Orchestrator) {
    this.orchestrator = orchestrator;
    this.orchestrator.once('bid', this.bid.bind(this));
  }
}
