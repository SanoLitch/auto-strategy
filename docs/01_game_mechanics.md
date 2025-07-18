# Игровая механика

## 1. Игровой цикл (Gameplay Loop)

Основной игровой цикл представляет собой последовательность стратегических решений и действий:

1.  **Начало:** Игрок появляется на своей стартовой базе (спаун) на неисследованной карте.
2.  **Строительство:** Используя начальные ресурсы, игрок строит первые здания (например, казарму для копателей).
3.  **Производство:** Здания автоматически начинают производить юнитов, потребляя ресурсы.
4.  **Определение путей:** Игрок чертит траектории от зданий вглубь неизведанных территорий.
5.  **Действие юнитов:**
    *   **Копатели** следуют по траектории, прорывая породу и открывая новые области карты.
    *   **Добытчики** следуют к вскрытым месторождениям ресурсов и начинают их сбор.
    *   **Боевые юниты** патрулируют указанные территории или движутся к точкам столкновения с противником.
6.  **Экспансия и развитие:** Добытые ресурсы позволяют строить новые, более продвинутые здания, производить больше юнитов и улучшать их.
7.  **Повторение:** Цикл повторяется, но с возрастающей сложностью, так как игрок сталкивается с врагами, истощением ресурсов и необходимостью управлять более крупной "империей".

## 2. Ресурсы

В игре предполагается наличие как минимум двух основных типов ресурсов:

-   **Золото:** Основной ресурс для строительства зданий и производства юнитов.
-   **Кристаллы:** Редкий ресурс, необходимый для высокоуровневых зданий, улучшений и самых сильных юнитов.

Ресурсы добываются юнитами-добытчиками из месторождений, которые становятся доступными после расчистки породы юнитами-копателями.

## 3. Юниты

Все юниты производятся автоматически в соответствующих зданиях и немедленно начинают следовать по заданному для этого здания пути.

| Тип Юнита         | Описание                                                              | Назначение                                  |
| ----------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| `Digger` (Копатель) | Базовый юнит для расширения. Прокладывает тоннели в обычной породе.    | Терраформирование, разведка.                |
| `Miner` (Добытчик)  | Собирает ресурсы с открытых месторождений и доставляет их на базу.     | Сбор ресурсов (экономика).                  |
| `Warrior` (Воин)    | Атакует вражеских юнитов и здания, которые встречаются на его пути.   | Атака и защита.                             |
| `Scout` (Разведчик) | Быстрый, но хрупкий юнит. Не копает, но может "просвечивать" породу.  | Ранняя разведка для обнаружения ресурсов.   |

## 4. Здания

Здания являются основой производства и стратегического планирования.

| Здание                    | Производит юнитов | Назначение                                                |
| ------------------------- | ------------------ | --------------------------------------------------------- |
| `Spawn` (База)            | -                  | Главное здание. Его уничтожение ведет к поражению.         |
| `Digger's Guild` (Гильдия копателей) | `Digger`           | Производство юнитов для раскопок.                       |
| `Mine` (Шахта)            | `Miner`            | Производство юнитов для добычи ресурсов.                   |
| `Barracks` (Казарма)      | `Warrior`          | Производство боевых юнитов.                              |
| `Scout's Post` (Пост разведки) | `Scout`          | Производство быстрых юнитов для исследования территорий. |

## 5. Карта и исследование

-   **Карта:** Представляет собой 2D-сетку (grid). Каждая ячейка может быть либо пустой (проход), либо заполнена породой разного типа.
-   **Типы породы:**
    -   `Dirt` (Земля): Легко разрушаемая порода.
    -   `Rock` (Камень): Требует больше времени для разрушения.
    -   `Bedrock` (Гранит): Неразрушимая порода, формирует естественные преграды.
-   **Разведка:** Является ключевым элементом. Игроки не видят карту целиком ("туман войны"). Область становится видимой только после того, как ее расчистит копатель или исследует разведчик.

## 6. Управление

Управление юнитами — непрямое. Игрок взаимодействует с игрой следующим образом:
1.  **Размещение зданий:** Игрок выбирает место для постройки здания на уже расчищенной территории.
2.  **Прокладывание пути:** Для каждого производящего здания игрок рисует на карте траекторию (линию). Все юниты, созданные в этом здании, будут двигаться вдоль этой линии, выполняя свои функции. Путь можно перерисовать в любой момент.