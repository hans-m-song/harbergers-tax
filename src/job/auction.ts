import {EventEmitter} from 'events';
import {Participant} from './participant';

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
        // ignore ties since next round will give another chance
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
