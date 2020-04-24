import Chart from 'chart.js';
import {update} from './request';
import {createCharts, updateCharts} from './charts';

interface RunnerOptions {
  interval?: number; // when to update
  duration?: number; // when to die?
}

class Runner {
  private interval: number;
  private intervalId?: NodeJS.Timeout;
  private charts: {[name: string]: Chart};

  constructor(options: RunnerOptions) {
    const {interval} = {
      interval: 1000,
      ...options,
    };

    this.interval = interval;
    this.charts = {};
  }

  async initialize() {
    const {analysis} = await update({all: true});
    this.charts = createCharts(analysis);
    this.intervalId = setInterval(() => this.update(), this.interval);
    return this;
  }

  async update() {
    const {analysis, metrics} = await update({all: true});
    updateCharts(this.charts, analysis);
    return this;
  }

  async stop() {
    clearInterval(this.intervalId!);
    return this;
  }

  newJob(options: JobOptions) {
    return this;
  }
}

() => {
  const runner = new Runner({interval: 1000});
  console.log('runner', runner);
  runner.initialize();
};
