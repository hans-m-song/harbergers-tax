import Chart from 'chart.js';

const root = document.querySelector('#root');
const createCanvas = () => {
  const canvas = document.createElement('canvas');
  const container = document.createElement('div');
  container.className = 'canvas-container';
  container.appendChild(canvas);
  root!.appendChild(container);
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
      title: {
        text: 'Balance of participants',
        display: true,
      },
      maintainAspectRatio: false,
      responsive: true,
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
    options: {
      title: {
        text: 'Blocks purchased',
        display: true,
      },
      maintainAspectRatio: false,
      responsive: true,
    },
  });

  const rewardsChart = createChart(createCanvas(), {
    type: 'bar',
    data: {
      ...rewards,
      datasets: rewards.datasets.map((rewards) => createDataSet(rewards)),
    },
    options: {
      title: {
        text: 'Rewards received',
        display: true,
      },
      maintainAspectRatio: false,
      responsive: true,
    },
  });

  return {balancesChart, blockPurchasesChart, rewardsChart};
};

const updateChart = (chart: Chart, data: AnalysisData) => {
  console.log(chart.config.data, data);
  data.datasets.forEach((dataSet, i) => {
    while (chart.config.data!.datasets![i].data!.length < dataSet.data.length) {
      chart.config.data!.datasets![i].data!.push(
        dataSet.data[chart.config.data!.datasets![i].data!.length] as number,
      );
    }
  });
  if (data.labels) {
    chart.config.data!.labels = data.labels;
  }
};

export const updateCharts = (
  charts: {[name: string]: Chart},
  analysis: AnalysisResult,
) => {
  Object.keys(charts).forEach((name) => {
    updateChart(charts[name], analysis[name.slice(0, name.length - 5)]);
    charts[name].update();
  });
};
