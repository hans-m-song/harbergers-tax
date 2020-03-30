import fs from 'fs';

export class IO {
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

  report(...args: any[]) {
    this.history.push({...args});
    if (this.realtime) this.write(JSON.stringify({...args}, null, 4));
  }

  log(...args: any[]) {
    console.log(...args);
    this.report(...args);
  }
}
