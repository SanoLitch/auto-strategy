export enum AppEventNames {
  MAP_GENERATE = 'map.generate',
  MAP_GENERATED = 'map.generated',
  PLAYER_CREATED = 'player.created',
  PLAYER_JOINING = 'player.joining',
  GAME_SESSION_CHANGED = 'game-session.changed',
}

export interface AppEvents {
  [AppEventNames.MAP_GENERATE]: {
    sessionId: string;
    size: { width: number; height: number };
    playersCount: number;
  };
  [AppEventNames.MAP_GENERATED]: [sessionId: string, mapId: string];
  [AppEventNames.PLAYER_CREATED]: string;
  [AppEventNames.PLAYER_JOINING]: { userId: string; gameSessionId: string };
  [AppEventNames.GAME_SESSION_CHANGED]: string;
}
