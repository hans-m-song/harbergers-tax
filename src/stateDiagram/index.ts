import {Participant, ParticipantMap} from './participant';
import {State} from './state';

const roster = [
  [0, 2],
  [1, 0],
  [1, 0],
];
const participants: ParticipantMap = {};
roster.forEach((initialState, i) => {
  participants[i] = new Participant(i, initialState[0], initialState[1]);
});

const stateRegistry: {[stateId: string]: State} = {}

const initialState = new State('', 0, 0, [], participants, stateRegistry);

initialState.generateStates().visitStates();

// console.log((JSON.stringify(stateRegistry, null, 4)))
// console.log(JSON.stringify(initialState, null, 4));

console.log('```mermaid');
console.log('graph TD');
console.log(initialState.toString());
console.log('```');
