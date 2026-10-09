import type { LevelSegment } from '../components/level/models';
import { FALL_DISTANCE_BELOW_LEVEL } from './consts';

function isLevelSegment(value: unknown): value is LevelSegment {
  if (typeof value !== 'object' || value === null) return false;

  const segment = value as Record<string, unknown>;
  if (
    typeof segment.length !== 'number'
    || !Number.isFinite(segment.length)
    || typeof segment.width !== 'number'
    || !Number.isFinite(segment.width)
    || (segment.color !== undefined && typeof segment.color !== 'string')
    || (segment.screamer !== undefined && typeof segment.screamer !== 'boolean')
  ) {
    return false;
  }

  switch (segment.type) {
    case 'straight':
      return segment.height === undefined
        || (typeof segment.height === 'number' && Number.isFinite(segment.height));
    case 'turn':
      return segment.direction === 'left' || segment.direction === 'right';
    case 'slope':
      return typeof segment.height === 'number'
        && Number.isFinite(segment.height);
    case 'gap':
      return true;
    default:
      return false;
  }
}

function isLevel(value: unknown): value is LevelSegment[] {
  return Array.isArray(value)
    && value.length > 0
    && value.every(isLevelSegment);
}

const levelModules = import.meta.glob<Record<string, unknown>>(
  '../levels/level*.ts',
  { eager: true },
);

export const levels = Object.entries(levelModules)
  .map(([path, module]) => {
    const match = path.match(/level(\d+)\.ts$/);
    if (!match) return null;

    const number = Number(match[1]);
    const namedExport = module[`level${number}`];
    const level = isLevel(module.default)
      ? module.default
      : isLevel(namedExport)
        ? namedExport
        : null;

    if (!level) {
      throw new Error(`Level module "${path}" must export a LevelSegment[]`);
    }

    return { number, segments: level };
  })
  .filter((level): level is { number: number; segments: LevelSegment[] } => (
    level !== null
  ))
  .sort((first, second) => first.number - second.number)
  .map(({ segments }) => segments);

if (levels.length === 0) {
  throw new Error('No levels found. Add a levelN.ts file to src/levels.');
}

export function getFallThreshold(segments: LevelSegment[]): number {
  let elevation = 0;
  let minimumElevation = 0;

  for (const segment of segments) {
    if (segment.type === 'slope') {
      elevation += segment.height;
      minimumElevation = Math.min(minimumElevation, elevation);
    }
  }

  return minimumElevation - FALL_DISTANCE_BELOW_LEVEL;
}
