import {Participant, ParticipantMap} from './participant';
import {State} from './state';
import {io} from './io';

const roster = [
  [0, 2],
  [1, 0],
  [1, 0],
];
const participants: ParticipantMap = {};
roster.forEach((initialState, i) => {
  participants[i] = new Participant(i, initialState[0], initialState[1]);
});

const stateRegistry: {[stateId: string]: State} = {};

const root = new State('', 0, 0, [], participants, stateRegistry);

root.generateStates().visitStates();

io.output('```mermaid');
io.output('graph TD');
io.output(root.toString());
io.output('```');
