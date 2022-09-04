type Level = {
  dimensions: Vector3,
  tiles: Tile[][][],
};

type Tile = {
  entities: Record<EntityId, Entity>,
  cell: LevelDesignCell,
  // array of orientation to what tile walking in that direction takes you to. Undefined for nowhere/death
  orientationTargetTilePositions?: Record<Orientation, Vector3 | undefined> & (Vector3 | undefined)[],
};

const levelPopulateGraph = (level: Level) => {
  const salientFeatures = array3New<Entity | undefined>(...level.dimensions);
  levelIterateEntitiesInBounds(
      level, 
      [0, 0, 0],
      level.dimensions,
      (entity, ...pos) => {
        const area = rect3Intersection(pos, [1, 1, 1], entity.position, entity.dimensions).reduce(
          (acc, v) => {
            return acc * v;
          },
          1 
        );
        // ensure it's not just in the tile by a little bit
        if (area > .1) {
          const [x, y, z] = pos;
          if (entity.entityType == ENTITY_TYPE_WALL || entity.entityType == ENTITY_TYPE_STAIR) {
            salientFeatures[x][y][z] = entity;
          }  
        }
      },
  );

  // indicate tile connectivity
  levelIterateInBounds(level, [0, 0, 0], level.dimensions, (from, ...fromPos) => {
    const [fromX, fromY, fromZ] = fromPos;
    const fromSalientFeature = salientFeatures[fromX][fromY][fromZ];
    from.orientationTargetTilePositions = ORIENTATION_OFFSETS.map<Vector3>((offset, orientation) => {
      // assume we don't have stairs leading up to nowhere, otherwise will need to check the
      // bounds too
      const zOffset = orientation == fromSalientFeature?.orientation
          && fromSalientFeature?.entityType == ENTITY_TYPE_STAIR
          ? 1
          : 0;
      const toPos = fromPos.map((v, i) => v + offset[i]);
      // to position is in bounds
      if (toPos.every((v, i) => v >= 0 && v < level.dimensions[i])) {
        const [toX, toY, originalTpZ] = toPos;
        const startingZ = originalTpZ + zOffset
        for (let toZ = startingZ; toZ >= 0; toZ--) {
          const toSalientFeature = salientFeatures[toX][toY][toZ];
          if (toZ == startingZ && toSalientFeature) {
            // way is maybe blocked
            if (toSalientFeature.entityType == ENTITY_TYPE_STAIR && toSalientFeature.orientation == orientation) {
              return [toX, toY, toZ];
            }
            // assume anything else is a blockage
            return;
          }
          // otherwise it's a drop
          if (toSalientFeature?.collisionMask & COLLISION_GROUP_MONSTER) {
            return [toX, toY, toZ];
          }
        }  
      }
    }) as Record<Orientation, Vector3> & Vector3[];
  });
}

const levelIterateInBounds = (
    level: Level,
    position: Vector3, 
    dimensions: Vector3,
    f: (tile: Tile, x: number, y: number, z: number) => void,
) => {
  const [minx, miny, minz] = position.map(
      v => Math.max(v | 0, 0)
  );
  const [maxx, maxy, maxz] = position.map(
      (v, i) => Math.min(Math.ceil(v + dimensions[i]), level.dimensions[i])
  );
  for (let x = minx; x < maxx; x++) {
    for (let y = miny; y < maxy; y++) {
      for (let z = minz; z < maxz; z++) {
        f(level.tiles[x][y][z], x, y, z);
      }
    }
  }
};

const levelIterateEntitiesInBounds = (
    level: Level,
    position: Vector3, 
    dimensions: Vector3,
    f: (entity: Entity, x: number, y: number, z: number) => void,
) => {
  const iteratedEntities: Record<EntityId, Truthy> = {};
  levelIterateInBounds(level, position, dimensions, (tile, ...pos) => {
    for (let entityId in tile.entities) {
      if (!iteratedEntities[entityId]) {
        const entity = tile.entities[entityId];
        f(entity, ...pos);
        iteratedEntities[entityId] = 1;
      }
    }
  });
};

const levelAddEntity = (level: Level, entity: Entity) => levelIterateInBounds(
    level,
    entity.position,
    entity.dimensions,
    tile => tile.entities[entity.id] = entity,
);
const levelRemoveEntity = (level: Level, entity: Entity) => levelIterateInBounds(
    level,
    entity.position,
    entity.dimensions,
    tile => delete tile.entities[entity.id],
);

const LEVEL_DESIGN_CELL_STAIR_EAST = 0;
const LEVEL_DESIGN_CELL_STAIR_NORTH = 1;
const LEVEL_DESIGN_CELL_STAIR_WEST = 2;
const LEVEL_DESIGN_CELL_STAIR_SOUTH = 3;
const LEVEL_DESIGN_CELL_SPACE = 4;
const LEVEL_DESIGN_CELL_WALL = 5;
const LEVEL_DESIGN_CELL_EAST_WEST_CORRIDOR = 6;
const LEVEL_DESIGN_CELL_NORTH_SOUTH_CORRIDOR = 7;

type LevelDesignCell = 
  | typeof LEVEL_DESIGN_CELL_STAIR_EAST
  | typeof LEVEL_DESIGN_CELL_STAIR_NORTH
  | typeof LEVEL_DESIGN_CELL_STAIR_WEST
  | typeof LEVEL_DESIGN_CELL_STAIR_SOUTH
  | typeof LEVEL_DESIGN_CELL_SPACE
  | typeof LEVEL_DESIGN_CELL_WALL
  | typeof LEVEL_DESIGN_CELL_EAST_WEST_CORRIDOR
  | typeof LEVEL_DESIGN_CELL_NORTH_SOUTH_CORRIDOR
  ;

const MIN_CORRIDOR_LENGTH = 2;
const MAX_UPWARD_STAIRS = 3;

const levelCreate = (width: number, height: number): Level => {
  const tiles = array3New<Tile>(width, height, 1, () => {
    const entities: Record<EntityId, Entity> = {};      
    return {
      cell: LEVEL_DESIGN_CELL_WALL,
      entities,
    };
  });
  const level: Level = {
    dimensions: [width, height, 1],
    tiles,
  };
  levelPopulate(level, [0, 0, 0], [width, height, 1]);
  return level;
};

const levelAppendLayers = (level: Level, layers: number, startingX?: number, startingY?: number) => {

  const [width, height, depth] = level.dimensions;

  // add corridors
  for (let i=0; i<layers; i++) {
    const z = depth + i;

    // look below for any up stairs
    const downHoles: [number, number, Orientation?][] = [];
    if (startingX && z == 1) {
      downHoles.push([startingX, startingY]);
    }  
    for (let x=0; x<width; x++) {
      for (let y=0; y<height; y++) {
        const tile = level.tiles[x][y][z - 1];
        if (tile.cell <= LEVEL_DESIGN_CELL_STAIR_SOUTH) {
          downHoles.push([x, y, tile.cell as Orientation]);
        }
      }
    }

    for (let x=0; x<width; x++) {
      for (let y=0; y<height; y++) {
        level.tiles[x][y].push({
          cell: LEVEL_DESIGN_CELL_WALL,
          entities: {},
        });
      }
    }
    let excessCorridorTiles = (width * height / 4 + z) | 0;
    let orientation: Orientation = ORIENTATION_EAST;
    let failedAttempts = 0;
    let upwardStairs = 0;
    while ((excessCorridorTiles > 0 || !upwardStairs) && failedAttempts < 99) {
      failedAttempts++;

      let sx: number;
      let sy: number;
      if (downHoles.length) {
        [sx, sy, orientation = ORIENTATION_EAST] = downHoles[0];
      }
      const [dx, dy] = ORIENTATION_OFFSETS[orientation];
      if (!downHoles.length) {
        sx = Math.random() * width | 0;
        sy = Math.random() * height | 0;
      } else {
        // open up a space one tile back to give head room
        sx -= dx;
        sy -= dy;
      }
      const maxCorridorLength = Math.max(0, dx) * (width - sx - 1)
          + Math.max(0, -dx) * (sx)
          + Math.max(0, dy) * (height - sy - 1)
          + Math.max(0, -dy) * (sy);
      
      if (maxCorridorLength >= MIN_CORRIDOR_LENGTH) {
        // round up
        const corridorLength = (Math.random() * (maxCorridorLength - MIN_CORRIDOR_LENGTH) | 0) + MIN_CORRIDOR_LENGTH + 1;
        const targetCellType = LEVEL_DESIGN_CELL_EAST_WEST_CORRIDOR + (orientation % 2);
        const oppositeCellType = LEVEL_DESIGN_CELL_EAST_WEST_CORRIDOR + ((orientation + 1) % 2);
        // ensure the corridor does not sit adjacent to, or atop, any other corridors
        const fill = new Array(corridorLength).fill(0);
        const adjacency =  fill.map<number>(( _, i) => {
          const x = sx + i * dx;
          const y = sy + i * dy;
          const leftX = x + dy;
          const leftY = y - dx;
          const rightX = x - dy;
          const rightY = y + dx;
          return ([[x, y], [leftX, leftY], [rightX, rightY]] as const).reduce<number>((acc, [x, y], i) => {
            if (acc >= 0) {
              if (x >= 0 && x < width && y >= 0 && y < height) {
                const cell = level.tiles[x][y][z].cell;
                if (cell == oppositeCellType) {
                  acc = 1;
                } else if (!i && cell != LEVEL_DESIGN_CELL_WALL || cell == targetCellType) {
                  acc = -1;
                }
              }
            }
            return acc;
          }, 0);
        });
        // only allow one adjacent, contiguous corridor, force the corridors to intersect 
        // or to connect to a stairway
        if (adjacency.every(v => v >= 0) && (adjacency.some(v => v > 0) || upwardStairs && upwardStairs < MAX_UPWARD_STAIRS ) || downHoles.length) {
          failedAttempts = 0;

          const downHole = downHoles.shift();

          // create the corridor
          fill.forEach((_, i) => {
            const x = sx + i * dx;
            const y = sy + i * dy;
            level.tiles[x][y][z].cell = i < 2 && downHole?.[2] != null
                ? LEVEL_DESIGN_CELL_SPACE
                : targetCellType as LevelDesignCell;
          });

          // (maybe) put in a up stair if there are no intersections at the end of this corridor 
          const stairX = sx + dx * (corridorLength - 1);
          const stairY = sy + dy * (corridorLength - 1);

          if (
              !downHole
              && corridorLength > 2
              && adjacency.slice(-2).every(i => i == 0)
              && upwardStairs < MAX_UPWARD_STAIRS
              && (dx && stairX >= MIN_CORRIDOR_LENGTH && stairX < width - MIN_CORRIDOR_LENGTH
                  || dy && stairY >= MIN_CORRIDOR_LENGTH && stairY < height - MIN_CORRIDOR_LENGTH
              )
          ) {
            // add in a up stair at the end of the corridor
            level.tiles[stairX][stairY][z].cell = orientation;
            upwardStairs++;
          }

          excessCorridorTiles -= corridorLength;
          orientation = (orientation + 1)%4 as Orientation;
        }
      }
    }
  }
  // grow
  level.dimensions = [width, height, depth + layers];
  levelPopulate(level, [0, 0, depth], [width, height, layers]);
};

const levelPopulate = (level, position, dimensions) => {
  levelIterateInBounds(level, position, dimensions, (tile: Tile, ...position: Vector3) => {
    const [x, y, z] = position;
    const cell = tile.cell;

    switch (cell) {
      case LEVEL_DESIGN_CELL_WALL:
        levelAddEntity(level, entityCreate({
          position,
          dimensions: [1, 1, 1],
          body: PART_WALL,
          collisionGroup: COLLISION_GROUP_WALL,
          entityType: ENTITY_TYPE_WALL,
        }));
        break;
      case LEVEL_DESIGN_CELL_STAIR_EAST:
      case LEVEL_DESIGN_CELL_STAIR_NORTH:
      case LEVEL_DESIGN_CELL_STAIR_WEST:
      case LEVEL_DESIGN_CELL_STAIR_SOUTH:
        // staircase
        {
          const stepOrientation = cell as Orientation;
          const stepParts = PART_ORIENTATION_STEPS[stepOrientation];
          const transform = matrix4Multiply(
              matrix4Translate(...position),
              matrix4Translate(.5, .5, 0),
              matrix4Rotate(Math.PI/2 * (stepOrientation + 2), 0, 0, 1),
              //matrix4Translate(-.5, -.5, 0),
          );
          
          stepParts.reduce((z, stepPart, i) => {
            const t = matrix4Multiply(transform, matrix4Translate(-STEP_WIDTH/2 * i, 0, z + STEP_DEPTH/2));
            const [position, dimensions] = shapeBounds(SHAPE_STEPS[i], t);
            const step: Entity = entityCreate({
              entityType: ENTITY_TYPE_STAIR,
              orientation: stepOrientation,
              position,
              dimensions,
              rotation: [0, 0, 0],
              body: stepPart,
              collisionGroup: COLLISION_GROUP_WALL,
            });
            levelAddEntity(level, step);
            return z + dimensions[2];
          }, 0);
        }
        break;
      default:
        //if (cellAbove == LEVEL_DESIGN_CELL_EAST_WEST_CORRIDOR || cellAbove == LEVEL_DESIGN_CELL_NORTH_SOUTH_CORRIDOR) {
          // TODO add in a ceiling
        //}
        break;
    }
  });

  if (FLAG_PRINT_LEVEL) {
    const [width, height, depth] = dimensions;
    const [x, y, z] = position;
    for (let tz = z; tz < z + depth; tz++) {
      console.log(tz);
      const chars: string[] = [];
      for (let ty=height + y; ty>0; ) {
        ty--;
        for (let tx=x; tx<x + width; tx++) {
          const v = level.tiles[tx][ty][tz].cell;
          chars.push('>^<v #-|'.charAt(v));
        }
        chars.push('\n');        
      }
      console.log(chars.join('')); 
    }
  }
};