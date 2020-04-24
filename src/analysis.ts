import {Participant} from './job/participant';

export class Analysis {
  participants: Participant[];
  analysis: AnalysisResult;

  constructor(participants: Participant[]) {
    this.participants = participants;
    this.analysis = this.analyse(participants);
  }

  private analyse(participants: Participant[]) {
    const {balances, blockPurchases, rewards} = participants.reduce(
      (analysis, participant, i) => {
        const {balances, blockPurchases, rewards} = analysis;
        const balanceHistory: Point[] = [];
        const offset = participant.history[0].timestamp;
        participant.history.forEach((transaction) => {
          const {timestamp, balance, description} = transaction;
          if (transaction.description === TransactionType.None) {
            return;
          }

          switch (description) {
            case TransactionType.None:
              break;
            case TransactionType.Purchase:
              blockPurchases.push(timestamp);
              break;
            case TransactionType.Reward:
              rewards.push(timestamp);
              break;
          }

          balanceHistory.push({x: timestamp - offset, y: balance});
        });

        balances.push({
          data: balanceHistory,
          label: i > 0 ? `${participant.id}` : 'pool',
        });

        return analysis;
      },
      {
        balances: [] as AnalysisDataSet[],
        blockPurchases: [] as number[],
        rewards: [] as number[],
      },
    );

    const binnedBlockPurchases = this.bin(blockPurchases);
    const binnedRewards = this.bin(rewards, 1000);

    return {
      balances: {datasets: balances},
      blockPurchases: {
        labels: binnedBlockPurchases.labels,
        datasets: [
          {
            label: 'block movement per trade interval',
            data: binnedBlockPurchases.data,
          },
        ],
      },
      rewards: {
        labels: binnedRewards.labels,
        datasets: [{label: 'rewards per block time', data: binnedRewards.data}],
      },
    } as AnalysisResult;
  }

  bin(data: number[], width = 200) {
    data.sort();
    const offset = data[0] - 1;
    const last = (array: any[]) => array[array.length - 1];

    const points = data.reduce((result, timestamp) => {
      const index = Math.floor((timestamp - offset) / width);
      while (result.length < index + 1) {
        result.push({x: result.length * width, y: 0});
      }
      result[index].y += 1;
      return result;
    }, [] as Point[]);
    return points.reduce(
      (result, point) => {
        result.labels.push(point.x);
        result.data.push(point.y);
        return result;
      },
      {labels: [] as number[], data: [] as number[]},
    );
  }

  result() {
    console.log(this.analysis.rewards.datasets[0].data.length);
    return this.analysis;
  }
}
