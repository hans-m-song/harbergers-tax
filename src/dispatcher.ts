import {v4 as uuid} from 'uuid';
import {Job} from './job';

export class Dispatcher {
  private options: DispatcherOptions;
  private jobs: {[id: string]: Job};

  constructor(options: DispatcherOptions) {
    this.options = options;
    this.jobs = {};
  }

  spawn(options: JobOptions, jobId?: string) {
    const id = jobId || uuid();

    if (this.jobs[id]) {
      throw new Error(`Job with ID already exists: ${jobId}`);
    }

    const job = new Job(id, options);
    job.execute();
    this.jobs[id] = job;
  }

  async stop() {
    await Promise.all(Object.values(this.jobs).map((job) => job.stop()));
  }
}
