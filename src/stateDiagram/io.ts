const fullWidth = 10;
const DEBUG = process.env.DEBUG || false;

const pad = (message: string, max = fullWidth) => {
  let padding = '';
  let amount = max - message.length;
  while (padding.length < amount) {
    padding += ' ';
  }
  return message + padding;
};

export const io = {
  log: (message: string, ...args: any[]) => {
    if (DEBUG) console.log('<!--', pad(message), ...args, '-->');
  },
  output: console.log,
};
