interface Point {
  x: number;
  y: number;
}

interface AnalysisDataSet {
  label?: string;
  data: Point[] | number[];
}

interface AnalysisData {
  labels?: number[];
  datasets: AnalysisDataSet[];
}

interface AnalysisResult {
  [name: string]: AnalysisData;
  balances: AnalysisData;
  blockPurchases: AnalysisData;
  rewards: AnalysisData;
}
