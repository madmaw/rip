///<reference path="../math/shape.ts"/>
///<reference path="models.ts"/>
///<reference path="skeleton.ts"/>

const TORCH_HANDLE_WIDTH = .2;
const TORCH_HANDLE_RADIUS = .01;
const TORCH_HEAD_WIDTH = .02;
const TORCH_HEAD_RADIUS = .02;

const TORCH_PART_ID_BODY = 0;
const TORCH_PART_ID_HEAD = 1;

type TorchPartId = 
    | typeof TORCH_PART_ID_BODY
    | typeof TORCH_PART_ID_HEAD
    ;

const PART_TORCH: EntityBody<TorchPartId> = {
  id: TORCH_PART_ID_BODY,
  modelId: MODEL_TORCH_HANDLE,
  textureId: TEXTURE_ID_WOOD,
  // preRotationTransform: matrix4Translate(TORCH_HANDLE_WIDTH, 0, 0),
  jointAttachmentHeldTransform: matrix4Translate(0, 0, 0),
  jointAttachmentHolderPartId: SKELETON_PART_ID_HAND_LEFT,
  jointAttachmentHolderAnims: {
    [ACTION_ID_IDLE]: {
      maxSpeed: .001,
      // hold up
      sequences: [{
        ...SKELETON_IDLE_SEQUENCE,
        [SKELETON_PART_ID_HUMERUS_LEFT]: [[
          [0, -Math.PI/4, 0],
        ]],
        [SKELETON_PART_ID_HAND_LEFT]: [[
          [0, Math.PI/5, 0],
        ]],
      }],
    }, 
    [ACTION_ID_WALK]: {
      maxSpeed: .003,
      // hold up
      sequences: [{
        ...SKELETON_DEFENSIVE_WALK_SEQUENCE,
        [SKELETON_PART_ID_HUMERUS_LEFT]: [[
          [0, 0, 0],
        ]],
        [SKELETON_PART_ID_FOREARM_LEFT]: [[
          [0, -Math.PI/2, 0],
        ]],
        [SKELETON_PART_ID_HAND_LEFT]: [[
          [0, Math.PI/2, 0],
        ]],
      }],
    },
  },
  children: [{
    id: TORCH_PART_ID_HEAD,
    preRotationTransform: matrix4Translate(TORCH_HANDLE_WIDTH/2, 0, 0),
    modelId: MODEL_TORCH_HEAD,
    textureId: TEXTURE_ID_FLAME,
  }]
};

const SHAPE_TORCH_HANDLE = shapeFromPlanes(planesCapsule(6, TORCH_HANDLE_WIDTH, TORCH_HANDLE_RADIUS/2, TORCH_HANDLE_RADIUS));
const SHAPE_TORCH_HEAD = shapeFromPlanes(planesCapsule(6, TORCH_HEAD_WIDTH, TORCH_HEAD_RADIUS));
