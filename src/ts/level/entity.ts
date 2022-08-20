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
const ACTION_ID_TURN = 4;
const ACTION_ID_JUMP = 8;
const ACTION_ID_RUN = 16;
const ACTION_ID_FALL = 32;

type ActionId = 
    | typeof ACTION_ID_TURN
    | typeof ACTION_ID_IDLE 
    | typeof ACTION_ID_WALK
    | typeof ACTION_ID_JUMP
    | typeof ACTION_ID_RUN
    | typeof ACTION_ID_FALL
    ;

type EntityId = number;

type Entity<T extends number = number> = EntityBase<T> & (Immovable | Moveable) & (Active | Inactive);

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
  readonly dimensions: Vector3,
  readonly body: EntityBody<T>,
  joints?: Joint[],
  previousCollision?: {
    maxIntersectionArea: number,
    maxOverlapIndex: number,
    maxCollisionEntity: Entity,
    worldTime: number,
  },
  lastZCollision?: number,
  lastCameraOrientation?: Orientation,
  collisionGroup: CollisionGroup,
  collisionMask?: number,
} & Joint;

type Immovable = {
  velocity?: never,
};

type Moveable = MoveableBase;

type MoveableBase = {
  velocity: Vector3,
};

type Active = Oriented & {

};

type Inactive = {
  orientation?: never,
}

type Oriented = {
  orientation: Orientation,
};

type EntityBodyPartAnimationSequence = [Vector3[], Booleanish?, number?, Easing?];

type EntityBodyAnimation<ID extends number> = Partial<Record<ID, EntityBodyPartAnimationSequence>> & {
  maxSpeed: number,
};

type EntityBody<ID extends number> = Part<ID> & {
  anims?: Partial<Record<ActionId, EntityBodyAnimation<ID>[]>>,
  defaultJointRotations?: Record<ID, Vector3> & Vector3[],
}

type Part<ID extends number> = {
  readonly id?: ID,
  readonly preRotationTransform?: Matrix4 | Falsey,
  readonly postRotationTransform?: Matrix4 | Falsey,
  readonly modelId: number,
  readonly children?: readonly Part<ID>[],
};

type Joint = {
  rotation: Vector3,
  //cachedTransform?: Matrix4 | Falsey,
  //attachedEntity?: Entity,
  anim?: Anim | Falsey,
  animAction?: ActionId | 0,
  animActionIndex?: number,
};

const entityIterateParts = <T extends number>(
  f: (part: Part<T>, transform: Matrix4) => void,
  part: Part<T>,
  joints?: Record<T, Joint>,
  inheritedTransform?: Matrix4 | Falsey,
) => {
  const joint = joints?.[part.id];
  let rotationTransform = joint && matrix4RotateInOrder(...joint.rotation);
  const transform = matrix4Multiply(
    inheritedTransform,
    part.preRotationTransform,
    rotationTransform,
    part.postRotationTransform,
  );
  f(part, transform)
  part.children?.forEach(child => {
    entityIterateParts(f, child, joints, transform);
  });
}

const entityCannotPerformAction = <T extends number>(entity: Entity<T>, actionId: ActionId): Booleanish => {
  if (entity.joints) {
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
  
    return entity.joints.some((joint, jointId) => {
      if (joint.anim) {
        const jointActionAnimations = entity.body.anims[joint.animAction];
        // TODO required should be a mask
        const required = jointActionAnimations[joint.animActionIndex][jointId]?.[1] || 0;
        return required && joint.animAction != actionId;
      }
    });
  }
}