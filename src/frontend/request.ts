type Dict = {[name: string]: string};

const optionsToQuery = (options: Dict) =>
  Object.keys(options)
    .map((key) =>
      [key, options[key]].map((value) => encodeURIComponent(value)).join('='),
    )
    .join('&');

const createUrl = (endpoint: string, options: Dict) =>
  `/${endpoint}${options ? `?${optionsToQuery(options as Dict)}` : ''}`;

const post = (endpoint: string, body: any = {}) =>
  fetch(endpoint, {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

export const updateJob = async (options?: {
  id?: string;
  all?: boolean;
}): Promise<{
  result?: AnalysisResult;
  metrics?: Metrics;
} | null> => {
  const url = createUrl('update', options as Dict);
  const response = await fetch(url);
  if (response.status === 200) {
    return response.json();
  }
  console.log('response', response.status, await response.text());
  return null;
};

export const newJob = async (
  id: string,
  options?: JobOptions,
): Promise<{
  id: string;
  jobOptions: JobOptions;
} | null> => {
  const url = createUrl('new', {id});
  const response = await post(url, options);
  if (response.status !== 200) {
    return null;
  }
  return response.json();
};
