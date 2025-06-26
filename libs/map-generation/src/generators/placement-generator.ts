import { Vector2 } from '@libs/utils';
import { GridGenerator } from './grid-generator';
import { FormationGenerator } from './formation-generator';
import {
  Grid, CellValue,
} from '../types/cell-types';
import {
  PlacementConfig, ZonedPlacementConfig, PlacedObject,
} from '../types/generation-config';
import { GeometryUtils } from '../utils/geometry-utils';
import { DistanceCalculator } from '../utils/distance-calculator';

/**
 * Универсальный генератор для размещения объектов на карте
 */
export class PlacementGenerator {
  /**
   * Размещает объекты с учетом минимальных расстояний
   */
  public static placeObjects<T extends CellValue>(
    grid: Grid<T>,
    objects: PlacedObject[],
    validator?: (position: Vector2, grid: Grid<T>) => boolean,
  ): boolean[] {
    return objects.map(obj => {
      if (!GeometryUtils.isWithinBounds(obj.x, obj.y, {
        x: grid[0].length,
        y: grid.length,
      })) {
        return false;
      }

      if (validator && !validator(obj, grid)) {
        return false;
      }

      grid[obj.y][obj.x] = obj.value;
      return true;
    });
  }

  /**
   * Размещает объекты с учетом минимальных расстояний
   */
  public static placeWithDistance<T extends CellValue>(
    grid: Grid<T>,
    config: PlacementConfig,
    value: T,
    excludePositions: Vector2[] = [],
  ): Vector2[] {
    const size = {
      x: grid[0].length,
      y: grid.length,
    };
    const placements: Vector2[] = [];
    const allExcluded = [...excludePositions];

    for (let attempt = 0; attempt < config.count * 10 && placements.length < config.count; attempt++) {
      const candidate = GeometryUtils.randomPosition(size);

      const isValidDistance = DistanceCalculator.isMinDistanceRespected(
        candidate,
        allExcluded,
        config.minDistance,
      );

      const isWithinMaxDistance = config.maxDistance === undefined
        || allExcluded.length === 0
        || allExcluded.some(pos => DistanceCalculator.euclidean(candidate, pos) <= config.maxDistance!);

      if (isValidDistance && isWithinMaxDistance) {
        grid[candidate.y][candidate.x] = value;
        placements.push(candidate);
        allExcluded.push(candidate);
      }
    }

    return placements;
  }

  /**
   * Размещает объекты в заданных зонах
   */
  public static placeInZones<T extends CellValue>(
    grid: Grid<T>,
    config: ZonedPlacementConfig,
    defaultValue: T,
  ): PlacedObject[] {
    const placements: PlacedObject[] = [];
    const allPlacements: Vector2[] = [];

    // Обрабатываем каждый тип объектов
    for (const objectConfig of config.objects) {
      const objectPlacements = this.placeObjectType(
        grid,
        objectConfig,
        config.zones,
        config.spacing,
        allPlacements,
        defaultValue,
      );

      placements.push(...objectPlacements);
      allPlacements.push(...objectPlacements.map(p => ({
        x: p.x,
        y: p.y,
      })));
    }

    return placements;
  }

  /**
   * Размещает объекты определенного типа
   */
  private static placeObjectType<T extends CellValue>(
    grid: Grid<T>,
    objectConfig: ZonedPlacementConfig['objects'][0],
    zones: ZonedPlacementConfig['zones'],
    spacing: ZonedPlacementConfig['spacing'],
    existingPlacements: Vector2[],
    defaultValue: T,
  ): PlacedObject[] {
    const placements: PlacedObject[] = [];
    const allowedZones = zones.filter(zone => objectConfig.allowedZones.indexOf(zone.name) !== -1);

    for (let i = 0; i < objectConfig.count; i++) {
      const placement = this.findValidPlacement(
        grid,
        allowedZones,
        spacing,
        existingPlacements,
        objectConfig.type,
      );

      if (placement) {
        const placedObject: PlacedObject = {
          x: placement.x,
          y: placement.y,
          value: objectConfig.type,
          metadata: { type: objectConfig.type },
        };

        // Создаем кластер если указана конфигурация
        if (objectConfig.clustering) {
          FormationGenerator.createContiguousCluster(
            grid,
            placement,
            10,
            defaultValue,
          );
        } else {
          grid[placement.y][placement.x] = defaultValue;
        }

        placements.push(placedObject);
        existingPlacements.push(placement);
      }
    }

    return placements;
  }

  /**
   * Находит валидную позицию для размещения
   */
  private static findValidPlacement(
    grid: Grid<any>,
    allowedZones: ZonedPlacementConfig['zones'],
    spacing: ZonedPlacementConfig['spacing'],
    existingPlacements: Vector2[],
    objectType: string,
  ): Vector2 | null {
    const size = {
      x: grid[0].length,
      y: grid.length,
    };
    const maxAttempts = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Выбираем случайную зону с учетом весов
      const zone = this.selectWeightedZone(allowedZones);

      // Генерируем позицию в зоне
      const candidate = GeometryUtils.randomPositionInCircle(
        zone.centerX,
        zone.centerY,
        0,
        zone.radius,
      );

      // Проверяем что позиция в границах карты
      if (!GeometryUtils.isWithinBounds(candidate.x, candidate.y, size)) {
        continue;
      }

      // Проверяем расстояния
      const sameTypePositions = existingPlacements.filter((_, i) =>
        // Здесь можно добавить проверку типа если нужно
        true);

      const minDistanceSameType = DistanceCalculator.isMinDistanceRespected(
        candidate,
        sameTypePositions,
        spacing.sameType,
      );

      const minDistanceDifferentTypes = DistanceCalculator.isMinDistanceRespected(
        candidate,
        existingPlacements,
        spacing.differentTypes,
      );

      if (minDistanceSameType && minDistanceDifferentTypes) {
        return candidate;
      }
    }

    return null;
  }

  /**
   * Выбирает зону с учетом весов
   */
  private static selectWeightedZone(zones: ZonedPlacementConfig['zones']): ZonedPlacementConfig['zones'][0] {
    const totalWeight = zones.reduce((sum, zone) => sum + zone.weight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const zone of zones) {
      randomWeight -= zone.weight;
      if (randomWeight <= 0) {
        return zone;
      }
    }

    return zones[0];
  }

  /**
   * Размещает объекты вдоль краев карты
   */
  public static placeAroundEdges<T extends CellValue>(
    grid: Grid<T>,
    count: number,
    margin: number,
    minDistance: number,
    value: T,
  ): Vector2[] {
    const size = GridGenerator.getSize(grid);
    const placements: Vector2[] = [];

    for (let i = 0; i < count; i++) {
      const side = i % 4; // 4 стороны карты
      let position: Vector2;

      switch (side) {
      case 0: // Верх
        position = {
          x: margin + Math.floor(Math.random() * (size.x - 2 * margin)),
          y: margin,
        };
        break;
      case 1: // Право
        position = {
          x: size.x - margin,
          y: margin + Math.floor(Math.random() * (size.y - 2 * margin)),
        };
        break;
      case 2: // Низ
        position = {
          x: margin + Math.floor(Math.random() * (size.x - 2 * margin)),
          y: size.y - margin,
        };
        break;
      case 3: // Лево
        position = {
          x: margin,
          y: margin + Math.floor(Math.random() * (size.y - 2 * margin)),
        };
        break;
      default:
        position = {
          x: size.x / 2,
          y: size.y / 2,
        };
      }

      // Проверяем минимальное расстояние
      if (DistanceCalculator.isMinDistanceRespected(position, placements, minDistance)) {
        GridGenerator.setValue(grid, position, value);
        placements.push(position);
      }
    }

    return placements;
  }

  /**
   * Размещает объекты по кругу
   */
  public static placeInCircle<T extends CellValue>(
    grid: Grid<T>,
    center: Vector2,
    radius: number,
    count: number,
    value: T,
  ): Vector2[] {
    const placements: Vector2[] = [];
    const angleStep = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const position = GeometryUtils.polarToCartesian(
        center.x,
        center.y,
        radius,
        angle,
      );

      if (GridGenerator.isValidPosition(grid, position)) {
        GridGenerator.setValue(grid, position, value);
        placements.push(position);
      }
    }

    return placements;
  }

  /**
   * Проверяет доступность между позициями
   */
  public static ensureAccessibility<T extends CellValue>(
    grid: Grid<T>,
    spawnPoints: Vector2[],
    accessibleValue: T,
    blockingValues: T[],
    radius: number = 3,
  ): void {
    for (const spawn of spawnPoints) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const position = {
            x: spawn.x + dx,
            y: spawn.y + dy,
          };

          if (!GeometryUtils.isWithinBounds(position.x, position.y, {
            x: grid[0].length,
            y: grid.length,
          })) {
            continue;
          }

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= radius) {
            const currentValue = grid[position.y][position.x];

            if (blockingValues.includes(currentValue)) {
              grid[position.y][position.x] = accessibleValue;
            }
          }
        }
      }
    }
  }
}
