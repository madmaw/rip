///<reference path="../math/shape.ts"/>
///<reference path="models.ts"/>
///<reference path="skeleton.ts"/>

const TORCH_HANDLE_WIDTH = .2;
const TORCH_HANDLE_RADIUS = .01;
const TORCH_HEAD_WIDTH = .02;
const TORCH_HEAD_RADIUS = .02;

const TORCH_PART_ID_BODY = 0;
const TORCH_PART_ID_HEAD = 1;

const TORCH_BRIGHTNESS = .4;
const TORCH_MAX_HEALTH = 9;
// ~30 seconds
const TORCH_MS_PER_HEALTH = 4e3;

type TorchPartId = 
    | typeof TORCH_PART_ID_BODY
    | typeof TORCH_PART_ID_HEAD
    ;

const TORCH_WALK_ANIMATION: Partial<EntityBodyAnimationSequence<SkeletonPartId>> = safeUnpackAnimationSequence(
  !FLAG_UNPACK_USE_ORIGINALS && [...'%!@@@  @&!@0@  @,!@K@  @'],
  FLAG_UNPACK_SUPPLY_ORIGINALS && {
    [SKELETON_PART_ID_HUMERUS_LEFT]: [[
      [0, 0, 0],
    ]],
    [SKELETON_PART_ID_FOREARM_LEFT]: [[
      [0, -Math.PI/2, 0],
    ]],
    [SKELETON_PART_ID_HAND_LEFT]: [[
      [0, Math.PI/3, 0],
    ]],
  },
);

const PART_TORCH: EntityBody<TorchPartId> = {
  id: TORCH_PART_ID_BODY,
  modelId: MODEL_TORCH_HANDLE,
  colorTextureIds: [COLOR_TEXTURE_ID_WOOD],
  // preRotationTransform: matrix4Translate(TORCH_HANDLE_WIDTH, 0, 0),
  jointAttachmentHeldTransform: matrix4Translate(0, 0, 0),
  jointAttachmentHolderPartId: SKELETON_PART_ID_HAND_LEFT,
  jointAttachmentHolderAnims: {
    [ACTION_ID_IDLE]: {
      maxSpeed: .001,
      // hold up
      sequences: [{
        ...SKELETON_IDLE_SEQUENCE,
        ...(FLAG_IDLE_TORCH_ALOFT
              ? safeUnpackAnimationSequence(
                  !FLAG_UNPACK_USE_ORIGINALS && [...'%!@:@  @,!@F@  @'],
                  FLAG_UNPACK_SUPPLY_ORIGINALS && {
                    [SKELETON_PART_ID_HUMERUS_LEFT]: [[
                      [0, -Math.PI/5, 0],
                    ]],
                    [SKELETON_PART_ID_HAND_LEFT]: [[
                      [0, Math.PI/5, 0],
                    ]],              
                  }
              )
              : TORCH_WALK_ANIMATION
        )
      }],
    }, 
    [ACTION_ID_WALK]: {
      maxSpeed: .003,
      // hold up
      sequences: SKELETON_DEFENSIVE_WALK_SEQUENCES.map(s => ({
        ...s,
        ...TORCH_WALK_ANIMATION,
      })),
    },
    // [ACTION_ID_USE_SECONDARY]: {
    //   maxSpeed: .005,
    //   blockActions:
    //       ACTION_ID_ATTACK_HEAVY
    //       | ACTION_ID_ATTACK_LIGHT
    //       | ACTION_ID_USE_SECONDARY
    //       | ACTION_ID_RUN
    //       | ACTION_ID_JUMP
    //       ,
    //   // burn them all
    //   sequences: [{
    //     [SKELETON_PART_ID_HUMERUS_LEFT]: [[
    //       [0, -Math.PI/5, 0],
    //       [0, Math.PI/4, 0],
    //     ], 1],
    //     [SKELETON_PART_ID_FOREARM_LEFT]: [[
    //       [0, -Math.PI/4, 0],
    //       [0, -Math.PI/4, -Math.PI/7],
    //     ], 1],
    //     [SKELETON_PART_ID_HAND_LEFT]: [[
    //       [0, Math.PI/5, 0],
    //       [0, Math.PI/3, 0],
    //     ], 1, EASE_IN_QUAD, 1],
    //   }],
    // },    
  },
  childs: [{
    id: TORCH_PART_ID_HEAD,
    preRotationTransform: matrix4Translate(TORCH_HANDLE_WIDTH/2, 0, 0),
    outgoingDamage: 9,
    modelId: MODEL_TORCH_HEAD,
    colorTextureIds: [COLOR_TEXTURE_ID_FLAME],
  }]
};

const SHAPE_TORCH_HANDLE = shapeFromPlanes(planesCapsule(4, TORCH_HANDLE_WIDTH, TORCH_HANDLE_RADIUS/2, TORCH_HANDLE_RADIUS));
const SHAPE_TORCH_HEAD = shapeFromPlanes(planesCapsule(6, TORCH_HEAD_WIDTH, TORCH_HEAD_RADIUS));
