import {Participant} from './participant';
import {PurchaseTransction} from './stateTransaction';

export const purchase = (initiator: Participant, target: Participant) => {
  initiator.funds -= 1;
  target.funds += 1;
  initiator.chunks += 1;
  target.chunks -= 1;
};

export const reward = (target: Participant) => {
  target.funds += target.chunks;
};

export const possibleActions = (
  self: Participant,
  participants: Participant[],
): PurchaseTransction[] => {
  if (self.id === 0 || self.funds === 0) {
    return [];
  }

  return participants.reduce((list, participant) => {
    if (participant.id !== self.id && participant.chunks > 0) {
      list.push(new PurchaseTransction(self, participant));
    }
    return list;
  }, [] as PurchaseTransction[]);
};
