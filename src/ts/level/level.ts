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
        const area = rect3Intersection(pos, [1, 1, 1], entity['p'], entity.dimensions).reduce(
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
      const zOffset = orientation == fromSalientFeature?.oriented
          && fromSalientFeature?.entityType == ENTITY_TYPE_STAIR
          ? 1
          : 0;
      const toPos = fromPos.map((v, i) => v + offset[i]);
      // to position is in bounds
      if (!toPos.some((v, i) => v < 0 || v >= level.dimensions[i])) {
        const [toX, toY, originalTpZ] = toPos;
        const startingZ = originalTpZ + zOffset
        for (let toZ = startingZ; toZ >= 0; toZ--) {
          const toSalientFeature = salientFeatures[toX][toY][toZ];
          if (toZ == startingZ && toSalientFeature) {
            // way is maybe blocked
            if (toSalientFeature.entityType == ENTITY_TYPE_STAIR && toSalientFeature.oriented == orientation) {
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
      (v, i) => Math.min(v + dimensions[i] + 1 | 0, level.dimensions[i])
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
        if (!rect3Intersection(position, dimensions, entity['p'], entity.dimensions).some(v => v < 0)) {
          f(entity, ...pos);
        }
        iteratedEntities[entityId] = 1;
      }
    }
  });
};

const levelAddEntity = (level: Level, entity: Entity) => levelIterateInBounds(
    level,
    entity['p'],
    entity.dimensions,
    tile => tile.entities[entity.id] = entity,
);
const levelRemoveEntity = (level: Level, entity: Entity) => levelIterateInBounds(
    level,
    entity['p'],
    entity.dimensions,
    tile => {
      delete tile.entities[entity.id]
    },
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
const LEVEL_DESIGN_CELL_OUT_OF_BOUNDS = 9;
const LEVEL_DESIGN_CELL_LANDING = 10;

const levelPrintLayer = (level: Level, tz: number) => {
  const [width, height, depth] = level.dimensions;
  const chars: string[] = new Array(level.dimensions[0]).fill(0).map((_, i) => `${i}`).concat('\n');
  chars.unshift(' ');
  for (let ty=height; ty>0; ) {
    ty--;
    chars.push(`${ty}`);
    for (let tx=0; tx<width; tx++) {
      const v = level.tiles[tx][ty][tz].cell;
      chars.push('>^<v #-|+'.charAt(v));
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
  | typeof LEVEL_DESIGN_CELL_OUT_OF_BOUNDS
  | typeof LEVEL_DESIGN_CELL_LANDING
  ;

const LEVEL_MIN_CORRIDOR_LENGTH = 2;
const LEVEL_MAX_UPWARD_STAIRS = 3;
const LEVEL_MIN_UPWARD_STAIRS = 2;
const LEVEL_GENERATION_MAX_ATTEMPTS = 9;

const levelCreate = (width: number, height: number): Level => {
  const tiles = array3New<Tile>(width, height, 1, (x, y) => {
    const entities: Record<EntityId, Entity> = {};      
    return {
      cell: x && y && x < width - 1 && y < height - 1
          ? LEVEL_DESIGN_CELL_WALL
          : LEVEL_DESIGN_CELL_SPACE,
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

const levelAppendLayer = (level: Level, startingX?: number | Falsey, startingY?: number) => {

  const [width, height, depth] = level.dimensions;

  // add corridors
  const z = depth;

  // look below for any up stairs
  let downHoles: [number, number, Orientation?][];
  let suggestedStartingPoints: [number, number, Orientation][];

  let excessCorridorTiles: number = 0;
  let orientation: Orientation = ORIENTATION_EAST;
  let remainingAttempts = 0;
  let upwardStairs = 0;
  
  while (excessCorridorTiles > 0 || upwardStairs < LEVEL_MIN_UPWARD_STAIRS) {
    if (!remainingAttempts || excessCorridorTiles < -width * height / 4) {
      // reset the layer generation and try again
      downHoles = [];
      if (startingX && z == 1) {
        downHoles.push([startingX, startingY]);
      }  
      for (let x=0; x<width; x++) {
        for (let y=0; y<height; y++) {
          const tile = level.tiles[x][y][z - 1];
          level.tiles[x][y][z] = {
            cell: x && y && x < width - 1 && y < height - 1
                ? LEVEL_DESIGN_CELL_WALL
                : LEVEL_DESIGN_CELL_SPACE,
            entities: {},
          };
          if (tile.cell <= LEVEL_DESIGN_CELL_STAIR_SOUTH) {
            downHoles.push([x, y, tile.cell as Orientation]);
          }
        }
      } 
      if (FLAG_FAST_LEVEL_GENERATION) {
        suggestedStartingPoints = [];
      }

      remainingAttempts = LEVEL_GENERATION_MAX_ATTEMPTS;
      excessCorridorTiles  = (width * height / 3 - z % width);
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
      level.tiles
          [sx - ORIENTATION_OFFSETS[originalOrientation][0]]
          [sy - ORIENTATION_OFFSETS[originalOrientation][1]]
          [z].cell = LEVEL_DESIGN_CELL_SPACE;
      level.tiles[sx][sy][z].cell = LEVEL_DESIGN_CELL_SPACE;
      sx += ORIENTATION_OFFSETS[originalOrientation][0];
      sy += ORIENTATION_OFFSETS[originalOrientation][1];
    } else {
      if (FLAG_FAST_LEVEL_GENERATION && suggestedStartingPoints.length) {
        [[sx, sy, orientation]] = suggestedStartingPoints.splice(
            Math.random() * suggestedStartingPoints.length | 0, 1,
        );
      } else {
        sx = Math.random() * (width-2) + 1 | 0;
        sy = Math.random() * (height-2) + 1 | 0;  
        orientation = (Math.random() * 4 | 0) as Orientation;
      }
    }
    const [dx, dy] = ORIENTATION_OFFSETS[orientation];
    // one extra because length includes current tile
    const maxCorridorLength = Math.max(0, dx) * (width - 2 - sx)
        + Math.max(0, -dx) * (sx)
        + Math.max(0, dy) * (height - 2 - sy)
        + Math.max(0, -dy) * (sy);
    
    if (maxCorridorLength >= LEVEL_MIN_CORRIDOR_LENGTH || downHoles.length) {
      const corridorLength = ((1 - Math.pow(Math.random(), 4))
          * (maxCorridorLength - LEVEL_MIN_CORRIDOR_LENGTH) | 0) + LEVEL_MIN_CORRIDOR_LENGTH;
      const targetCellType = LEVEL_DESIGN_CELL_EAST_WEST_CORRIDOR + (orientation % 2);
      const oppositeCellType = LEVEL_DESIGN_CELL_EAST_WEST_CORRIDOR + ((orientation + 1) % 2);
      // ensure the corridor does not sit adjacent to, or atop, any other corridors
      let adjacency =  new Array(corridorLength).fill(0).map<number>(( _, i) => {
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
                if (tx > 0 && tx < width-1 && ty > 0 && ty < height-1) {
                  const cell = level.tiles[tx][ty][tz].cell;
                  if (
                      // do not allow corridors to clobber features 
                      j == 1
                          && cell != LEVEL_DESIGN_CELL_WALL
                          && cell != oppositeCellType
                          && cell != LEVEL_DESIGN_CELL_FLOOR
                      // do not allow corridors traveling in the same direction to be adjacent
                      // unless it's the starting point that is adjacent with them
                      || !(j == 1 && i) && cell == targetCellType
                      // do not allow corridors to be adjacent to stairs (above is fine)
                      // (TODO unless stair is facing tile)
                      || j && cell <= LEVEL_DESIGN_CELL_STAIR_SOUTH
                  ) {
                    acc = -1;
                  } else if (cell == oppositeCellType) {
                    acc = Math.max(acc, z - tz + 1);
                  } else if (j && cell == LEVEL_DESIGN_CELL_FLOOR) {
                    // a floor/crossroad implies a connection
                    acc = Math.max(acc, 1);
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
      if (
          // doesn't contain any invalid tiles
          !adjacency.some(v => v < 0)
          // we actually change the state of the level somehow
          && adjacency.some(v => v != 1)
          // and it connects to something
          && (
              adjacency.some(v => v == 1)
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
          const currentCell = level.tiles[x][y][z].cell;
          const cell = currentCell == LEVEL_DESIGN_CELL_FLOOR || a == 3 || a > 1 && downHole && !i
              // always cover up holes
              ? LEVEL_DESIGN_CELL_FLOOR
              : currentCell == oppositeCellType
                  ? LEVEL_DESIGN_CELL_FLOOR
              // : !i && downHole?.[2] != null
              //     ? downHole?.[2]
                  : targetCellType as LevelDesignCell;
          level.tiles[x][y][z].cell = cell;

          if (FLAG_FAST_LEVEL_GENERATION) {
            suggestedStartingPoints.push(
                [x, y, (orientation + 1)%4 as Orientation],
                [x, y, (orientation + 3)%4 as Orientation],
            );
          }
        });

        // (maybe) put in a up stair if there are no intersections at the end of this corridor 
        const stairX = sx + dx * (adjacency.length - 2);
        const stairY = sy + dy * (adjacency.length - 2);

        if (
            (!downHole || Math.random() > .5) 
            && adjacency.length > 3
            // ensure we aren't clobbering a cross corridor
            && !adjacency.slice(-2).some(i => i == 1)
            // ensure there is something flat before the stairs
            && adjacency[adjacency.length - 3] < 2
            && upwardStairs < LEVEL_MAX_UPWARD_STAIRS
            && (
                dx < 0 && stairX > LEVEL_MIN_CORRIDOR_LENGTH 
                || dx > 0 && stairX < width - LEVEL_MIN_CORRIDOR_LENGTH - 1
                || dy < 0 && stairY > LEVEL_MIN_CORRIDOR_LENGTH 
                || dy > 0 && stairY < height - LEVEL_MIN_CORRIDOR_LENGTH - 1
            )
        ) {
          // add in a up stair at the end of the corridor
          level.tiles[stairX][stairY][z].cell = orientation;
          // ensure there is a wall afterward
          level.tiles[sx + dx * (adjacency.length - 1)][sy + dy * (adjacency.length - 1)][z].cell = LEVEL_DESIGN_CELL_WALL;
          // ensure there is a floor before
          level.tiles[sx + dx * (adjacency.length - 3)][sy + dy * (adjacency.length - 3)][z].cell = LEVEL_DESIGN_CELL_FLOOR;
          upwardStairs++;
        }

        excessCorridorTiles -= adjacency.length;
      }
    }
  }
  // grow
  level.dimensions = [width, height, depth + 1];
  levelPopulateLayer(level, z);
};

const levelPopulateLayer = (level: Level, layer: number) => {
  const [width, height] = level.dimensions;

  const validEnemies: Entity[][] = [];
  const validWeapons: Entity[] = [];
  const validTraps: Entity[][] = [];
  const validHealth: Entity[] = [];

  const checkAdjacency = (
      x: number,
      y: number,
      z: number,
      f?: (cell: LevelDesignCell, x: number, y: number, z: number, orientation: Orientation) => Booleanish
  ): [Orientation[], number] => {
    const [width, height] = level.dimensions;
    const orientations: Orientation[] = [];
    let floorDepth = 0;
    if (z >= 0) {
      if (f) {
        for (let orientation = 0; orientation < 4; orientation++) {
          const [dx, dy] = ORIENTATION_OFFSETS[orientation];
          const tx = x + dx;
          const ty = y + dy;
          const cell = tx
              && tx < width-1
              && ty
              && ty < height-1
              ? level.tiles[tx][ty][z].cell
              : LEVEL_DESIGN_CELL_OUT_OF_BOUNDS;
          if (f(cell, tx, ty, z, orientation as Orientation)) {
            orientations.push(orientation as Orientation);
          }
        }  
      }
  
      const cell = level.tiles[x][y][z].cell;
      let cellBelow: LevelDesignCell = cell;
      let cellAbove: LevelDesignCell = LEVEL_DESIGN_CELL_SPACE;
      while (
          cellAbove != LEVEL_DESIGN_CELL_FLOOR
          && cellBelow != LEVEL_DESIGN_CELL_WALL
          && floorDepth < z
      ) {
        cellAbove = cellBelow;
        floorDepth++;
        cellBelow = level.tiles[x][y][Math.max(0, z - floorDepth)].cell;
      };
      if (cellAbove <= LEVEL_DESIGN_CELL_STAIR_SOUTH) {
        // stairs count as a half level
        floorDepth -= .5;
      }
    }
    return [orientations, floorDepth];
  };

  const layerVariant = layer / LEVEL_LAYER_CHUNK_SIZE | 0;

  levelIterateInBounds(level, [1, 1, layer], [width-2, height-2, 1], (tile: Tile, ...position: Vector3) => {
    const [x, y, z] = position;

    let layerTorches = 0;
    
    const [blockedOrientations, floorDepth] = checkAdjacency(
        ...position,
        cell => cell == LEVEL_DESIGN_CELL_WALL || cell == LEVEL_DESIGN_CELL_OUT_OF_BOUNDS,
    );

    let validEnemy: Entity[];
    if (floorDepth == 1 && blockedOrientations.length < 3) {
      let variant = (1 - Math.pow(Math.random(), layerVariant)) * (layerVariant + 1) | 0;
      const scale = .8 + Math.min(4, variant | 0) * .2;
      const maxHealth = 3 + variant * 2;
      
      // don't face the wall
      const orientation = ORIENTATIONS.find(o => blockedOrientations.indexOf(o) < 0);
      const enemy: Entity<SkeletonPartId> = entityCreate({
        ['p']: position,
        dimensions: [SKELETON_DIMENSION * scale, SKELETON_DIMENSION * scale, SKELETON_DEPTH * scale],
        oriented: orientation,
        entityBody: PART_SKELETON_BODY,
        entityType: ENTITY_TYPE_MONSTER,
        acc: .005,
        velocity: [0, 0, 0],
        ['r']: [0, 0, orientation * CONST_PI_ON_2_1DP],
        health: maxHealth,
        maxHealth,
        collisionGroup: COLLISION_GROUP_MONSTER,
        collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_MONSTER,
        scaled: scale,
      }, 1);
      enemy.joints[SKELETON_PART_ID_HEAD].light = SKELETON_GLOW;
      validEnemies.push(validEnemy = [enemy]);   
    }

    if (floorDepth == 1 && blockedOrientations.length > 2 || validEnemy) {
      // weapon
      if (!validEnemy || Math.random() > (layer-2)/layer){
        const variant = Math.min(2, Math.random() * layerVariant | 0);
        let weapon: Entity;
        const weaponScale = .8 + Math.random() * z/9;
        if (!FLAG_SPEARS_AS_LOOT || Math.random() > .2) {
          const maxHealth = 5 + weaponScale * 3 * (variant+1);
          const dimensions = new Array(3).fill(
              CLUB_RADIUS_RIGHT * weaponScale,
          ) as Vector3;
          weapon = entityCreate<ClubPartId>({
            entityBody: CLUB_BODY,
            scaled: weaponScale,
            dimensions,
            ['p']: position, 
            entityType: ENTITY_TYPE_ITEM,
            ['r']: [0, 0, CONST_PI_0DP * 2 * Math.random()],
            maxHealth,
            health: maxHealth,
            collisionGroup: COLLISION_GROUP_ITEM,
            collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_ITEM,
            variantIndex: variant,
          }, 1);
        } else {
          const maxHealth = 3 + variant * 3 * (variant+1);
          weapon = entityCreate<SpearPartId>({
            entityBody: SPEAR_PART,
            dimensions: [SPEAR_RADIUS * 2 * weaponScale, SPEAR_RADIUS * 2 * weaponScale, SPEAR_RADIUS * 2 * weaponScale],
            collisionGroup: COLLISION_GROUP_ITEM,
            entityType: ENTITY_TYPE_ITEM,
            ['p']: position,
            ['r']: [0, 0, CONST_2_PI_0DP * Math.random()],
            scaled: weaponScale,
            maxHealth,
            health: maxHealth,
            collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_ITEM,
            variantIndex: variant,
          }, 1);
        }
        (validEnemy || validWeapons).push(weapon);
      }
      // bottle
      if (!validEnemy || Math.random() < .03) {
        const maxHealth = 2;
        const bottle: Entity<BottlePartId> = entityCreate({
          entityBody: BOTTLE_PART_BODY,
          collisionGroup: COLLISION_GROUP_ITEM,
          dimensions: [BOTTLE_RADIUS*2, BOTTLE_RADIUS*2, BOTTLE_RADIUS*2],
          ['p']: position,
          entityType: ENTITY_TYPE_ITEM,
          ['r']: [0, -CONST_PI_ON_2_1DP, 0],
          health: maxHealth,
          maxHealth,
          collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_ITEM,
        }, 1);
        bottle.joints[0].light = .25;
        (validEnemy || validHealth).push(bottle);
      }
    }

    const [invalidPitOrientations] = checkAdjacency(
        x, y, z - 1,
        // the adjacent tiles don't have holes or stairs
        (cell, x, y, z) => cell <= LEVEL_DESIGN_CELL_STAIR_SOUTH || cell != LEVEL_DESIGN_CELL_OUT_OF_BOUNDS && checkAdjacency(x, y, z)[1] > 1,
    );
    if (floorDepth == 2 && !invalidPitOrientations.length) {
      // pit trap
      const maxHealth = 3;
      validTraps.push(new Array(9).fill(0).map(() => {
        const position: Vector3 = [x + Math.random(), y + Math.random(), z - 1 + Math.random() * SPEAR_LENGTH/2];
        return entityCreate<SpearPartId>({
          entityBody: SPEAR_PART,
          dimensions: [SPEAR_RADIUS * 2, SPEAR_RADIUS * 2, SPEAR_RADIUS * 2],
          collisionGroup: COLLISION_GROUP_MONSTER,
          entityType: ENTITY_TYPE_SPIKE,
          ['p']: position,
          ['r']: [CONST_PI_ON_6_1DP - CONST_PI_ON_3_0DP * Math.random(), -CONST_PI_ON_2_1DP, 0],
          //rotated: [0, -CONST_PI_ON_2_1DP, 0],
          health: maxHealth,
          maxHealth,
          collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_MONSTER,
        });      
      }));
    }

    // torch
    const [adjacentWalls] = checkAdjacency(...position, cell => cell == LEVEL_DESIGN_CELL_WALL);
    const [incomingStairs] = checkAdjacency(x, y, z-1, (cell, x, y, z, orientation) => cell == (orientation + 2)%4);
    if (floorDepth == 1
        && adjacentWalls.length
        && incomingStairs.length
        // at least one torch per level
        && (!FLAG_DWINDILING_TORCHES || (!layerTorches || Math.random() > (layer - 3)/layer))
    ) {
      const orientation = adjacentWalls[Math.random() * adjacentWalls.length | 0];
      const [dx, dy] = ORIENTATION_OFFSETS[orientation];
      const position: Vector3 = [x + .5 + dx/2.2 - TORCH_HANDLE_WIDTH/2, y + .5 + dy/2.2 - TORCH_HANDLE_WIDTH/2, z + .5];
      const dimensions: Vector3 = [TORCH_HANDLE_WIDTH, TORCH_HANDLE_WIDTH, TORCH_HEAD_RADIUS * 2];
      const torch: Entity<TorchPartId> = entityCreate({
        entityBody: PART_TORCH,
        entityType: ENTITY_TYPE_TORCH,
        ['p']: position,
        dimensions,
        collisionGroup: COLLISION_GROUP_ITEM,
        collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_ITEM,
        // TODO x rotation (but it interferes with z rotation)
        ['r']: [-CONST_PI_ON_3_0DP * dy, CONST_PI_ON_3_0DP * dx, (orientation + 2) * CONST_PI_ON_2_1DP],
        // velocity: [0, 0, 0], intentionally have no velocity so we sit on the wall
        health: TORCH_MAX_HEALTH,
        maxHealth: TORCH_MAX_HEALTH,
        joints: [{
          ['r']: [0, 0, 0],
        }, {
          ['r']: [0, 0, 0],
          light: TORCH_BRIGHTNESS,
        }],
      });
      levelAddEntity(level, torch);
      if (FLAG_DWINDILING_TORCHES) {
        layerTorches++;
      }
    }

    const cell = level.tiles[x][y][z].cell;
    if (cell == LEVEL_DESIGN_CELL_WALL) {
      levelAddEntity(level, entityCreate({
        ['p']: position,
        dimensions: [1, 1, 1],
        entityBody: PART_WALL,
        collisionGroup: COLLISION_GROUP_WALL,
        entityType: ENTITY_TYPE_WALL,
        ['r']: new Array(3).fill(0).map(() => (Math.random() * 4 | 0) * CONST_PI_ON_2_2DP) as Vector3,
        variantIndex: layerVariant,
      }));
    } else if (cell == LEVEL_DESIGN_CELL_FLOOR) {
      // floor just refers to needing a surface, doesn't
      // mean it actually exists
      if (z && level.tiles[x][y][z - 1].cell != LEVEL_DESIGN_CELL_WALL) {
        // reuse the bottom step
        const step: Entity = entityCreate({
          entityType: ENTITY_TYPE_WALL,
          ['p']: [x, y, z - STEP_DEPTH],
          dimensions: [1, 1, STEP_DEPTH],
          ['r']: [0, 0, 0],
          entityBody: PART_STEPS[0],
          collisionGroup: COLLISION_GROUP_WALL,
          variantIndex: layerVariant,
        });
        levelAddEntity(level, step);
      }
    } else if (cell <= LEVEL_DESIGN_CELL_STAIR_SOUTH) {
      const stepOrientation = cell as Orientation;
      const stepParts = PART_STEPS;
      const zAngle = CONST_PI_ON_2_2DP * (stepOrientation + 2);
      
      stepParts.reduce((z, stepPart, i) => {
        const d = 1 - STEP_WIDTH * i;
        let dimensions: Vector3 = [d, 1, STEP_DEPTH];
        if (stepOrientation % 2) {
          dimensions = [dimensions[1], dimensions[0], dimensions[2]];
        }
        const step: Entity = entityCreate({
          entityType: ENTITY_TYPE_STAIR,
          oriented: stepOrientation,
          ['p']: [
            position[0] + (stepOrientation == ORIENTATION_EAST ? 1 - d : 0),
            position[1] + (stepOrientation == ORIENTATION_NORTH ? 1 - d : 0),
            position[2] + z,
          ],
          dimensions,
          ['r']: [0, 0, zAngle],
          entityBody: stepPart,
          collisionGroup: COLLISION_GROUP_WALL,
          variantIndex: layerVariant,
        });
        levelAddEntity(level, step);
        return z + dimensions[2];
      }, 0);
    }
  });

  
  const populatedTiles = array3New<Booleanish>(width, height, 1);
  ([
    [validEnemies, Math.sqrt(layer) - 1],
    [validWeapons, Math.min(layer, 3)],
    [validHealth, (layer+1) % 2],
    [validTraps, (layer-3)/2],
  ] as const).forEach(([entities, quantity], i) => {
    while (quantity > 0 && entities.length) {
      const index = Math.random() * entities.length | 0;
      const tileEntities = entities.splice(index, 1);
      // flat because this could be one or an array
      const flatTileEntities = tileEntities.flat();
      const e = flatTileEntities[0];

      // avoid collisions
      const populatedTile = populatedTiles[e['p'][0] | 0][e['p'][1] | 0];
      // traps can have collisions
      if (!populatedTile[0] || i == 3) {
        flatTileEntities.forEach(e => {
          levelAddEntity(level, e);
        });
        populatedTile[0] = 1;  
      }
      quantity--;
    }
  });

  if (FLAG_PRINT_LEVEL) {
    console.log(layer);
    levelPrintLayer(level, layer);
  }
};
