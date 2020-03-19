import {randomFloat} from './utils';
import {
  Participant,
  Pool,
  Bidder,
  Orchestrator,
  chunkReward,
  BlockChain,
} from './entities';

// move chunks from one participant to another
export const transact = (
  buyer: Participant,
  owner: Participant,
  amount = 1,
) => {
  // add chunk to buyer
  buyer.funds -= owner.price * amount;
  buyer.ownedChunks += amount;
  buyer.wantedChunks -= amount;
  buyer.updatePrice();

  // remove chunk from seller
  owner.funds += owner.price;
  owner.ownedChunks -= amount;
  owner.wantedChunks += amount;
};

export const taxCollection = (taxee: Participant) => {
  const taxAmount = taxee.price * Pool.tax;
  // taxee loses blocks until they can afford the tax
  while (taxee.funds < taxAmount * taxee.ownedChunks) {
    taxee.ownedChunks -= 1;
    Pool.freeChunks += 1;
  }

  // pay the tax
  taxee.funds -= taxAmount * taxee.ownedChunks;
};

export const auction = async (
  seller: Participant,
  participants: Participant[],
) => {
  const lot = {
    sellerId: seller.id,
    originalPrice: seller.price,
    price: seller.price,
  };

  if (seller.ownedChunks < 1) return;

  // random set of participants who can afford to purchase
  const bidders = participants.map((participant) => new Bidder(participant));

  const orchestrator = new Orchestrator();

  // find the winning bid
  const winningBid = await orchestrator.auction(lot, bidders);

  // make the sale
  if (winningBid) {
    transact(participants[winningBid.id], seller);
  }
};

// simulated chunk payout
export const chunkPayout = (receiver: Participant) =>
  (receiver.funds += receiver.ownedChunks * chunkReward);

// actual payout of block
export const blockPayout = (participants: Participant[]) => {
  // chance it was earned within the pool
  if (randomFloat(0, 1) < Pool.computeShare) {
  }
};
