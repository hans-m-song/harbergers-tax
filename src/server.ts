import express from 'express';
import bodyParser from 'body-parser';
import * as path from 'path';
import {Analysis} from './analysis';
import {Job} from './job';
import {DummyIO} from './IO';
import {merge} from './utils';

// const data = require('../log.json');
// const analysis = new Analysis(data[0][0].participants);
// const result = analysis.result();

const jobQueue: {[key: string]: Job} = {};

const analyse = (job: Job): AnalysisResult =>
  new Analysis(job.getParticipants()).result();

const app = express();
const port = process.env.PORT || 4242;

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'frontend')));

app.all('*', (req, res, next) => {
  process.stdout.write(
    `${req.method} ${req.path} ${JSON.stringify(req.query)} ==> `,
  );
  next();
});

app.get('/update', (req, res) => {
  const id = req.query.id;
  if (id && jobQueue[id as string]) {
    if (jobQueue[id as string].analysed) {
      console.log(`job already analysed: "${id}`);
      res.send({metrics: jobQueue[id as string].getMetrics()});
      return;
    }

    console.log(`analysing job: "${id}"`);
    if (jobQueue[id as string].complete) {
      jobQueue[id as string].setAnalysed();
    }

    const result = analyse(jobQueue[id as string]);
    res.send({result});
    return;
  }
  console.log(`job not found: "${id}"`);
  res.sendStatus(404);
});

app.post('/new', (req, res) => {
  const id = req.query.id;
  console.log('body', req.body);
  if (id) {
    console.log(`new job request received: "${id}"`);
    const jobOptions: JobOptions = merge(
      {
        participant: {
          count: 5,
        },
        block: {
          interval: 1,
          reward: 1,
          rounds: 10,
        },
        trade: {
          interval: 0.2,
        },
        pool: {
          chunks: 3,
          tax: 0.05,
          computeShare: 0.3,
        },
      },
      req.body || {},
    );
    const job = new Job(id as string, new DummyIO(), jobOptions);
    jobQueue[id as string] = job;
    job.execute();
    res.send({id, jobOptions});
    return;
  }

  console.log(`job missing parameters: "${id}`);
  res.sendStatus(404);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
