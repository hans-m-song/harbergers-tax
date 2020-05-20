import {randomFloat, round} from '../utils';
import {Participant} from './participant';
import {Orchestrator, Bidder} from './auction';

// move chunks from one participant to another
export const transact = (
  buyer: Participant,
  owner: Participant,
  bidAmount?: number,
  chunks = 1,
) => {
  const amount = bidAmount || owner.price;
  console.log(
    `participant ${buyer.id} paid ${
      bidAmount ? bidAmount : `${chunks} x ${owner.price}`
    } to ${owner.id}`,
  );

  // add chunk to buyer
  buyer.purchase(amount);

  // remove chunk from seller
  owner.sale(amount);
};

export const taxCollection = (
  pool: Participant,
  taxee: Participant,
  tax: number,
) => {
  if (taxee.chunks < 1 || taxee.id === pool.id) return;

  const taxAmount = taxee.price * tax;
  // taxee loses blocks until they can afford the tax
  while (taxee.balance < taxAmount * taxee.chunks) {
    taxee.chunks -= 1;
    pool.chunks += 1;
    taxee.calculatePrice();
  }

  // pay the tax
  const amount = round(taxAmount * taxee.chunks);
  taxee.tax(round(amount));
  pool.tax(amount);
};

export const auction = async (
  seller: Participant,
  participants: Participant[],
  metrics?: Metrics,
) => {
  const lot = {
    sellerId: seller.id,
    originalPrice: seller.price,
    price: seller.price,
  };

  if (seller.chunks < 1) return;

  console.log(`--- auction for ${lot.sellerId} at ${lot.price} ---`);

  // random set of participants who can afford to purchase
  const bidders = participants.map((participant) => new Bidder(participant));

  const orchestrator = new Orchestrator();

  // find the winning bid
  const winningBid = await orchestrator.auction(lot, bidders);

  // make the sale
  if (winningBid) {
    if (metrics) metrics.tradeCount += 1;
    transact(participants[winningBid.id], seller, winningBid.amount);
  }

  console.log(`--------------------------------`);
};

export const calculateChunkReward = (reward: number, totalChunks: number) =>
  round((reward * 0.995) / totalChunks); // pool takes 0.5%

// simulated chunk payout
export const chunkPayout = (
  participants: Participant[],
  computeShare: number,
  reward: number,
  chunks: number,
) => {
  const chunkReward = calculateChunkReward(reward, chunks);
  if (randomFloat(0, 1) < computeShare) {
    const [pool, ...receivers] = participants;

    const leftover = receivers.reduce((reward, receiver) => {
      const amount = receiver.chunks * chunkReward;
      receiver.reward(amount);
      return reward - amount;
    }, reward);

    pool.reward(leftover);
  }
};

// actual payout of block
export const blockPayout = (
  reward: number,
  totalChunks: number,
  computeShare: number,
  participants: Participant[],
  metrics?: Metrics,
) => {
  // chance it was earned within the pool
  if (randomFloat(0, 1) < computeShare) {
    const pick = randomFloat(0, 1);
    let sum = 0;
    for (const participant of participants) {
      sum += participant.chunks / totalChunks;
      if (pick < sum) {
        if (metrics) metrics.rewardCount += 1;
        console.log(`****** rewarded ${participant.id} ${reward} ******`);
        participant.reward(reward);
        break;
      }
    }
  }
};
