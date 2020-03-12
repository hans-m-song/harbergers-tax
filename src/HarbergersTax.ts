import {BlockChain, Pool, Participant} from './entities';
import {profitBuying, profitHeld} from './formulae';

const chunkReward = (BlockChain.reward * Pool.computeShare) / Pool.chunks;

const decision = (participant: Participant, purchasePrice: number) => {
  const profits = [
    profitHeld(
      participant.ownedChunks,
      participant.price,
      chunkReward,
      Pool.tax,
    ),
    profitBuying(
      participant.ownedChunks,
      participant.wantedChunks, // TODO use 1 < x < wantedChunks, x * price < funds
      participant.price,
      purchasePrice,
      chunkReward,
      Pool.tax,
    ),
  ];
  // return 0 < number of chunks to buy < wantedChunks
  return profits.indexOf(Math.max(...profits));
};

const transact = (buyer: Participant, owner: Participant, amount = 1) => {
  buyer.funds -= owner.price * amount;
  buyer.ownedChunks += amount;
  buyer.wantedChunks -= amount;

  owner.funds += owner.price;
  owner.ownedChunks -= amount;
  owner.wantedChunks += amount;
};

export const actions = (participants: Participant[]) => ({
  taxCollection: (taxee: Participant) => {
    const taxAmount = taxee.price * Pool.tax;
    // taxee loses their blocks if they can't afford the tax
    while (taxee.funds < taxAmount * taxee.ownedChunks) {
      taxee.ownedChunks -= 1;
      Pool.freeChunks += 1;
    }
    taxee.funds -= taxAmount * taxee.ownedChunks;
  },
  
  auction: (seller: Participant) => {
    // random set of participants who can afford to purchase
    const auctionParticipants = participants.filter(
      (participant) =>
        participant.funds >= seller.price &&
        Math.random() > participant.auction.participate(seller.price),
    );
  
    let lastBidder;
    let price = seller.price;
    while (true) {
      // const bidder = random bidder
      // increase price
      // lastBidder = bidder;
    }
  },
  
  // simulated chunk payout
  chunkPayout: (receiver: Participant) =>
    (receiver.funds += receiver.ownedChunks * chunkReward),
});
