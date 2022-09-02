const ORIENTATION_EAST = 0;
const ORIENTATION_NORTH = 1;
const ORIENTATION_WEST = 2;
const ORIENTATION_SOUTH = 3;

type Orientation = 
    | typeof ORIENTATION_EAST
    | typeof ORIENTATION_NORTH
    | typeof ORIENTATION_WEST
    | typeof ORIENTATION_SOUTH;

const ORIENTATIONS: Orientation[] = [
  ORIENTATION_EAST,
  ORIENTATION_NORTH,
  ORIENTATION_WEST,
  ORIENTATION_SOUTH,
];

// action ids are also masks
const ACTION_ID_IDLE = 1;
const ACTION_ID_WALK = 2;
const ACTION_ID_WALK_BACKWARD = 4;
const ACTION_ID_TURN = 8;
const ACTION_ID_JUMP = 16;
const ACTION_ID_RUN = 32;
const ACTION_ID_FALL = 64;
const ACTION_ID_DUCK = 128;
const ACTION_ID_ATTACK_LIGHT = 256;
const ACTION_ID_ATTACK_HEAVY = 512;

type ActionId = 
    | typeof ACTION_ID_TURN
    | typeof ACTION_ID_IDLE 
    | typeof ACTION_ID_WALK
    | typeof ACTION_ID_WALK_BACKWARD
    | typeof ACTION_ID_JUMP
    | typeof ACTION_ID_RUN
    | typeof ACTION_ID_FALL
    | typeof ACTION_ID_DUCK
    | typeof ACTION_ID_ATTACK_LIGHT
    | typeof ACTION_ID_ATTACK_HEAVY
    ;

type EntityId = number;

type Entity<T extends number = number> = EntityBase<T> & (Immovable | Moveable) & (Active | Inactive);

type PartialEntity<T extends number> = Omit<Entity<T>, 'id' | 'joints'> & { joints?: Joint[] };

type CollisionGroup =
    | typeof COLLISION_GROUP_WALL
    | typeof COLLISION_GROUP_MONSTER
    | typeof COLLISION_GROUP_ITEM
    ;

const COLLISION_GROUP_WALL = 1;
const COLLISION_GROUP_MONSTER = 2;
const COLLISION_GROUP_ITEM = 4;

type EntityBase<T extends number> = {
  readonly id: EntityId,
  position: Vector3,
  offset?: Vector3,
  offsetAnim?: Anim | Falsey,
  readonly dimensions: Vector3,
  readonly body: EntityBody<T>,
  joints: Joint[],
  previousCollision?: {
    maxIntersectionArea: number,
    maxOverlapIndex: number,
    maxCollisionEntity: Entity,
    worldTime: number,
  },
  lastZCollision?: number,
  collisionGroup: CollisionGroup,
  collisionMask?: number,
} & Pick<Joint, 'rotation' | 'anim' | 'animAction'>;

type Immovable = {
  velocity?: never,
};

type Moveable = MoveableBase;

type MoveableBase = {
  velocity: Vector3,
};

type Active = Oriented & {
  acc: number,
};

type Inactive = {
  orientation?: never,
  acc?: never,
}

type Oriented = {
  orientation: Orientation,
};

type EntityBodyPartAnimationSequence = [
  // rotations
  Vector3[],
  // required
  Booleanish?,
  // easing to use 
  Easing?,
];

type EntityBodyAnimation<ID extends number> = {
  maxSpeed: number,
  // mask of blocked action ids
  blockActions?: number,
  sequences: Partial<Record<ID, EntityBodyPartAnimationSequence>>[],
  translate?: Vector3,
};

type EntityBody<ID extends number> = Part<ID> & {
  anims?: Partial<Record<ActionId, EntityBodyAnimation<ID>>>,
  defaultJointRotations?: Record<ID, Vector3> & Vector3[],
}

type Part<ID extends number> = {
  readonly id: ID,
  readonly preRotationTransform?: Matrix4 | Falsey,
  readonly postRotationTransform?: Matrix4 | Falsey,
  readonly modelId: ModelId,
  readonly textureId?: TextureId,
  readonly children?: readonly Part<ID>[],
  // and where is this part held when carried
  readonly jointAttachmentHeldTransform?: Matrix4 | Falsey,
  // when picked up, what does this attach to
  readonly jointAttachmentHolderPartId?: number,
  // where do we hold if this is the holder
  readonly jointAttachmentHolderTransform?: Matrix4 | Falsey,
  // what actions do we confer to the holder
  readonly jointAttachmentHolderAnims?: Partial<Record<ActionId, EntityBodyAnimation<number>>>,
};

type Joint = {
  rotation: Vector3,
  //cachedTransform?: Matrix4 | Falsey,
  attachedEntity?: Entity | Falsey,
  anim?: Anim | Falsey,
  animAction?: ActionId | 0,
  animActionIndex?: number,
  // how much light the associated part emits (default to none)
  light?: number,
  // the transform used for the related body part when last rendered against the light from
  // a given entity (for shadows)
  entityLightTransforms?: Record<EntityId, Vector3>,
};

const entityIterateParts = <PartId extends number, EntityType extends PartialEntity<PartId>>(
  f: (entity: EntityType, part: Part<PartId>, transform: Matrix4, joint?: Joint) => void,
  entity: EntityType,
  part: Part<PartId>,
  inheritedTransform?: Matrix4 | Falsey,
) => {
  const joint = entity.joints?.[part.id];
  let rotationTransform = joint && matrix4RotateInOrder(...joint.rotation);
  const transform = matrix4Multiply(
      inheritedTransform,
      part.preRotationTransform,
      rotationTransform,
      part.postRotationTransform,
  );
  f(entity, part, transform, joint)
  part.children?.forEach(child => {
    entityIterateParts(f, entity, child, transform);
  });
  if (joint?.attachedEntity) {
    entityIterateParts(
        f,
        joint.attachedEntity as any,
        joint.attachedEntity.body,
        matrix4Multiply(
            transform,
            part.jointAttachmentHolderTransform,
            // TODO this might need to be after rotation
            joint.attachedEntity.body.jointAttachmentHeldTransform
        ),
    )
  }  
}

const entityAvailableActions = <T extends number>(entity: Entity<T>): number => {
  // let availableActions = -1;
  // if (entity.body.anims) {
  //   for (let key in entity.body.anims) {
  //     const anim: EntityBodyAnimation<T> = entity.body.anims[key];
      
  //   }  
  // }
  // return availableActions;

  return (entity.joints||[]).reduce((availableActions, joint, jointId) => {
    if (joint.animAction) {
      const jointActionAnimation: EntityBodyAnimation<T> = entity.body.anims[joint.animAction];
      const mask = jointActionAnimation.blockActions || 0;
      availableActions = availableActions & ~mask;
    }
    return availableActions;
  }, -1);

  // if (entity.joints) {
    //const entityActionAnimations = entity.body.anims[actionId];
    // const requiredJointIds = (entityActionAnimations || []).reduce<number[]>((acc, v) => {
    //   return entity.joints.reduce((acc, joint, jointId) => {
    //     const rotationsAndRequired: [Vector3[], Booleanish?] = v[jointId];
    //     if (rotationsAndRequired?.[1] && joint.animAction != actionId) {
    //       acc.push(jointId);
    //     }
    //     return acc;
    //   }, acc);
    // }, [])  
  // }
  // return -1;
}

let entityId = 1;

const entityCreate = <T extends number, EntityType extends PartialEntity<T>>(entity: EntityType): Entity<T> => {
  const joints: Joint[] = [];
  entityIterateParts((e, part) => {
    const defaultRotation = entity.body.defaultJointRotations?.[part.id];
    joints[part.id] = entity.joints?.[part.id] || {
      rotation: defaultRotation ? [...defaultRotation] : [0, 0, 0],
    };
  }, entity, entity.body);
  return {
    id: entityId++,
    ...entity,
    joints,
  } as Entity<T>;
};

const entityMidpoint = (entity: Entity): Vector3 => {
  return entity.position.map((v, i) => {
    return v + entity.dimensions[i]/2;
  }) as Vector3;
};