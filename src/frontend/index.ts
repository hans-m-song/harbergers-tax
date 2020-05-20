import Chart from 'chart.js';
import {updateJob, newJob} from './request';
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
    const response = await updateJob({id: 'test'});
    if (response) {
      this.charts = createCharts(response.result);
    }
    this.intervalId = setInterval(() => this.update(), this.interval);
    return this;
  }

  async update() {
    const response = await updateJob({id: 'test'});
    if (response) {
      if (!this.charts) {
        this.charts = createCharts(response.result);
      } else {
        updateCharts(this.charts, response.result);
      }
    }
    return this;
  }

  async stop() {
    clearInterval(this.intervalId!);
    return this;
  }

  async newJob(id: string, options?: JobOptions) {
    const response = await newJob(id, options);
    if (response) {
      console.log(`new job received: ${id}`);
    }
    return this;
  }
}

(() => {
  const runner = new Runner({interval: 2000});
  (window as any).runner = runner;
  runner.newJob('test').then(() => runner.initialize());
})();
