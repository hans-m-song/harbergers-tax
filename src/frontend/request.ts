import {Participant} from '../job/participant';

type Dict = {[name: string]: string};

const optionsToQuery = (options: Dict) =>
  Object.keys(options)
    .map((key) =>
      [key, options[key]].map((value) => encodeURIComponent(value)).join('='),
    )
    .join('&');

const createUrl = (endpoint: string, options: Dict) =>
  `/${endpoint}${options ? `?${optionsToQuery(options as Dict)}` : ''}`;

const get = async (url: string): Promise<Response | null> => {
  const response = await fetch(url);
  if (response.status !== 200) {
    return null;
  }
  return response;
};

export const updateJob = async (options?: {
  id?: string;
  all?: boolean;
}): Promise<{
  result: AnalysisResult;
  // metrics: Metrics;
  participants: Participant[];
} | null> => {
  const url = createUrl('update', options as Dict);
  const response = await get(url);
  return response ? response.json() : null;
};

export const newJob = async (
  id: string,
  options?: JobOptions,
): Promise<boolean> => {
  const url = createUrl('new', {id});
  const response = await get(url);
  return !!response;
};
