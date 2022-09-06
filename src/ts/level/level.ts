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
const LEVEL_DESIGN_CELL_FLOOR = 8;

const levelPrintLayer = (level: Level, tz: number) => {
  const [width, height, depth] = level.dimensions;
  const chars: string[] = new Array(level.dimensions[0]).fill(0).map((_, i) => `${i}`).concat('\n');
  chars.unshift(' ');
  for (let ty=height; ty>0; ) {
    ty--;
    chars.push(`${ty}`);
    for (let tx=0; tx<width; tx++) {
      const v = level.tiles[tx][ty][tz].cell;
      chars.push('>^<v #-|_'.charAt(v));
    }
    chars.push('\n');
  }
  console.log(chars.join('')); 
}


type LevelDesignCell = 
  | typeof LEVEL_DESIGN_CELL_STAIR_EAST
  | typeof LEVEL_DESIGN_CELL_STAIR_NORTH
  | typeof LEVEL_DESIGN_CELL_STAIR_WEST
  | typeof LEVEL_DESIGN_CELL_STAIR_SOUTH
  | typeof LEVEL_DESIGN_CELL_SPACE
  | typeof LEVEL_DESIGN_CELL_WALL
  | typeof LEVEL_DESIGN_CELL_EAST_WEST_CORRIDOR
  | typeof LEVEL_DESIGN_CELL_NORTH_SOUTH_CORRIDOR
  | typeof LEVEL_DESIGN_CELL_FLOOR
  ;

const LEVEL_MIN_CORRIDOR_LENGTH = 2;
const LEVEL_MAX_UPWARD_STAIRS = 3;
const LEVEL_MIN_UPWARD_STAIRS = 2;
const LEVEL_GENERATION_MAX_ATTEMPTS = 9;

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
  levelPopulateLayer(level, 0);
  return level;
};

const levelAppendLayers = (level: Level, layers: number, startingX?: number, startingY?: number) => {

  const [width, height, depth] = level.dimensions;

  // add corridors
  for (let i=0; i<layers; i++) {
    const z = depth + i;

    // look below for any up stairs
    let downHoles: [number, number, Orientation?][];

    let excessCorridorTiles: number;
    let orientation: Orientation = ORIENTATION_EAST;
    let remainingAttempts = 0;
    let upwardStairs = 0;
    while (excessCorridorTiles > 0 || upwardStairs < LEVEL_MIN_UPWARD_STAIRS) {
      if (!remainingAttempts) {
        // reset the layer generation and try again
        downHoles = [];
        if (startingX && z == 1) {
          downHoles.push([startingX, startingY]);
        }  
        for (let x=0; x<width; x++) {
          for (let y=0; y<height; y++) {
            const tile = level.tiles[x][y][z - 1];
            level.tiles[x][y][z] = {
              cell: LEVEL_DESIGN_CELL_WALL,
              entities: {},
            };
            if (tile.cell <= LEVEL_DESIGN_CELL_STAIR_SOUTH) {
              downHoles.push([x, y, tile.cell as Orientation]);
            }
          }
        } 
        remainingAttempts = LEVEL_GENERATION_MAX_ATTEMPTS;
        excessCorridorTiles  = (width * height / 4 + z) | 0;
        upwardStairs = 0;
      }
      remainingAttempts--;

      let sx: number;
      let sy: number;
      let originalOrientation = orientation;
      if (downHoles.length) {
        [sx, sy, orientation = ORIENTATION_EAST] = downHoles[0];
        originalOrientation = orientation;
        orientation = ((Math.random() * 4) | 0) as Orientation;
        if (orientation == (originalOrientation + 2) % 4) {
          orientation = originalOrientation;
        }
        // open up a space one tile back to give head room
        level.tiles[sx - ORIENTATION_OFFSETS[originalOrientation][0]][sy - ORIENTATION_OFFSETS[originalOrientation][1]][z].cell = LEVEL_DESIGN_CELL_SPACE;
        level.tiles[sx][sy][z].cell = LEVEL_DESIGN_CELL_SPACE;
        sx += ORIENTATION_OFFSETS[originalOrientation][0];
        sy += ORIENTATION_OFFSETS[originalOrientation][1];
      }
      const [dx, dy] = ORIENTATION_OFFSETS[orientation];
      if (!downHoles.length) {
        sx = Math.random() * width | 0;
        sy = Math.random() * height | 0;
      }
      // one extra because length includes current tile
      const maxCorridorLength = Math.max(0, dx) * (width - sx)
          + Math.max(0, -dx) * (sx + 1)
          + Math.max(0, dy) * (height - sy)
          + Math.max(0, -dy) * (sy + 1);
      
      if (maxCorridorLength >= LEVEL_MIN_CORRIDOR_LENGTH || downHoles.length) {
        const corridorLength = ((1 - Math.pow(Math.random(), 2)) * (maxCorridorLength - LEVEL_MIN_CORRIDOR_LENGTH) | 0) + LEVEL_MIN_CORRIDOR_LENGTH;
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
          const nextX = x + dx;
          const nextY = y + dy;
          return ([[x, y, z - 1], [x, y, z], [leftX, leftY, z], [rightX, rightY, z], [nextX, nextY, z]] as const)
              .reduce<number>((acc, [tx, ty, tz], j) => {
                if (acc >= 0) {
                  if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
                    const cell = level.tiles[tx][ty][tz].cell;
                    if (
                        // do not allow corridors to clobber features 
                        j == 1 && cell != LEVEL_DESIGN_CELL_WALL && cell != oppositeCellType
                        // do not allow corridors traveling in the same direction to be adjacent
                        || cell == targetCellType
                        // do not allow corridors to be adjacent to stairs (above is fine)
                        // (TODO unless stair is facing tile)
                        || j && cell <= LEVEL_DESIGN_CELL_STAIR_SOUTH
                    ) {
                      acc = -1;                      
                    } else if (cell == oppositeCellType) {
                      acc = Math.max(acc, z - tz + 1);
                    } else if (!j && cell == LEVEL_DESIGN_CELL_SPACE) {
                      // holes are not guaranteed to be only one wide, so we need to put a floor over them
                      acc = Math.max(acc, 3);
                    }
                  } else if (j < 2) {
                    // don't care if edges are out of bounds
                    acc = -1;
                  }
                }
                return acc;
              }, 0);
        });
        // only allow one adjacent, contiguous corridor, force the corridors to intersect 
        // or to connect to a stairway
        const connected = adjacency.some(v => v == 1);
        if (adjacency.every(v => v >= 0)
            && (
                connected
                //|| upwardStairs && upwardStairs < LEVEL_MAX_UPWARD_STAIRS
                || downHoles.length
            )
        ) {
          remainingAttempts = LEVEL_GENERATION_MAX_ATTEMPTS;

          const downHole = downHoles.shift();

          // create the corridor
          adjacency.forEach((a, i) => {
            const x = sx + i * dx;
            const y = sy + i * dy;
            const cell = a == 3 || a > 1 && downHole && !i
                // always cover up holes
                ? LEVEL_DESIGN_CELL_FLOOR
                : !i && downHole?.[2] != null
                    ? LEVEL_DESIGN_CELL_SPACE
                    : targetCellType as LevelDesignCell;
            level.tiles[x][y][z].cell = cell;
          });

          // (maybe) put in a up stair if there are no intersections at the end of this corridor 
          const stairX = sx + dx * (corridorLength - 2);
          const stairY = sy + dy * (corridorLength - 2);

          if (
              (!downHole || Math.random() > .9)
              && corridorLength > 3
              && adjacency.slice(-2).every(i => i == 0)
              && adjacency[corridorLength - 3] < 2
              && upwardStairs < LEVEL_MAX_UPWARD_STAIRS
              && (
                  dx < 0 && stairX >= LEVEL_MIN_CORRIDOR_LENGTH 
                  || dx > 0 && stairX < width - LEVEL_MIN_CORRIDOR_LENGTH
                  || dy < 0 && stairY >= LEVEL_MIN_CORRIDOR_LENGTH 
                  || dy > 0 && stairY < height - LEVEL_MIN_CORRIDOR_LENGTH
              )
          ) {
            // add in a up stair at the end of the corridor
            level.tiles[stairX][stairY][z].cell = orientation;
            // ensure there is a wall afterward
            level.tiles[sx + dx * (corridorLength - 1)][sy + dy * (corridorLength - 1)][z].cell = LEVEL_DESIGN_CELL_WALL;
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
  new Array(layers).fill(0).map((_, dz) => levelPopulateLayer(level, depth + dz));
};

const levelPopulateLayer = (level: Level, layer: number) => {
  const [width, height] = level.dimensions;

  const validEnemies: Entity[] = [];
  const validTreasure: Entity[] = [];

  levelIterateInBounds(level, [0, 0, layer], [width, height, 1], (tile: Tile, ...position: Vector3) => {
    const [x, y, z] = position;

    let layerTorches = 0;

    const adjacentWalls: Orientation[] = [];
    let stairsIncoming: Booleanish = 0;
    for (let dz = 0; dz < 2; dz++) {
      const tz = z - dz;
      for (let orientation = 0; orientation < 4; orientation++) {
        const [dx, dy] = ORIENTATION_OFFSETS[orientation];
        const tx = x + dx;
        const ty = y + dy;
        if (tx >= 0
            && tx < width
            && ty >= 0
            && ty < height
            && tz >= 0
        ) {
          const cell = level.tiles[tx][ty][tz].cell;
          if (!dz && cell == LEVEL_DESIGN_CELL_WALL) {
            adjacentWalls.push(orientation as Orientation);
          }
          stairsIncoming = stairsIncoming || dz && (cell == (orientation + 2) % 4);
        }
      }  
    }

    const cell = tile.cell;
    const cellBelow = z > 0 && level.tiles[x][y][z - 1].cell;
    const hasFloor = cell == LEVEL_DESIGN_CELL_FLOOR 
        || cellBelow == LEVEL_DESIGN_CELL_WALL
        && (cell == LEVEL_DESIGN_CELL_EAST_WEST_CORRIDOR
            || cell == LEVEL_DESIGN_CELL_NORTH_SOUTH_CORRIDOR
            || cell == LEVEL_DESIGN_CELL_SPACE);

    if (hasFloor && adjacentWalls.length == 3) {
      // club
      const clubSize = Math.random() * Math.min(z, PARTS_CLUBS.length) | 0;
      const maxHealth = 40 + clubSize * 10;
      const clubBody = PARTS_CLUBS[clubSize];
      const clubShape = shapes[clubBody.modelId];
      const [_, dimensions] = shapeBounds(clubShape, 0, 1);
      const club: Entity<ClubPartId> = entityCreate({
        body: clubBody,
        dimensions,
        position, 
        entityType: ENTITY_TYPE_ITEM,
        rotation: [0, 0, Math.PI * 2 * Math.random()],
        //velocity: [0, 0, 0],
        health: maxHealth,
        maxHealth,
        collisionGroup: COLLISION_GROUP_ITEM,
        collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_ITEM,
      }, 1);
      validTreasure.push(club);
    }

    // torch
    if (hasFloor
        && adjacentWalls.length
        && stairsIncoming
        // at least one torch per level
        && (!layerTorches || Math.random() > (layer - 3)/layer)
    ) {
      const orientation = adjacentWalls[Math.random() * adjacentWalls.length | 0];
      const [dx, dy] = ORIENTATION_OFFSETS[orientation];
      const t = matrix4Translate(x + .5 + dx/2.1, y + .5 + dy/2.1, z + .5);
      const [position, dimensions] = shapeBounds(shapes[MODEL_TORCH_HANDLE], t, 1);
      const torch: Entity<TorchPartId> = entityCreate({
        body: PART_TORCH,
        entityType: ENTITY_TYPE_TORCH,
        position,
        dimensions,
        collisionGroup: COLLISION_GROUP_ITEM,
        collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_ITEM,
        // TODO x rotation (but it interferes with z rotation)
        rotation: [-Math.PI/3 * dy, Math.PI/3 * dx, (orientation + 2) * Math.PI/2],
        // velocity: [0, 0, 0], intentionally have no velocity so we sit on the wall
        health: TORCH_MAX_HEALTH,
        maxHealth: TORCH_MAX_HEALTH,
        joints: [{
          rotation: [0, 0, 0],
        }, {
          rotation: [0, 0, 0],
          light: TORCH_BRIGHTNESS,
        }],
      });
      levelAddEntity(level, torch);
      layerTorches++;
    }
    if (hasFloor && adjacentWalls.length < 3) {
      const maxHealth = 3;
      
      // don't face the wall
      const orientation = ORIENTATIONS.find(o => adjacentWalls.indexOf(o) < 0);
      const enemy: Entity<SkeletonPartId> = entityCreate({
        position,
        dimensions: [SKELETON_DIMENSION, SKELETON_DIMENSION, SKELETON_DEPTH],
        orientation,
        body: PART_SKELETON_BODY,
        entityType: ENTITY_TYPE_HOSTILE,
        acc: .005,
        velocity: [0, 0, 0],
        rotation: [0, 0, orientation * Math.PI/2],
        health: maxHealth,
        maxHealth,
        collisionGroup: COLLISION_GROUP_MONSTER,
        collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_MONSTER,
      }, 1);
      enemy.joints[SKELETON_PART_ID_HEAD].light = SKELETON_GLOW;
      validEnemies.push(enemy);   
    }

    switch (cell) {
      case LEVEL_DESIGN_CELL_WALL:
        levelAddEntity(level, entityCreate({
          position,
          dimensions: [1, 1, 1],
          body: PART_WALL,
          collisionGroup: COLLISION_GROUP_WALL,
          entityType: ENTITY_TYPE_WALL,
          rotation: new Array(3).fill(0).map(() => (Math.random() * 4 | 0) * Math.PI/2) as Vector3,
        }));
        break;
      case LEVEL_DESIGN_CELL_FLOOR:
        {
          // reuse the bottom step
          const step: Entity = entityCreate({
            entityType: ENTITY_TYPE_WALL,
            position: [x, y, z - STEP_DEPTH],
            dimensions: [1, 1, STEP_DEPTH],
            rotation: [0, 0, 0],
            body: PART_ORIENTATION_STEPS[0][0],
            collisionGroup: COLLISION_GROUP_WALL,
          });
          levelAddEntity(level, step);
        }
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

  ([[validEnemies, Math.sqrt(layer) - 1], [validTreasure, 3]] as const).forEach(([entities, quantity], i) => {
    while (quantity > 0 && entities.length) {
      const index = Math.random() * entities.length | 0;
      const [entity] = entities.splice(index, 1);
      levelAddEntity(level, entity);
      quantity--;
      console.log(i, entity.position);
    }
  });

  if (FLAG_PRINT_LEVEL) {
    console.log(layer);
    levelPrintLayer(level, layer);
  }
};
