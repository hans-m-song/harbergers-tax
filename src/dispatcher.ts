import {v4 as uuid} from 'uuid';
import {Job} from './job';
import { EventIO } from './IO';

export class Dispatcher {
  private io: IO;
  private options: DispatcherOptions;
  private jobs: {[id: string]: Job};

  constructor(options: DispatcherOptions) {
    this.options = options;
    this.jobs = {};
    this.io = new EventIO('dispatcher');
  }

  spawn(options: JobOptions, jobId?: string) {
    const id = jobId || uuid();

    if (this.jobs[id]) {
      throw new Error(`Job with ID already exists: ${jobId}`);
    }

    const job = new Job(id, new EventIO(id), options);
    job.execute();
    this.jobs[id] = job;
  }

  async stop() {
    await Promise.all(Object.values(this.jobs).map((job) => job.stop()));
  }
}
