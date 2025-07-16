import {
  clamp, randomFloat,
} from '../utils/noise.utils';

export interface ContiguousProbabilityConfig {
  distance: number;
  radius: number;
  baseDensity: number;
  falloffExponent?: number;
  noiseAmount?: number;
}

export interface LayerConfig {
  multiplier: number;
  invertDistance?: boolean;
  threshold?: number;
}

export interface MultiLayerProbabilityConfig {
  normalizedDistance: number;
  layers: LayerConfig[];
}

export interface RadialProbabilityConfig {
  distance: number;
  radius: number;
  baseStrength?: number;
}

export function calculateContiguousProbability(config: ContiguousProbabilityConfig): number {
  const {
    distance,
    radius,
    baseDensity,
    falloffExponent = 0.8,
    noiseAmount = 0.1,
  } = config;

  if (distance === 0) {
    return 1.0; // Центр всегда заполнен
  }

  const normalizedDistance = distance / radius;
  const falloff = 1 - Math.pow(normalizedDistance, falloffExponent);
  const noise = randomFloat(-noiseAmount / 2, noiseAmount / 2);

  return clamp(baseDensity * falloff + noise);
}

export function calculateMultiLayerProbabilities(config: MultiLayerProbabilityConfig): number[] {
  const {
    normalizedDistance, layers,
  } = config;

  return layers.map(layer => {
    const {
      multiplier, invertDistance = false, threshold = 0,
    } = layer;
    const distance = invertDistance ? (1 - normalizedDistance) : normalizedDistance;
    const probability = Math.max(threshold, distance * multiplier);

    return Math.min(1, probability); // Ограничиваем до 1
  });
}

export function calculateLayerProbability(
  normalizedDistance: number,
  multiplier: number,
  invertDistance: boolean = false,
  threshold: number = 0,
): number {
  const distance = invertDistance ? (1 - normalizedDistance) : normalizedDistance;
  const probability = Math.max(threshold, distance * multiplier);

  return Math.min(1, probability);
}

export function calculateRadialProbability(config: RadialProbabilityConfig): number {
  const {
    distance,
    radius,
    baseStrength = 0.8,
  } = config;

  if (radius === 0) {
    return 0;
  }

  const normalizedDistance = distance / radius;
  const probability = Math.max(0, 1 - normalizedDistance);

  return probability * baseStrength;
}
