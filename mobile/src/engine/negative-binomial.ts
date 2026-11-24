export function logGamma(z: number): number {
  if (z <= 0) return 0;
  const p = [
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }

  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < p.length; i++) {
    x += p[i] / (z + i + 1);
  }

  const t = z + p.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

export function negativeBinomialPmf(k: number, mu: number, r: number): number {
  if (k < 0) return 0;
  if (mu <= 0) return k === 0 ? 1 : 0;
  if (r <= 0) return 0;

  const logCoef = logGamma(k + r) - logGamma(k + 1) - logGamma(r);
  const logP = r * Math.log(r / (r + mu)) + k * Math.log(mu / (r + mu));

  return Math.exp(logCoef + logP);
}

export function generateNegativeBinomialDistribution(mu: number, r: number, maxK: number = 30): number[] {
  const dist: number[] = [];
  let sum = 0;

  for (let k = 0; k <= maxK; k++) {
    const p = negativeBinomialPmf(k, mu, r);
    dist.push(p);
    sum += p;
  }

  if (sum > 0) {
    for (let k = 0; k <= maxK; k++) {
      dist[k] /= sum;
    }
  }

  return dist;
}

export function convolveDistributions(distA: number[], distB: number[]): number[] {
  const maxLen = distA.length + distB.length - 1;
  const result: number[] = new Array(maxLen).fill(0);

  for (let i = 0; i < distA.length; i++) {
    for (let j = 0; j < distB.length; j++) {
      result[i + j] += distA[i] * distB[j];
    }
  }

  return result;
}

export function probOver(distribution: number[], line: number): number {
  let prob = 0;
  for (let k = 0; k < distribution.length; k++) {
    if (k > line) {
      prob += distribution[k];
    }
  }
  return Math.min(0.999, Math.max(0.001, prob));
}

export function probUnder(distribution: number[], line: number): number {
  let prob = 0;
  for (let k = 0; k < distribution.length; k++) {
    if (k < line) {
      prob += distribution[k];
    }
  }
  return Math.min(0.999, Math.max(0.001, prob));
}
