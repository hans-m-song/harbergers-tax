type Dict = {[name: string]: string};

const optionsToQuery = (options: Dict) =>
  Object.keys(options)
    .map((key) =>
      [key, options[key]].map((value) => encodeURIComponent(value)).join('='),
    )
    .join('&');

export const update = async (options?: {
  all?: boolean;
}): Promise<{analysis: AnalysisResult; metrics: Metrics}> => {
  const query = options ? `?${optionsToQuery(options as Dict)}` : '';
  const endpoint = `/update${query}`;

  const response = await fetch(endpoint);
  const data = await response.json();
  
  console.log('FETCH', endpoint, response, data);
  return data;
};
