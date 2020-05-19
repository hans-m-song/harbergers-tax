import {
  StateTransaction,
  PurchaseTransction,
  TransactionType,
  RewardTransaction,
} from './stateTransaction';
import {purchase, reward} from './actions';
import {Participant, ParticipantMap} from './participant';

const MAX_DEPTH = 9;
const DEBUG = false;

const deepCopyParticipants = (participants: ParticipantMap): ParticipantMap => {
  const result: ParticipantMap = {};
  Object.values(participants).forEach((participant) => {
    const {id, funds, chunks} = participant;
    result[id] = new Participant(id, funds, chunks);
  });
  return result;
};

const generateActionCombinations = (
  transactions: StateTransaction[],
): StateTransaction[][] => {
  const result: StateTransaction[][] = [];
  for (let i = 0; i < transactions.length - 1; i++) {
    const left = transactions[i];
    if (left instanceof PurchaseTransction && left.initiator.id === 0) continue;
    for (let j = i + 1; j < transactions.length; j++) {
      const right = transactions[j];
      if (
        left.equals(right) ||
        (right instanceof PurchaseTransction && right.initiator.id === 0) ||
        (left instanceof PurchaseTransction &&
          right instanceof PurchaseTransction &&
          left.initiator.equals(right.initiator))
      ) {
        continue;
      }
      result.push([left, right]);
    }

    result.push([left]);
  }
  result.push([transactions[transactions.length - 1]]);
  return result;
};

export interface State {
  parentId: string;
  depth: number;
  id: number;
  stateTransactions: StateTransaction[];
  participants: ParticipantMap;
  states: Map<StateTransaction[], string>;
  stateRegistry: {[stateId: string]: State};
  duplicateStateId?: string | null;
}

export class State {
  constructor(
    parentId: string,
    depth: number,
    id: number,
    stateTransactions: StateTransaction[],
    participants: ParticipantMap,
    stateRegistry: {[stateId: string]: State},
  ) {
    this.parentId = parentId;
    this.depth = depth;
    this.id = id;
    this.stateTransactions = stateTransactions;
    this.participants = participants;
    this.states = new Map();
    this.stateRegistry = stateRegistry;
    if (DEBUG) {
      console.log(
        'NEW',
        '\t\t\t',
        'id',
        this.getId(),
        'parent',
        parentId === '' ? 'parent' : parentId,
        'depth',
        depth,
        'id',
        id,
      );
    }
  }

  applyStateTransactions() {
    if (
      this.stateTransactions.length === 1 &&
      this.stateTransactions[0].type === TransactionType.REWARD
    ) {
      if (DEBUG) {
        console.log('APPLY', '\t\t', 'rewards');
      }
      Object.values(this.participants).forEach((participant) =>
        reward(participant),
      );
    } else {
      if (DEBUG) {
        console.log('APPLY', '\t\t', 'purchases', this.stringifyActions());
      }
      this.stateTransactions.forEach((transaction) => {
        const {initiator, target} = transaction as PurchaseTransction;
        purchase(this.participants[initiator.id], this.participants[target.id]);
      });
    }
    return this;
  }

  generateStates() {
    if (DEBUG) {
      console.log('GENERATE', '\t', this.getId(), this.duplicateStateId || '');
    }
    if (this.depth > MAX_DEPTH - 2) {
      if (DEBUG) console.log(`max depth ${MAX_DEPTH} reached`);
      return this;
    }

    if (
      this.duplicateStateId ||
      !this.getId().endsWith('r') ||
      this.parentId === ''
    ) {
      if (
        this.parentId !== '' &&
        this.stateRegistry[this.parentId].states.has([new RewardTransaction()])
      ) {
        return this;
      }
      if (DEBUG) {
        console.log('SUBSTATES', '', 'reward node');
      }
      const actions: StateTransaction[] = [new RewardTransaction()];
      const state = new State(
        this.duplicateStateId || this.getId(),
        this.depth + (this.duplicateStateId ? 0 : 1),
        -1,
        actions,
        deepCopyParticipants(this.participants),
        this.stateRegistry,
      ).applyStateTransactions();
      this.states.set(actions, state.getId());
      this.stateRegistry[state.getId()] = state;
      return this;
    }

    if (DEBUG) {
      console.log('SUBSTATES', '', 'subnodes');
    }
    const actions = Object.values(this.participants).reduce(
      (states, initiator) => {
        if (initiator.funds > 0) {
          Object.values(this.participants).forEach((target) => {
            if (target.id !== initiator.id && target.chunks > 0) {
              states.push(new PurchaseTransction(initiator, target));
            }
          });
        }
        return states;
      },
      [] as PurchaseTransction[],
    );
    const combinations = generateActionCombinations(actions);
    combinations.forEach((combination, i) => {
      const state = new State(
        this.getId(),
        this.depth + 1,
        i,
        combination,
        deepCopyParticipants(this.participants),
        this.stateRegistry,
      ).applyStateTransactions();
      const validState = Object.values(state.participants).reduce(
        (valid, participant) =>
          valid && participant.funds > -1 && participant.chunks > -1,
        true,
      );
      let notDuplicate = true;
      for (const stateId of this.states.values()) {
        const existingState = this.stateRegistry[stateId];
        notDuplicate = notDuplicate && !state.semiEquals(existingState);
        if (!notDuplicate) break;
      }
      if (validState && notDuplicate) {
        const existingStateId = Object.keys(
          this.stateRegistry,
        ).find((stateId) => this.stateRegistry[stateId].semiEquals(state, false));
        if (existingStateId) {
          state.setDuplicate(existingStateId);
        }
        this.states.set(combination, state.getId());
        this.stateRegistry[state.getId()] = state;
      }
    });
    return this;
  }

  visitStates() {
    if (DEBUG) {
      console.log('VISIT', '\t\t', this.getId(), this.duplicateStateId || '');
    }
    if (!this.duplicateStateId) {
      for (const stateId of this.states.values()) {
        this.stateRegistry[stateId].generateStates().visitStates();
      }
    }
  }

  getId() {
    return `${this.parentId === '' ? '' : `${this.parentId}_`}${
      this.id < 0 ? 'r' : this.id
    }`;
  }

  stringifyActions(transactions?: StateTransaction[]) {
    return (transactions || this.stateTransactions)
      .map((transaction) => transaction.toString())
      .join('<br>');
  }

  setDuplicate(stateId: string) {
    if (DEBUG) {
      console.log(
        'DUPLICATE',
        '',
        this.getId(),
        'set as duplicate of',
        stateId,
      );
    }
    this.duplicateStateId = stateId;
  }

  equals(other: State): boolean {
    return (
      (this.duplicateStateId || this.getId()) === other.getId() &&
      this.semiEquals(other)
    );
  }

  // TODO this only works on set number of participants
  semiEquals(other: State, allowCross = true): boolean {
    const [thisPool, thisFirst, thisSecond] = Object.values(this.participants);
    const [pool, first, second] = Object.values(other.participants);
    return (
      thisPool.semiEquals(pool) &&
      ((thisFirst.semiEquals(first) && thisSecond.semiEquals(second)) ||
        (allowCross &&
          thisFirst.semiEquals(second) &&
          thisSecond.semiEquals(first)))
    );
  }

  toJSON() {
    const states: {[actions: string]: Object} = {};
    for (const [actions, stateId] of this.states) {
      const state = this.stateRegistry[stateId];
      states[state.stringifyActions(actions)] = state.toJSON();
    }
    return {
      parentId: this.parentId,
      depth: this.depth,
      id: this.getId(),
      duplicateStateId: this.duplicateStateId || null,
      stateTransactions: this.stateTransactions,
      participants: this.participants,
      states,
    };
  }

  toString(): string {
    const declarations = [];

    if (!this.duplicateStateId) {
      declarations.push(
        `${this.getId()}[${DEBUG ? `${this.getId()}<br>` : ''}${Object.values(
          this.participants,
        )
          .map((participant) => participant.toString())
          .join('<br>')}]`,
      );
    }

    const relations = [];
    const subStates = [];
    for (const [actions, stateId] of this.states) {
      const state = this.stateRegistry[stateId];
      relations.push(
        `${this.duplicateStateId || this.getId()} --> |${this.stringifyActions(
          actions,
        )}| ${state.duplicateStateId || state.getId()}`,
      );
      subStates.push(state.toString());
    }

    if (relations.length > 0) {
      declarations.push(relations.join('\n'));
    }

    if (subStates.length > 0) {
      declarations.push(subStates.join('\n'));
    }

    return declarations.join('\n');
  }
}
