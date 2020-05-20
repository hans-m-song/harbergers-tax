declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MAX_DEPTH?: string;
      DEBUG?: string;
    }
  }
}

export {};
