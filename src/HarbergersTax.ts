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
  ];

  for (let i = 0; i < participant.wantedChunks; i++) {
    if (i * purchasePrice < participant.funds) break;

    // profit for different number of chunks
    profits.push(
      profitBuying(
        participant.ownedChunks,
        i + 1,
        participant.price,
        purchasePrice,
        chunkReward,
        Pool.tax,
      ),
    );
  }

  // index corresponds to number of blocks to purchase
  return profits.indexOf(Math.max(...profits));
};