interface IO {
  history: any[];
  close: () => Promise<void>;
  record: (...args: any[]) => void;
  log: (...args: any[]) => void;
}
