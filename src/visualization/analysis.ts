import {Metrics, Participant} from '../entities';

const log = require('../../log.json');

const participants = log[0][0].participants as Participant[];

export const metrics = log[0][0].metrics as Metrics;

export const balances = participants.map((participant, i) => {
  const data = participant.history.map((transaction) => ({
    x: transaction.timestamp,
    y: transaction.balance,
  }));

  return {data, label: i > 0 ? `${participant.id}` : 'pool'};
});
