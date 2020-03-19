import {EventEmitter} from 'events';
import {random, randomFloat} from './utils';
import {profit} from './formulae';

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

export const chunkReward =
  (BlockChain.reward * Pool.computeShare) / Pool.chunks;

export interface Participant {
  id: number;
  funds: number;
  ownedChunks: number;
  wantedChunks: number;
  price: number;
  auction: {
    participate: (price: number) => boolean; // decide to participate in an auction depending on price
    bid: () => number; // decide to bid at an auction depending on price
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
    participate: (price: number) =>
      price < this.funds &&
      random(0, 10) > 5 &&
      profit(
        this.funds,
        this.ownedChunks,
        this.wantedChunks,
        this.price,
        chunkReward,
        Pool.tax,
        price,
      ) > 0,
    bid: () => randomFloat(2, 5),
    bidMax: () => randomFloat(1, 3),
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
  price: number; // price of item
  sellerId: number; // id of seller
  currentBidder?: number; // id of current highest bidder, eventually the buyer
}

export class Orchestrator extends EventEmitter {
  async auction(lot: Lot, bidders: Bidder[]): Promise<Bid | null> {
    console.log('auctioning: ', lot);
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
      (bid) => !isNaN(bid.amount),
    );

    switch (bids.length) {
      case 0:
        return null; // no buyer found

      case 1:
        console.log('winning bid', bids[0]);
        return bids[0]; // winning bid

      default: {
        // TODO tiebreaker?
        const highestBid = bids.reduce(
          (highestBid, currentBid) =>
            currentBid.amount > highestBid.amount ? currentBid : highestBid,
          bids[0],
        );
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
  private subscription?: ({
    price,
    sellerId,
  }: {
    price: number;
    sellerId: number;
  }) => void;
  participant: Participant;

  constructor(participant: Participant) {
    super();
    this.participant = participant;
  }

  private bid({price}: Lot) {
    this.emit('bid', {
      id: this.participant.id,
      amount: this.participant.auction.participate(price)
        ? price + this.participant.auction.bid()
        : NaN,
    });
  }

  subscribe(orchestrator: Orchestrator) {
    this.orchestrator = orchestrator;
    this.subscription = this.bid.bind(this);
    this.orchestrator.once('bid', this.subscription);
  }
}
