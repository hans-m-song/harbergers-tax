import fs from 'fs';
import {EventEmitter} from 'events';

export class FileIO implements IO {
  destination: string;
  stream: fs.WriteStream;
  history: any[];
  realtime: boolean;
  writeHistory: Promise<void>[];

  constructor(destination: string, realtime = true) {
    this.destination = destination;
    this.stream = fs.createWriteStream(this.destination);
    this.writeHistory = [];
    this.write('[\n');
    this.history = [];
    this.realtime = realtime;
  }

  async write(data: any, close = false) {
    const writePromise: Promise<void> = new Promise((resolve, reject) =>
      this.stream.write(
        `${this.writeHistory.length > 1 && !close ? ',\n' : ''}${data}`,
        (error) => (error ? reject(error) : resolve()),
      ),
    );
    this.writeHistory.push(writePromise);
    return writePromise;
  }

  async close() {
    if (this.realtime) this.write('\n]', true);
    else this.write(JSON.stringify(history, null, 4));
    await Promise.all(this.writeHistory);
  }

  record(...args: any[]) {
    this.history.push({...args});
    if (this.realtime) this.write(JSON.stringify(args, null, 4));
  }

  log(...args: any[]) {
    console.log('FILEIO', ...args);
    this.record(...args);
  }
}

export class EventIO extends EventEmitter implements IO {
  id: string;
  history: any[];

  constructor(id: string) {
    super();
    this.id = id;
    this.history = [];
  }

  async close() {}

  record(...args: any[]) {
    this.history.push({...args});
  }

  log(...args: any[]) {
    console.log('EVNTIO', ...args);
    this.emit('log', {id: this.id, ...args});
    this.record(this.id, ...args);
  }
}

export class DummyIO implements IO {
  history: any[] = [];
  async close() {};
  record(...args: any[]) {};
  log(...args: any[]) {};
}