import {
  auction,
  chunkPayout,
  taxCollection,
  calculateChunkReward,
} from './actions';
import {Participant, PoolParticipant} from './participant';
import {FileIO} from '../IO';

export class Job {
  private io: IO;
  private id: string;
  private options: JobOptions;
  private metrics: Metrics;
  private pool: PoolParticipant;
  private participants: Participant[];
  private blockInterval?: NodeJS.Timeout;
  private tradeInterval?: NodeJS.Timeout;
  complete: boolean;
  analysed: boolean;

  constructor(id: string, io: IO, options: JobOptions) {
    this.io = io;
    this.id = id;
    this.options = options;
    this.complete = false;
    this.analysed = false;
    this.metrics = {
      tradeRoundTime: 0,
      tradeRoundCount: 0,
      tradeCount: 0,
      rewardCount: 0,
      averageTradeTime: 0,
    };
    this.pool = new PoolParticipant(options);
    this.participants = [this.pool];
    const chunkReward = calculateChunkReward(
      this.options.block.reward * this.options.pool.computeShare,
      this.options.pool.chunks,
    );
    while (this.participants.length < this.options.participant.count) {
      this.participants.push(
        new Participant({id: this.participants.length, chunkReward}),
      );
    }
  }

  getParticipants() {
    return this.participants;
  }

  getMetrics() {
    return this.metrics;
  }

  async execute() {
    const tradeIntervalFn = async () => {
      const start = Date.now();

      this.participants.forEach((participant) =>
        taxCollection(this.pool, participant, this.options.pool.tax),
      );

      await this.participants.reduce(
        async (previousAuction, participant, _i, participants) => {
          await previousAuction;
          return auction(participant, participants, this.metrics);
        },
        auction(this.participants[0], this.participants, this.metrics),
      );

      const end = Date.now();
      this.metrics.tradeRoundCount += 1;
      this.metrics.tradeRoundTime += end - start;
      this.tradeInterval = setTimeout(
        tradeIntervalFn,
        this.options.trade.interval * 1000,
      );
    };

    this.blockInterval = setInterval(() => {
      this.metrics.rewardCount += 1;
      chunkPayout(
        this.participants,
        this.options.pool.computeShare,
        this.options.block.reward,
        this.options.pool.chunks,
      );
    }, this.options.block.interval * 1000);

    tradeIntervalFn();

    setTimeout(() => this.stop(), this.options.block.rounds * 1000);
    return this;
  }

  setAnalysed() {
    this.analysed = true;
  }

  async stop() {
    clearInterval(this.blockInterval!);
    clearTimeout(this.tradeInterval!);

    this.metrics.averageTradeTime =
      this.metrics.tradeRoundTime / this.metrics.tradeRoundCount;
    this.io.log({metrics: this.metrics, participants: this.participants});
    await this.io.close();
    console.log(this.metrics);
    this.complete = true;
  }
}

if (require.main === module) {
  const jobOptions: JobOptions = {
    participant: {
      count: 20,
    },
    block: {
      interval: 1,
      reward: 1,
      rounds: 40,
    },
    trade: {
      interval: 0.2,
    },
    pool: {
      chunks: 3,
      tax: 0.05,
      computeShare: 0.3,
    },
  };
  const job = new Job('job', new FileIO('log.json', true), jobOptions);
  job.execute();
}
