import { Uuid } from '@libs/domain-primitives';
import { InsufficientResourcesError } from '@libs/utils';

export class Player {
  public readonly id: Uuid;
  public readonly userId: Uuid;
  public readonly gameSessionId: Uuid;
  public readonly resources: Readonly<Record<string, number>>;
  public readonly isWinner: boolean;

  constructor(params: {
    id: Uuid;
    userId: Uuid;
    gameSessionId: Uuid;
    resources: Record<string, number>;
    isWinner?: boolean;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.gameSessionId = params.gameSessionId;
    this.resources = params.resources;
    this.isWinner = params.isWinner ?? false;
  }

  public static create(params: {
    userId: Uuid;
    gameSessionId: Uuid;
    initialResources?: Record<string, number>;
  }): Player {
    const resources = params.initialResources ?? {
      gold: 100,
      crystals: 0,
    };

    return new Player({
      id: new Uuid(),
      userId: params.userId,
      gameSessionId: params.gameSessionId,
      resources,
      isWinner: false,
    });
  }

  public canAfford(cost: Partial<Record<string, number>>): boolean {
    for (const key in cost) {
      if ((this.resources[key] ?? 0) < (cost[key] ?? 0)) {
        return false;
      }
    }
    return true;
  }

  public spendResources(cost: Partial<Record<string, number>>): Player {
    if (!this.canAfford(cost)) {
      throw new InsufficientResourcesError();
    }

    const newResources = { ...this.resources };

    for (const key in cost) {
      newResources[key] -= cost[key] ?? 0;
    }

    return new Player({
      ...this,
      resources: newResources,
    });
  }

  public earnResources(amount: Partial<Record<string, number>>): Player {
    const newResources = { ...this.resources };

    for (const key in amount) {
      newResources[key] = (newResources[key] ?? 0) + (amount[key] ?? 0);
    }
    return new Player({
      ...this,
      resources: newResources,
    });
  }

  public markAsWinner(): Player {
    if (this.isWinner) {
      return this;
    }
    return new Player({
      ...this,
      isWinner: true,
    });
  }
}
