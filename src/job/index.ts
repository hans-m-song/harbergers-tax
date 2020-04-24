import {EventIO} from '../io';
import {auction, chunkPayout, taxCollection} from './actions';
import {Participant, PoolParticipant} from './participant';

export class Job {
  private io: IO;
  private id: string;
  private options: JobOptions;
  private metrics: Metrics;
  private pool: PoolParticipant;
  private participants: Participant[];
  private blockInterval?: NodeJS.Timeout;
  private tradeInterval?: NodeJS.Timeout;

  constructor(id: string, options: JobOptions) {
    this.io = new EventIO(id);
    this.id = id;
    this.options = options;
    this.metrics = {
      tradeRoundTime: 0,
      tradeRoundCount: 0,
      tradeCount: 0,
      rewardCount: 0,
      averageTradeTime: 0,
    };
    this.pool = new PoolParticipant(options);
    this.participants = [];
    while (this.participants.length < this.options.participant.count) {
      this.participants.push(
        new Participant({id: this.participants.length + 1}),
      );
    }
  }

  async execute() {
    const tradeIntervalFn = async () => {
      const start = Date.now();

      this.participants.forEach(taxCollection);

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
      chunkPayout(this.participants, this.options.block.reward);
    }, this.options.block.interval * 1000);

    tradeIntervalFn();

    setTimeout(this.stop, this.options.block.rounds * 1000);
  }

  async stop() {
    clearInterval(this.blockInterval!);
    clearTimeout(this.tradeInterval!);

    this.metrics.averageTradeTime =
      this.metrics.tradeRoundTime / this.metrics.tradeRoundCount;
    this.io.log({metrics: this.metrics, participants: this.participants});
    await this.io.close();
    console.log(this.metrics);
  }
}
