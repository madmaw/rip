type Level = {
  dimensions: Vector3,
  tiles: Tile[][][],
};

type Tile = {
  entities: Record<EntityId, Entity>,
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
