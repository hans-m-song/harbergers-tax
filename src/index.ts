import {generateParticipants} from './entities';
import {auction, taxCollection, blockPayout} from './actions';
import * as params from './parameters';

const participants = generateParticipants(params.PARTICIPANT_COUNT);

const blockInterval = setInterval(() => {
  blockPayout(participants);
}, params.BLOCK_INTERVAL * 1000);

const tradeInterval = setInterval(async () => {
  participants.forEach(taxCollection);
  participants.reduce(async (prevAuction, participant) => {
    await prevAuction;
    return auction(participant, participants);
  }, auction(participants[0], participants));
}, params.TRADE_INTERVAL * 1000);

setTimeout(() => {
  clearInterval(blockInterval);
  clearInterval(tradeInterval);
}, params.BLOCK_ROUNDS * 1000);
