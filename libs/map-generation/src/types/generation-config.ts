import { Vector2 } from '@libs/utils';

/**
 * Диапазон значений (минимум и максимум)
 */
export interface Range {
  min: number;
  max: number;
}

/**
 * Конфигурация для генерации шума
 */
export interface NoiseConfig {
  scale: number;
  octaves: number;
  persistence: number;
  frequency: number;
}

/**
 * Конфигурация для генерации формаций (кластеров)
 */
export interface FormationConfig {
  density: number;
  radius: Range;
  intensity: Range;
}

/**
 * Конфигурация для размещения объектов
 */
export interface PlacementConfig {
  count: number;
  minDistance: number;
  maxDistance?: number;
  zones?: {
    center: { radius: number };
    middle: { radius: number };
    outer: { radius: number };
  };
}

/**
 * Конфигурация для генерации кластеров
 */
export interface ClusterConfig {
  radius: number;
  density: number;
  falloffType: 'linear' | 'quadratic' | 'exponential';
}

/**
 * Информация о размещенном объекте
 */
export interface PlacedObject extends Vector2 {
  value: any;
  metadata?: Record<string, any>;
}

/**
 * Конфигурация для размещения объектов в зонах
 */
export interface ZonedPlacementConfig {
  zones: Array<{
    name: string;
    centerX: number;
    centerY: number;
    radius: number;
    weight: number; // Относительный вес зоны для размещения
  }>;
  objects: Array<{
    type: string;
    count: number;
    allowedZones: string[];
    clustering?: ClusterConfig;
  }>;
  spacing: {
    sameType: number;
    differentTypes: number;
  };
}
