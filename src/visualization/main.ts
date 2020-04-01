import Chart from 'chart.js';
import {Analysis, AnalysisDataSet} from './analysis';
const data = require('../../log.json');

const {metrics, participants} = data[0][0];

const {balances, blockPurchases, rewards} = new Analysis(participants).result();

console.log(participants);
console.log({balances, blockPurchases, rewards})

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

const createDataSet = (data: AnalysisDataSet): Chart.ChartDataSets => {
  const color = randomColor();
  return {
    backgroundColor: color,
    fill: false,
    pointRadius: 0,
    borderColor: color,
    ...data,
  };
};

createChart(createCanvas(), {
  type: 'line',
  data: {
    datasets: balances.datasets.map((balance) => createDataSet(balance)),
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

createChart(createCanvas(), {
  type: 'bar',
  data: {
    ...blockPurchases,
    datasets: blockPurchases.datasets.map((blockPurchases) =>
      createDataSet(blockPurchases),
    ),
  },
});

createChart(createCanvas(), {
  type: 'bar',
  data: {
    ...rewards,
    datasets: rewards.datasets.map((rewards) => createDataSet(rewards)),
  },
});
