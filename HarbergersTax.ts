import {BlockChain, Company, Participant, Participants} from './declarations';

const participants = Participants.newParticipantList();
const chunkReward = (BlockChain.reward * Company.computeShare) / Company.chunks;

const profitSelling = (ownedChunks: number, price: number) =>
  ownedChunks * price;

const profitHeld = (
  ownedChunks: number,
  price: number,
  chunkReward: number,
  tax: number,
) => ownedChunks * chunkReward - ownedChunks * price * tax;
// + potential for selling?
// - cost of retention?

const profitBuying = (
  ownedChunks: number,
  wantedChunks: number,
  ownPrice: number,
  purchasePrice: number,
  chunkReward: number,
  tax: number,
) =>
  (ownedChunks + wantedChunks) * chunkReward -
  (ownedChunks + wantedChunks) * ownPrice * tax -
  wantedChunks * purchasePrice;

const decision = (participant: Participant, purchasePrice: number) => {
  const profits = [
    profitHeld(
      participant.ownedChunks,
      participant.price,
      chunkReward,
      Company.tax,
    ),
    profitBuying(
      participant.ownedChunks,
      participant.wantedChunks, // TODO use 1 < x < wantedChunks, x * price < funds
      participant.price,
      purchasePrice,
      chunkReward,
      Company.tax,
    ),
  ];
  // return 0 < number of chunks to buy < wantedChunks
  return profits.indexOf(Math.max(...profits));
};

const transact = (buyer, owner, amount = 1) => {
  buyer.funds -= owner.price * amount;
  buyer.ownedChunks += amount;
  buyer.wantedChunks -= amount;

  owner.funds += owner.price;
  owner.ownedChunks -= amount;
  owner.wantedChunks += amount;
};

console.log(chunkReward, participants);

const taxCollection = (taxee: Participant) => {
  const taxAmount = taxee.price * Company.tax;
  // taxee loses their blocks if they can't afford the tax
  while (taxee.funds < taxAmount * taxee.ownedChunks) {
    taxee.ownedChunks -= 1;
    Company.freeChunks += 1;
  }
  taxee.funds -= taxAmount * taxee.ownedChunks;
};

const auction = (seller: Participant) => {
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
};

// simulated chunk payout
const chunkPayout = (receiver: Participant) =>
  (receiver.funds += receiver.ownedChunks * chunkReward);

// actual payout
// const payoutInterval = setInterval(() => {}, BlockChain.blockTime);

// TODO figure out the order
const transactInterval = setInterval(() => {
  participants.forEach(taxCollection);
  participants.forEach(auction);
  participants.forEach(chunkPayout);
}, BlockChain.interval);
clearInterval(transactInterval);
