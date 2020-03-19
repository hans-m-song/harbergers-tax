export const random = (floor: number, ceil: number) =>
  Math.ceil(randomFloat(floor, ceil));

export const randomFloat = (floor: number, ceil: number) =>
  Math.random() * (ceil - floor) + floor;

console.log(randomFloat(-4, 1));
