import Chart from 'chart.js';

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

export const createCharts = (analysis: AnalysisResult) => {
  const {balances, blockPurchases, rewards} = analysis;

  const balancesChart = createChart(createCanvas(), {
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

  const blockPurchasesChart = createChart(createCanvas(), {
    type: 'bar',
    data: {
      ...blockPurchases,
      datasets: blockPurchases.datasets.map((blockPurchases) =>
        createDataSet(blockPurchases),
      ),
    },
  });

  const rewardsChart = createChart(createCanvas(), {
    type: 'bar',
    data: {
      ...rewards,
      datasets: rewards.datasets.map((rewards) => createDataSet(rewards)),
    },
  });

  return {balancesChart, blockPurchasesChart, rewardsChart};
};

const updateChart = (chart: Chart, data: AnalysisData) => {};

export const updateCharts = (
  charts: {[name: string]: Chart},
  analysis: AnalysisResult,
) => {
  Object.keys(charts).forEach((name) =>
    updateChart(charts[name], analysis[name.slice(0, name.length - 5)]),
  );
};
