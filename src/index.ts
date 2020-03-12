import {generateParticipants} from './entities';
import {actions} from './HarbergersTax';
import * as params from './parameters';

const participants = generateParticipants(params.PARTICIPANT_COUNT);

const blockInterval = setInterval(() => {}, params.BLOCK_INTERVAL);

const tradeInterval = setInterval(() => {
  const {taxCollection, auction, chunkPayout} = actions(participants);
  // TODO figure out the order
  participants.forEach(taxCollection);
  participants.forEach(auction);
  participants.forEach(chunkPayout);
}, params.TRADE_INTERVAL);

const clear = () => {
  clearInterval(tradeInterval);
  clearInterval(blockInterval);
};

clear();