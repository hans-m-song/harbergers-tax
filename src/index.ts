import {generateParticipants} from './entities';
import {auction, taxCollection, blockPayout} from './actions';
import * as params from './parameters';

const participants = generateParticipants(params.PARTICIPANT_COUNT);

const blockInterval = setInterval(() => {
  blockPayout(participants);
}, params.BLOCK_INTERVAL * 1000);

const tradeInterval = setInterval(() => {
  participants.forEach(taxCollection);
  participants.forEach((participant) => auction(participant, participants));
}, params.TRADE_INTERVAL * 1000);

setTimeout(() => {
  clearInterval(blockInterval);
  clearInterval(tradeInterval);
}, params.BLOCK_ROUNDS * 1000);
