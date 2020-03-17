import {Participant, Pool} from './entities';

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

export const auction = (seller: Participant, participants: Participant[]) => {
  // random set of participants who can afford to purchase
  const auctionParticipants = participants.filter((participant) =>
    participant.auction.participate(seller.price),
  );

  // no participants
  if (participants.length < 1) return;

  auction(seller, auctionParticipants);

  let lastBidder;
  let price = seller.price;
  while (true) {
    // const bidder = random bidder
    // increase price
    // lastBidder = bidder;
  }
};

// simulated chunk payout
export const chunkPayout = (receiver: Participant, chunkReward: number) =>
  (receiver.funds += receiver.ownedChunks * chunkReward);
