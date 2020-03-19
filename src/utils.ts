export const random = (floor: number, ceil: number) =>
  Math.ceil(randomFloat(floor, ceil));

export const randomFloat = (floor: number, ceil: number) =>
  round(Math.random() * (ceil - floor) + floor);

export const round = (input: number, decimals = 5) => +input.toFixed(decimals);
