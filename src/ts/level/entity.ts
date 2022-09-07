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

const ORIENTATION_OFFSETS: Record<Orientation, Vector3> & Vector3[] = [
  [1, 0, 0],
  [0, 1, 0],
  [-1, 0, 0],
  [0, -1, 0],
];

const ENTITY_TYPE_WALL = 0;
const ENTITY_TYPE_STAIR = 1;
const ENTITY_TYPE_HOSTILE = 2;
const ENTITY_TYPE_PLAYER = 3;
const ENTITY_TYPE_TORCH = 4;
const ENTITY_TYPE_ITEM = 5;

type EntityType =
  | typeof ENTITY_TYPE_WALL
  | typeof ENTITY_TYPE_STAIR
  | typeof ENTITY_TYPE_HOSTILE
  | typeof ENTITY_TYPE_PLAYER
  | typeof ENTITY_TYPE_TORCH
  | typeof ENTITY_TYPE_ITEM
  ;

// action ids are also masks
// order is priority 
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
const ACTION_ID_CANCEL = 1024;
const ACTION_ID_TAKE_DAMAGE = 2048;

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
    | typeof ACTION_ID_TAKE_DAMAGE
    | typeof ACTION_ID_CANCEL
    ;

const ENTITY_CHILD_PART_ANIMATION_DAMAGE_INDEX = 3;

type EntityId = number;

type Entity<T extends number = number> = 
    & EntityBase<T>
    & (Moveable | Immovable)
    & (Active | Inactive)
    & (Intelligent | Mindless)
    & (Destructible | Indestructible)
    ;

type PartialEntity<T extends number> = Omit<Entity<T>, 'id' | 'joints' | 'rotation'> & {
  joints?: Joint[],
  rotation?: Vector3,
};

type CollisionGroup =
    | typeof COLLISION_GROUP_WALL
    | typeof COLLISION_GROUP_MONSTER
    | typeof COLLISION_GROUP_ITEM
    ;

const COLLISION_GROUP_NONE = 0;
const COLLISION_GROUP_WALL = 1;
const COLLISION_GROUP_MONSTER = 2;
const COLLISION_GROUP_ITEM = 4;

type EntityBase<T extends number> = {
  readonly id: EntityId,
  readonly entityType?: EntityType,
  position: Vector3,
  offset?: Vector3,
  offsetAnim?: Anim | Falsey,
  offsetAnimAction?: ActionId | 0,
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
  lastDamaged?: number,
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

type Intelligent = {
  activePath?: Vector3[],
  activePathTime?: number,
  activeTarget?: Entity | Falsey,
};

type Mindless = {
  activePath: never,
  activePathTime: never,
  activeTarget?: never,
};

type Destructible = {
  health: number,
  maxHealth: number,
};

type Indestructible = {
  health?: never,
  maxHealth?: never,
}

const ENTITY_BODY_PART_ANIMATION_SEQUENCE_INDEX_ROTATIONS = 0;
const ENTITY_BODY_PART_ANIMATION_SEQUENCE_INDEX_REQUIRED = 1;
const ENTITY_BODY_PART_ANIMATION_SEQUENCE_INDEX_EASING = 2;
const ENTITY_BODY_PART_ANIMATION_SEQUENCE_INDEX_DAMAGE_MULTIPLIER = 3;

type EntityBodyPartAnimationSequence = [
  // rotations
  Vector3[],
  // required
  Booleanish?,
  // easing to use 
  EasingId?,
  // damage multiplier for self and children
  number?,
];

type EntityBodyAnimationSequence<ID extends number> = Partial<Record<ID, EntityBodyPartAnimationSequence>>;

type EntityBodyAnimation<ID extends number> = {
  maxSpeed: number,
  // mask of blocked action ids
  blockActions?: number,
  sequences: EntityBodyAnimationSequence<ID>[],
  translate?: Vector3,
  // the range that this animation should be applied at (for AI)
  range?: number,
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
  readonly incomingDamageMultiplier?: number,
  readonly outgoingDamage?: number,
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
  animSequenceNumber?: number,
  // how much light the associated part emits (default to none)
  light?: number,
  // the transform used for the related body part when last rendered against the light from
  // a given entity (for shadows)
  entityLightTransforms?: Record<EntityId, Vector3>,
};

const entityIterateParts = <PartId extends number, EntityType extends PartialEntity<PartId>>(
  f: (
      entity: EntityType,
      part: Part<PartId>,
      transform: Matrix4,
      joint: Joint | undefined,
      outgoingDamage: number,
  ) => void,
  entity: EntityType,
  part: Part<PartId>,
  inheritedTransform: Matrix4 = matrix4Multiply(
      matrix4Translate(...(entity.dimensions.map(
          (v, i) => v/2 + entity.position[i] + (entity.offset?.[i] || 0)) as Vector3),
      ),
      matrix4RotateInOrder(...entity.rotation),
  ),
  inheritedOutgoingDamageMultiplier: number = 0,
) => {
  const joint = entity.joints?.[part.id];
  let rotationTransform = joint && matrix4RotateInOrder(...joint.rotation);
  const transform = matrix4Multiply(
      inheritedTransform,
      part.preRotationTransform,
      rotationTransform,
      part.postRotationTransform,
  );
  const animationDamageMultiplier = joint?.animAction
      && joint.animSequenceNumber > 0
      && entity
      // TODO why cast required?
      && entityGetActionAnims(entity as any, joint.animAction)
          ?.sequences[joint.animActionIndex]
          ?.[part.id]
          ?.[ENTITY_CHILD_PART_ANIMATION_DAMAGE_INDEX]
      || 0;
  const childPartOutgoingDamageMultiplier = animationDamageMultiplier || inheritedOutgoingDamageMultiplier;
  f(entity, part, transform, joint, inheritedOutgoingDamageMultiplier * (part.outgoingDamage || 0));
  part.children?.forEach(child => {
    entityIterateParts(f, entity, child, transform, childPartOutgoingDamageMultiplier);
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
        childPartOutgoingDamageMultiplier,
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

  return (entity.joints||[]).reduce((availableActions, joint) => {
    if (joint.animAction) {
      const jointActionAnimation: EntityBodyAnimation<T> = entityGetActionAnims(entity, joint.animAction);
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

const entityCreate = <T extends number, EntityType extends PartialEntity<T>>(entity: EntityType, center?: Booleanish): Entity<T> => {
  const joints: Joint[] = [];
  entity.rotation = entity.rotation || [0, 0, 0];
  if (center) {
    arrayMapAndSet(entity.position, (v, i) => (v | 0) + (i < 2 ? (.5 - entity.dimensions[i]/2) : .01));
  }
  entityIterateParts((e, part) => {
    const defaultRotation = entity.body.defaultJointRotations?.[part.id];
    joints[part.id] = entity.joints?.[part.id] || {
      rotation: defaultRotation ? [...defaultRotation] : [0, 0, 0],
    };
  }, entity, entity.body);
  return {
    id: entityId++,
    joints,
    ...entity,
  } as Entity<T>;
};

const entityMidpoint = (entity: Entity): Vector3 => {
  return entity.position.map((v, i) => {
    return v + entity.dimensions[i]/2;
  }) as Vector3;
};

const entityGetActionAnims = <T extends number>(entity: Entity<T>, action: ActionId) => {
  let bodyAnimations: EntityBodyAnimation<number> | Falsey = entity.joints.reduce<Falsey | EntityBodyAnimation<number>>(
      (acc, joint) => acc
          || joint.attachedEntity && joint.attachedEntity.body.jointAttachmentHolderAnims?.[action],
      0,
  ) || entity.body.anims?.[action];
  if (action == ACTION_ID_CANCEL) {
    // synthesize a cancel animation
    bodyAnimations = {
      ...(bodyAnimations || { maxSpeed: .003 }),
      sequences: [entity.joints.reduce((acc, joint, partId) => {
        let rotation: Vector3;
        if (joint.animAction && joint.animAction != ACTION_ID_CANCEL) {
          const entityBodyAnimation = entityGetActionAnims(entity, joint.animAction);
          const animationSequence = entityBodyAnimation.sequences[joint.animActionIndex][partId];
          // bounce back to the start position
          rotation = animationSequence?.[0][0];
        }
        rotation = rotation || entity.body.defaultJointRotations?.[partId];
        if (rotation) {
          acc[partId] = [[rotation], 1, EASE_OUT_QUAD];
        }
        return acc;
      }, {})],
    }
  }
  return bodyAnimations;
}

const entityStartAnimation = <T extends number>(
    worldTime: number,
    entity: Entity<T>,
    action: ActionId | 0,
) => {
  const bodyAnimations: EntityBodyAnimation<number> | Falsey = action && entityGetActionAnims(entity, action);
  if (bodyAnimations) {
    // find the index with the smallest move time
    const [bestAnimationDuration, bestAnimationIndex] = bodyAnimations.sequences.reduce((acc, bodyAnimation, i) => {
      const [extent] = acc;
      const animationDuration = entity.joints.reduce((max, v, jointId) => {
        const jointBodyAnim = bodyAnimation[jointId];
        // only interested in how long it takes to move to the first step
        const delta: Falsey | number = jointBodyAnim
            && animDeltaRotation(v.rotation, jointBodyAnim[ENTITY_BODY_PART_ANIMATION_SEQUENCE_INDEX_ROTATIONS][0]);
        return delta > max
            ? delta
            : max;
      }, 0);
      // bitwise XOR works on booleans
      if (((animationDuration < extent) as any) ^ ((action == ACTION_ID_TAKE_DAMAGE) as any)) {
        return [animationDuration, i];
      }
      return acc;
    }, [action == ACTION_ID_TAKE_DAMAGE ? 0 : 9999, 0]);
    
    const bodyAnimation = bodyAnimations.sequences[bestAnimationIndex];
    const animFrameDurations = entity.joints.reduce<number[]>((acc, joint, jointId) => {
      const bodyJointAnimation = bodyAnimation[jointId];
      let prev = joint.rotation;
      return bodyJointAnimation?.[ENTITY_BODY_PART_ANIMATION_SEQUENCE_INDEX_ROTATIONS]
          .reduce((acc, rotation, index) => {
            const deltaRotation = animDeltaRotation(prev, rotation);
            const minDuration = deltaRotation / bodyAnimations.maxSpeed;
            if (index < acc.length) {
              acc[index] = Math.max(minDuration, acc[index]);
            } else {
              acc.push(minDuration);
            }
            prev = rotation;
            return acc;
          }, acc) || acc;
    }, []);

    entity.offset = entity.offset || [0, 0, 0];

    if (entity.offsetAnimAction != action
        && entity.offset.some((v, i) => Math.abs(v - (bodyAnimations.translate?.[i] || 0)) > EPSILON)
    ) {
      const totalDuration = animFrameDurations.reduce((acc, v) => acc + v, 0);
      entity.offsetAnimAction = action;
      entity.offsetAnim = animLerp(
          worldTime,
          entity.offset,
          vector3TransformMatrix4(
              matrix4Rotate((entity.orientation || 0) * Math.PI/2, 0, 0, 1),
              ...bodyAnimations.translate || [0, 0, 0],
          ),
          totalDuration || 99,
          EASINGS[EASE_OUT_QUAD],
      );
    }

    entity.joints.forEach((joint, jointId) => {
      const bodyJointAnimation = bodyAnimation[jointId];
      const defaultBodyJointRotation = entity.body.defaultJointRotations?.[jointId];
      const existingAnimation = joint.animAction && entityGetActionAnims(entity, joint.animAction);
      const existingAnimationRequired = existingAnimation
          && existingAnimation.sequences[joint.animActionIndex][jointId]?.[ENTITY_BODY_PART_ANIMATION_SEQUENCE_INDEX_REQUIRED]
          && joint.animAction > action;

      if (!existingAnimationRequired
            && (joint.animAction != action && bodyJointAnimation
                || defaultBodyJointRotation && !joint.animAction
            )
      ) {
        const easing = bodyJointAnimation?.[ENTITY_BODY_PART_ANIMATION_SEQUENCE_INDEX_EASING]
            || EASE_LINEAR;
        const anim = bodyJointAnimation
            ? animComposite(...bodyJointAnimation[ENTITY_BODY_PART_ANIMATION_SEQUENCE_INDEX_ROTATIONS]
                .map((rotation, index) => {
                  // TODO use max speed correctly
                  //const duration = 1/bodyAnimations.maxSpeed;
                  const duration = animFrameDurations[index];
                  return now => animLerp(
                      now,
                      joint.rotation,
                      rotation,
                      duration,
                      EASINGS[easing],
                      0,
                      () => {
                        joint.animSequenceNumber = index + 1;
                      },
                  );
                })
            )
            : animLerp(
                worldTime,
                joint.rotation,
                defaultBodyJointRotation,
                // TODO use overall speed of the animation
                100,
                EASINGS[easing],
                // you shouldn't be making decisions based on default rotations
            );
        joint.anim = anim;
        joint.animAction = action;
        joint.animActionIndex = bestAnimationIndex;
        joint.animSequenceNumber = 0;
      }
    })
  }
};

const entityFlipBodyPartAnimationSequences = <ID extends number>(
  sequences: Partial<Record<ID, EntityBodyPartAnimationSequence>>,
  // TODO work out the opposites based on the delta from the defaults
  //defaultRotations: Vector3[] & Record<ID, Vector3>,
  oppositePartIdMap: Partial<Record<ID, ID>>,
): Partial<Record<ID, EntityBodyPartAnimationSequence>>[] => {
  // ensure the map is bidirectional
  for (let partId in oppositePartIdMap) {
    const oppositePartId = oppositePartIdMap[partId];
    oppositePartIdMap[oppositePartId] = partId;
  }
  const flippedSequences: Partial<Record<ID, EntityBodyPartAnimationSequence>> = {};
  for (let partId in sequences) {
    //const defaultRotation = defaultRotations[partId];
    const oppositePartId = oppositePartIdMap[partId];
    let source: EntityBodyPartAnimationSequence;
    if (oppositePartId) {
      // swap the sequences
      source = sequences[oppositePartId]
    }
    if (!source) {
      source = sequences[partId];
    }
    const [rotations, ...theRest] = source;
    // flip the rotations
    flippedSequences[partId] = [
      rotations.map(rotation => [-rotation[0], rotation[1], -rotation[2]]),
      // types don't transfer
      ...theRest,
    ] as any;
  }
  return [sequences, flippedSequences];
};

