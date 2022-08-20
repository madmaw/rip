type Level = {
  dimensions: Vector3,
  tiles: Tile[][][],
};

type Tile = Record<EntityId, Entity>;

const levelIterateInBounds = (
    level: Level,
    position: Vector3, 
    imensions: Vector3,
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
    imensions: Vector3,
    f: (entity: Entity) => void,
) => {
  const iteratedEntities: Record<EntityId, Truthy> = {};
  levelIterateInBounds(level, position, dimensions, tile => {
    for (let entityId in tile) {
      if (!iteratedEntities[entityId]) {
        const entity = tile[entityId];
        f(entity);
        iteratedEntities[entityId] = 1;
      }
    }
  });
};

const levelAddEntity = (level: Level, entity: Entity) => levelIterateInBounds(
    level,
    entity.position,
    entity.dimensions,
    tile => tile[entity.id] = entity,
);
const levelRemoveEntity = (level: Level, entity: Entity) => levelIterateInBounds(
    level,
    entity.position,
    entity.dimensions,
    tile => delete tile[entity.id],
);
