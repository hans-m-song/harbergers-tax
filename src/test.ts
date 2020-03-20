import {profit} from './formulae';
import {generateParticipants, Pool, chunkReward} from './entities';
import {taxCollection, auction, blockPayout} from './actions';

const participants = generateParticipants(3);

(async () => {
  participants[0].ownedChunks = 1;
  participants[2].ownedChunks = 2;
  console.log(participants);

  // blockPayout(participants);
  // participants.forEach(taxCollection);
  // await participants.reduce(async (prevAuction, participant) => {
  //   await prevAuction;
  //   return auction(participant, participants);
  // }, auction(participants[0], participants));

  // console.log(JSON.stringify(participants, null, 4));
})();
