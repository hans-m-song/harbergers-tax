export interface Participant {
  id: number;
  funds: number;
  chunks: number;
}

export type ParticipantMap = {[id: number]: Participant};

export class Participant {
  constructor(id: number, funds: number, chunks: number) {
    this.id = id;
    this.funds = funds;
    this.chunks = chunks;
  }

  equals(other: Participant): boolean {
    return other.id === this.id && this.semiEquals(other);
  }

  semiEquals(other: Participant): boolean {
    return (
      this.funds === other.funds &&
      this.chunks === other.chunks
    );
  }

  toJSON() {
    return {
      id: this.id,
      funds: this.funds,
      chunks: this.chunks,
    };
  }

  toString() {
    return `P${this.id}: ${this.funds}, ${this.chunks}`;
  }
}

