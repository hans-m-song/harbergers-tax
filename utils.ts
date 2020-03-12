export const random = (floor: number, ceil: number) =>
  Math.ceil(Math.random() * (ceil - floor) + floor);

export const randomFloat = (floor: number, ceil: number, zeroes = 0) => {
  const padding = [];
  while (padding.length < zeroes) padding.push('0');
  return parseFloat(`0.${padding.join('')}${random(floor, ceil)}`);
};
