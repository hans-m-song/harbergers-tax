import {profit} from './formulae';
import {generateParticipants, Pool, chunkReward} from './entities';

const participants = generateParticipants(3);

const {funds, ownedChunks, wantedChunks, price: ownPrice} = participants[0];
const purchasePrice = participants[1].price;
const tax = Pool.tax;

let currentProfit;
let reward = chunkReward;
do {
  reward += 50;
  currentProfit = profit(
    funds,
    ownedChunks + 1,
    wantedChunks,
    ownPrice,
    reward,
    tax,
    purchasePrice,
  );
  console.log(reward, currentProfit);
} while (currentProfit <= 0);
