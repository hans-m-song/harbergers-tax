import Chart from 'chart.js';
import {updateJob, newJob} from './request';
import {createCharts, updateCharts} from './charts';
import {v4 as uuid} from 'uuid';

interface RunnerOptions {
  interval?: number; // when to update
  duration?: number; // when to die?
}

class Runner {
  private interval: number;
  private intervalId?: NodeJS.Timeout;
  private charts?: {[name: string]: Chart};

  constructor(options: RunnerOptions) {
    const {interval} = {
      interval: 1000,
      ...options,
    };

    this.interval = interval;
  }

  async initialize() {
    const id = await this.newJob(undefined, {
      participant: {
        count: 10,
      },
      block: {
        interval: 1,
        reward: 1,
        rounds: 10,
      },
      trade: {
        interval: 0.2,
      },
      pool: {
        chunks: 3,
        tax: 0.05,
        computeShare: 0.3,
      },
    });
    if (id) {
      this.update(id);
    }
    return this;
  }

  async update(id: string) {
    console.log('update', id);
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.update(id), this.interval);
    }

    const response = await updateJob({id});
    if (response) {
      if (response.result) {
        if (!this.charts) {
          console.log('creating charts');
          this.charts = createCharts(response.result);
        } else {
          updateCharts(this.charts, response.result);
        }
      } else if (response.metrics) {
        console.log(`job is complete: "${id}"`, response.metrics);
        this.stop();
      }
    }

    return this;
  }

  async stop() {
    clearInterval(this.intervalId!);
    this.intervalId = undefined;
    return this;
  }

  async newJob(id?: string, options?: JobOptions) {
    const response = await newJob(id || uuid(), options);
    if (response) {
      console.log(`new job received: "${response.id}"`, response.jobOptions);
      return response.id;
    }

    return null;
  }
}

(() => {
  const runner = new Runner({interval: 2000});
  (window as any).runner = runner;
  runner.initialize();
})();
