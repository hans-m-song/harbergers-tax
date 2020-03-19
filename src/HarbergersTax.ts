import {BlockChain, Pool, Participant, generateParticipants} from './entities';
import {auction, chunkPayout, taxCollection} from './actions';
import * as params from './parameters';

const participants = generateParticipants(params.PARTICIPANT_COUNT);

const blockInterval = setInterval(() => {}, params.BLOCK_INTERVAL * 1000);

const tradeInterval = setInterval(() => {
  participants.forEach(taxCollection);
  participants.forEach((participant) => auction(participant, participants));
}, params.TRADE_INTERVAL * 1000);

setTimeout(() => {
  clearInterval(blockInterval);
  clearInterval(tradeInterval);
}, params.BLOCK_ROUNDS * 1000);
