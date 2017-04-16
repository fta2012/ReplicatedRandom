import ReplicatedRandom, { predictCuids } from './index';

const n = 10;

/*** Replicate Math.random() with 2 previous doubles ***/

// Observe 2 Math.random() values
const observations = [];
for (let i = 0; i < 2; i++) {
  observations.push(Math.random());
}
console.log('Observations:', observations);

// Replicate the rngstate and predict n doubles
const rr = new ReplicatedRandom();
rr.replicateState(observations);
const predictions = [rr.getDouble()];
for (let i = 1; i < n; i++) {
  predictions.push(rr.nextDouble());
}

/* Sanity check
for (let i = 1; i < observations.length; i++) {
  const predicted = predictions[i];
  const actual = observations[i];
  console.log('Predicted:\t', predicted);
  console.log('Actual:   \t', actual);
  console.assert(predicted === actual);
}
console.log();
*/
// Check
for (let i = observations.length; i < n; i++) {
  const predicted = predictions[i];
  const actual = Math.random(); // generate more
  console.log('Predicted:\t', predicted);
  console.log('Actual:   \t', actual);
  console.assert(predicted === actual);
}
console.log();




/*** Replicate cuid() with 4 previous cuids ***/

import cuid from 'cuid';

// Observe 4 consecutive cuids
const cuids = [];
for (let i = 0; i < 4; i++) {
  cuids.push(cuid());
}
console.log('Observations:\n' + cuids.join('\n'));

// Replicate the rngstate and predict n cuids
const prediction = predictCuids(cuids, n);

/* Sanity check
for (let i = 0; i < cuids.length; i++) {
  const predicted = prediction[i];
  const actual = cuids[i];
  console.log('Predicted:\t', predicted);
  console.log('Actual:   \t', actual);
  console.assert(predicted.slice(-8) === actual.slice(-8));
}
console.log();
*/
// Check
for (let i = cuids.length; i < n; i++) {
  const predicted = prediction[i];
  const actual = cuid(); // generate more
  console.log('Predicted:\t', predicted);
  console.log('Actual:   \t', actual);
  console.assert(predicted.slice(-8) === actual.slice(-8));
}
console.log();
