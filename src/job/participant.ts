import {random, randomFloat, round} from '../utils';

export class Participant {
  id: number;
  balance: number;
  chunks: number[];
  wantedChunks: number;
  price: number = 0;
  partipationChance: number;
  history: Transaction[];

  constructor({id}: ParticipantOptions) {
    this.id = id;
    this.chunks = [];
    this.balance = random(1, 10);
    this.wantedChunks = random(1, 100);
    this.updatePrice();
    this.partipationChance = randomFloat(0.1, 1);
    this.history = [
      {
        amount: this.balance,
        balance: 0,
        timestamp: Date.now(),
        description: TransactionType.None,
        ownedChunks: this.chunks.length,
      },
    ];
  }

  update(chunks: number, description: TransactionType, price: number) {
    const amount = (chunks || 1) * (price || this.price);

    this.balance = round(this.balance + amount);
    this.chunks += chunks;
    this.wantedChunks -= chunks;
    this.updatePrice();
    this.history.push({
      amount,
      timestamp: Date.now(),
      balance: this.balance,
      description,
      ownedChunks: this.chunks,
    });
  }

  purchase(price: number) {
    this.update(1, TransactionType.Purchase, -price);
  }

  sale(amount?: number) {
    this.update(-1, TransactionType.Sale, -(amount || this.price));
  }

  reward(amount: number) {
    this.update(0, TransactionType.ChunkReward, amount);
  }

  tax(amount: number) {
    this.update(0, TransactionType.Tax, -amount);
  }

  updatePrice() {
    this.price = round(
      chunkReward +
        randomFloat(
          chunkReward * -0.1,
          Math.min(chunkReward * 0.1, this.balance / (this.chunks || 1)),
        ),
    );
  }

  bid({price, sellerId, highestBidder, originalPrice}: Lot) {
    // decide to participate in an auction depending on price
    const participating =
      randomFloat(0, 1) < this.partipationChance && // arbritrary limiter on participation
      highestBidder !== this.id && // dont compete against yourself
      sellerId !== this.id && // dont buy your own chunk
      price < this.balance && // must be able to afford
      price - originalPrice < randomFloat(0.05 * price, 0.1 * price); // maxium amount before giving up (5% to 10% increase from original)
    // TODO incorporate profit consideration

    // amount to increase bid by 1% to 5%
    return participating
      ? round(
          price +
            randomFloat(0.01 * price, Math.min(0.05 * price, this.balance)),
        )
      : NaN;
  }
}

export class PoolParticipant extends Participant {
  constructor(options: JobOptions) {
    super({id: 0});
    this.balance = 0;
    this.price = ;
    this.partipationChance = 0;
  }

  tax(amount: number) {
    this.update(0, TransactionType.Tax, amount); // override tax to add instead of remove
  }

  reward(amount: number) {
    this.update(0, TransactionType.Reward, amount);
  }
}
