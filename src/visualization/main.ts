import Chart, {ChartDataSets} from 'chart.js';
import {balances} from './analysis';

const root = document.querySelector('#root');
const createCanvas = () => {
  const canvas = document.createElement('canvas');
  root?.appendChild(canvas);
  return canvas;
};

const randomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const createChart = (
  canvas: HTMLCanvasElement,
  config: Chart.ChartConfiguration,
) => new Chart(canvas.getContext('2d')!, config);

const createDataSet = (data: ChartDataSets): Chart.ChartDataSets => {
  const color = randomColor();
  return {
    backgroundColor: color,
    fill: false,
    borderColor: color,
    ...data,
  };
};

createChart(createCanvas(), {
  type: 'line',
  data: {
    datasets: balances.map((balance) => createDataSet(balance)),
  },
  options: {
    scales: {
      xAxes: [
        {
          type: 'linear',
          position: 'bottom',
        },
      ],
    },
  },
});
