import {Participant} from './participant';

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  REWARD = 'REWARD',
}

export class StateTransaction {
  type: TransactionType;

  constructor(type: TransactionType) {
    this.type = type;
  }

  equals(other: StateTransaction): boolean {
    return this.type === other.type;
  }

  toString() {
    return `${this.type}`;
  }
}

export class PurchaseTransction extends StateTransaction {
  initiator: Participant;
  target: Participant;

  constructor(initiator: Participant, target: Participant) {
    super(TransactionType.PURCHASE);
    this.initiator = initiator;
    this.target = target;
  }

  equals(other: StateTransaction): boolean {
    return (
      super.equals(other) &&
      other instanceof PurchaseTransction &&
      this.initiator.equals(other.initiator) &&
      this.target.equals(other.target)
    );
  }

  semiEquals(other: StateTransaction): boolean {
    return (
      other instanceof PurchaseTransction &&
      this.initiator.semiEquals(other.initiator) &&
      this.target.semiEquals(other.target)
    );
  }

  toString() {
    return `P${this.initiator.id} PURCHASE P${this.target.id}`;
  }
}

export class RewardTransaction extends StateTransaction {
  constructor() {
    super(TransactionType.REWARD);
  }
}
