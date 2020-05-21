export const random = (floor: number, ceil: number) =>
  Math.ceil(randomFloat(floor, ceil));

export const randomFloat = (floor: number, ceil: number) =>
  round(Math.random() * (ceil - floor) + floor);

export const round = (input: number, decimals = 5) => +input.toFixed(decimals);

const isObject = (obj: unknown) => obj && typeof obj === 'object';

export const merge = (...objects: any[]) => {

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (!pVal) {
        prev[key] = {};
      }

      if (isObject(pVal) && isObject(oVal)) {
        prev[key] = merge(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    }, {});

    return prev;
  }, {});
};
