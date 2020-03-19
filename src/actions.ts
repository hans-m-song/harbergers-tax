import {Participant, Pool, Bidder, Orchestrator} from './entities';

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

export const auction = async (
  seller: Participant,
  participants: Participant[],
) => {
  // random set of participants who can afford to purchase
  const bidders = participants
    .filter(
      (participant) =>
        participant.id !== seller.id &&
        participant.auction.participate(seller.price),
    )
    .map((participant) => new Bidder(participant));

  const orchestrator = new Orchestrator();

  // find the winning bid
  const winningBid = await orchestrator.auction(
    {sellerId: seller.id, price: seller.price},
    bidders,
  );

  // make the sale
  if (winningBid) {
    transact(participants[winningBid.id], seller);
  }
};

// simulated chunk payout
export const chunkPayout = (receiver: Participant, chunkReward: number) =>
  (receiver.funds += receiver.ownedChunks * chunkReward);

export const blockPayout = (...entities: Entity[]) => {

}