import { Uuid } from '@libs/domain-primitives';
import {
  parentPort, workerData,
} from 'worker_threads';
import { Map } from '../domain/map.entity';

const {
  size, playersCount,
} = workerData;

const map = new Map({
  id: new Uuid(),
  size,
});

map.generateTerrainWithResources(playersCount);
map.generateSpawnPoints(playersCount);

parentPort?.postMessage({
  terrainData: map.terrainData,
  spawnPoints: map.spawnPoints,
});
