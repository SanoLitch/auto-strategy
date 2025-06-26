/**
 * Универсальный тип для клетки карты
 * Может быть числом, строкой или любым другим типом
 */
export type CellValue = number | string | boolean;

/**
 * Базовый интерфейс для клетки карты
 */
export interface MapCell<T extends CellValue = number> {
  value: T;
}

/**
 * Двумерная карта значений
 */
export type Grid<T extends CellValue = number> = T[][];

/**
 * Функция для инициализации клетки
 */
export type CellInitializer<T extends CellValue = number> = (x: number, y: number) => T;

/**
 * Функция для валидации клетки
 */
export type CellValidator<T extends CellValue = number> = (value: T, x: number, y: number) => boolean;

/**
 * Функция для модификации клетки
 */
export type CellModifier<T extends CellValue = number> = (currentValue: T, x: number, y: number) => T;
