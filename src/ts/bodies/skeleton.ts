///<reference path="../anim.ts"/>
///<reference path="../constants.ts"/>
///<reference path="../level/entity.ts"/>
///<reference path="../math/matrix.ts"/>
///<reference path="../math/shape.ts"/>
///<reference path="../math/vector.ts"/>
///<reference path="../textures/textures.ts"/>
///<reference path="models.ts"/>

const SKELETON_DIMENSION = .2;
const SKELETON_DEPTH = .4;

const SKELETON_RIBCAGE_WIDTH = .1;
const SKELETON_RIBCAGE_HEIGHT = .2;
const SKELETON_RIBCAGE_DEPTH = .15;

const SKELETON_HEAD_WIDTH = .09;
const SKELETON_HEAD_HEIGHT = .08;
const SKELETON_HEAD_DEPTH = .08;
const SKELETON_NECK_LENGTH = .02;

const SKELETON_HUMERUS_WIDTH = .09;
const SKELETON_HUMERUS_DIAMETER = .04;

const SKELETON_FOREARM_WIDTH = .07;
const SKELETON_FOREARM_DIAMETER = .04;

const SKELETON_WRIST_RADIUS = .01;

const SKELETON_HIPS_WIDTH = .06;
const SKELETON_HIPS_HEIGHT = .1;
const SKELETON_HIPS_DEPTH = .08;

const SKELETON_FEMUR_LENGTH = .1;
const SKELETON_FEMUR_RADIUS = .02;

const SKELETON_SHIN_WIDTH = .12;
const SKELETON_SHIN_DIAMETER = .03;

const SKELETON_HAND_DIMENSION = .07;

const SKELETON_FOOT_WIDTH = .1;
const SKELETON_FOOT_HEIGHT = .04;
const SKELETON_FOOT_DEPTH = .04;


const SKELETON_NECK_DIMENSION = .05;

const SKELETON_PART_ID_RIBCAGE = 0;
const SKELETON_PART_ID_HEAD = 1;
const SKELETON_PART_ID_HIPS = 2;
const SKELETON_PART_ID_HUMERUS_RIGHT = 3;
const SKELETON_PART_ID_FOREARM_RIGHT = 4;
const SKELETON_PART_ID_HUMERUS_LEFT = 5;
const SKELETON_PART_ID_FOREARM_LEFT = 6;
const SKELETON_PART_ID_FEMUR_RIGHT = 7;
const SKELETON_PART_ID_FEMUR_LEFT = 8;
const SKELETON_PART_ID_SHIN_RIGHT = 9;
const SKELETON_PART_ID_SHIN_LEFT = 10;
const SKELETON_PART_ID_HAND_RIGHT = 11;
const SKELETON_PART_ID_HAND_LEFT = 12;
const SKELETON_PART_ID_FOOT_RIGHT = 13;
const SKELETON_PART_ID_FOOT_LEFT = 14;

const SKELETON_LURCH_SEQUENCE: Partial<Record<SkeletonPartId, EntityBodyPartAnimationSequence>> = {
  [SKELETON_PART_ID_HIPS]: [[
    [0, 0, Math.PI/9],
    [0, 0, -Math.PI/9],    
  ]],
  [SKELETON_PART_ID_FEMUR_LEFT]: [[
    [0, Math.PI/1.5, 0],
    [0, Math.PI/6, 0],
  ]],
  [SKELETON_PART_ID_FEMUR_RIGHT]: [[
    [0, Math.PI/6, 0],
    [0, Math.PI/1.5, 0],
  ]],
  [SKELETON_PART_ID_SHIN_LEFT]: [[
    [0, Math.PI*1/10, 0],
    [0, Math.PI*5/10, 0],
  ]],
  [SKELETON_PART_ID_SHIN_RIGHT]: [[
    [0, Math.PI*5/10, 0],
    [0, Math.PI*1/10, 0],
  ]],
  [SKELETON_PART_ID_HUMERUS_LEFT]: [[
    [0, Math.PI/2, 0],
    [0, Math.PI/4, 0],
  ]],
  [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
    [0, Math.PI/4, 0],
    [0, Math.PI/2, 0],
  ]],
};

const SKELETON_DEFENSIVE_WALK_SEQUENCE: Partial<Record<SkeletonPartId, EntityBodyPartAnimationSequence>> = {
  [SKELETON_PART_ID_HEAD]: [[
    [0, -Math.PI/12, 0],
    [0, Math.PI/12, 0],
  ]],
  [SKELETON_PART_ID_HIPS]: [[
    [0, Math.PI/20, -Math.PI/4],
    [0, -Math.PI/20, -Math.PI/3],
  ]],
  [SKELETON_PART_ID_FEMUR_LEFT]: [[
    [0, Math.PI/2, 0],
    [0, Math.PI/2.5, Math.PI/6],
  ]],
  [SKELETON_PART_ID_FEMUR_RIGHT]: [[
    [0, Math.PI/2.5, Math.PI/6],
    [0, Math.PI/2, -Math.PI/6],
  ]],
  [SKELETON_PART_ID_SHIN_LEFT]: [[
    [0, Math.PI*4/10, 0],
    [0, Math.PI*2/10, 0],
  ]],
  [SKELETON_PART_ID_SHIN_RIGHT]: [[
    [0, Math.PI*2/10, 0],
    [0, Math.PI*4/10, 0],
  ]],
  [SKELETON_PART_ID_HUMERUS_LEFT]: [[
    [0, Math.PI/4, 0],
    [0, Math.PI/5, 0],
  ]],
  [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
    [0, Math.PI/5, 0],
    [0, Math.PI/4, 0],
  ]],
  [SKELETON_PART_ID_FOREARM_LEFT]: [[
    [0, -Math.PI/2, 0],
    [0, -Math.PI/3, 0],
  ]],
  [SKELETON_PART_ID_FOREARM_RIGHT]: [[
    [0, -Math.PI/2, 0],
    [0, -Math.PI/1.5, 0],
  ]],
};

const SKELETON_RUN_SEQUENCE: Partial<Record<SkeletonPartId, EntityBodyPartAnimationSequence>> = {
  [SKELETON_PART_ID_HEAD]: [[
    [0, -Math.PI/12, -Math.PI/12],
    [0, -Math.PI/12, Math.PI/12],
  ]],
  [SKELETON_PART_ID_HIPS]: [[
    [0, Math.PI/12, Math.PI/12],
    [0, Math.PI/12, -Math.PI/12], 
  ]],
  [SKELETON_PART_ID_FEMUR_LEFT]: [[
    [0, Math.PI/1.5, 0],
    [0, -Math.PI/8, 0],
  ]],
  [SKELETON_PART_ID_FEMUR_RIGHT]: [[
    [0, -Math.PI/8, 0],
    [0, Math.PI/1.5, 0],
  ]],
  [SKELETON_PART_ID_SHIN_LEFT]: [[
    [0, Math.PI*4/10, 0],
    [0, Math.PI*2/10, 0],
  ]],
  [SKELETON_PART_ID_SHIN_RIGHT]: [[
    [0, Math.PI*2/10, 0],
    [0, Math.PI*4/10, 0],
  ]],
  [SKELETON_PART_ID_HUMERUS_LEFT]: [[
    [0, 0, 0],
    [0, Math.PI/2, 0],
  ]],
  [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
    [0, Math.PI/2, 0],
    [0, 0, 0],
  ]],
  [SKELETON_PART_ID_FOREARM_LEFT]: [[
    [0, -Math.PI/3, 0],
  ]],
  [SKELETON_PART_ID_FOREARM_RIGHT]: [[
    [0, -Math.PI/3, 0],
  ]],
};

const SKELETON_LIGHT_ATTACK_SEQUENCE: Partial<Record<SkeletonPartId, EntityBodyPartAnimationSequence>> = {
  [SKELETON_PART_ID_HEAD]: [[
    [0, -Math.PI/6, Math.PI/3],
    [0, -Math.PI/6, -Math.PI/3],
  ], 1],
  [SKELETON_PART_ID_HIPS]: [[
    [0, -Math.PI/12, -Math.PI/3],
    [0, Math.PI/12, Math.PI/3],
  ], 1],
  [SKELETON_PART_ID_FEMUR_LEFT]: [[
    [0, Math.PI/5, Math.PI/4],
    [0, Math.PI/3, 0],
  ], 1],
  [SKELETON_PART_ID_SHIN_LEFT]: [[
    [0, Math.PI/2, 0],
    [0, Math.PI/8, 0],
  ]],
  [SKELETON_PART_ID_FEMUR_RIGHT]: [[
    [0, Math.PI/2, -Math.PI/5],
    [0, Math.PI/2.5, -Math.PI/5],
  ], 1],
  [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
    [0, Math.PI/2, -Math.PI/2],
    //[0, -Math.PI/8, -Math.PI/2],
    [0, -Math.PI/4, 0],
  ], 1, EASE_IN_QUAD],
  [SKELETON_PART_ID_FOREARM_RIGHT]: [[
    [0, -Math.PI/2, 0],
    [0, 0, 0],
  ], 1, EASE_IN_QUAD, 1.3 /* damage mult */],
};

const SKELETON_IDLE_SEQUENCE: Partial<Record<SkeletonPartId, EntityBodyPartAnimationSequence>> = {
  [SKELETON_PART_ID_HIPS]: [[
    [0, 0, 0],
    [0, Math.PI/12, 0],
  ]],
  [SKELETON_PART_ID_RIBCAGE]: [[
    [0, Math.PI/10, 0],
    [0, 0, 0],
  ]],
  [SKELETON_PART_ID_HEAD]: [[
    [0, 0, 0],
    [0, -Math.PI/8, 0],
  ]],
  [SKELETON_PART_ID_FEMUR_LEFT]: [[
    [0, Math.PI*3/10, 0],
  ]],
  [SKELETON_PART_ID_FEMUR_RIGHT]: [[
    [0, Math.PI*3/10, 0],
  ]],
};

type SkeletonPartId = 
    | typeof SKELETON_PART_ID_RIBCAGE
    | typeof SKELETON_PART_ID_HEAD
    | typeof SKELETON_PART_ID_HIPS
    | typeof SKELETON_PART_ID_HUMERUS_RIGHT
    | typeof SKELETON_PART_ID_FOREARM_RIGHT
    | typeof SKELETON_PART_ID_HUMERUS_LEFT
    | typeof SKELETON_PART_ID_FOREARM_LEFT
    | typeof SKELETON_PART_ID_FEMUR_RIGHT
    | typeof SKELETON_PART_ID_FEMUR_LEFT
    | typeof SKELETON_PART_ID_SHIN_RIGHT
    | typeof SKELETON_PART_ID_SHIN_LEFT
    | typeof SKELETON_PART_ID_HAND_RIGHT
    | typeof SKELETON_PART_ID_HAND_LEFT
    | typeof SKELETON_PART_ID_FOOT_RIGHT
    | typeof SKELETON_PART_ID_FOOT_LEFT
    ;

const PART_SKELETON_BODY: EntityBody<SkeletonPartId> = {
  defaultJointRotations: [
    //SKELETON_PART_ID_RIBCAGE
    [0, Math.PI/10, 0],
    //SKELETON_PART_ID_HEAD
    [0, -Math.PI/10, 0],
    //SKELETON_PART_ID_HIPS
    [0, 0, 0],
    //SKELETON_PART_ID_HUMERUS_RIGHT
    [0, Math.PI/4, 0],
    //SKELETON_PART_ID_FOREARM_RIGHT
    [0, -Math.PI/8, 0],
    //SKELETON_PART_ID_HUMERUS_LEFT
    [0, Math.PI/4, 0],
    //SKELETON_PART_ID_FOREARM_LEFT
    [0, -Math.PI/8, 0],
    //SKELETON_PART_ID_FEMUR_RIGHT
    [0, Math.PI*3/10, 0],
    //SKELETON_PART_ID_SHIN_RIGHT
    [0, Math.PI*3/10, 0],
    //SKELETON_PART_ID_FEMUR_LEFT
    [0, Math.PI*3/10, 0],
    //SKELETON_PART_ID_SHIN_LEFT
    [0, Math.PI*3/10, 0],
    // SKELETON_PART_ID_HAND_RIGHT
    [0, 0, 0],
    // SKELETON_PART_ID_HAND_LEFT
    [0, 0, 0],
    // SKELETON_PART_ID_FOOT_RIGHT
    [0, 0, 0],
    // SKELETON_PART_ID_FOOT_LEFT
    [0, 0, 0],
  ],
  anims: {
    [ACTION_ID_IDLE]: {
      maxSpeed: .0006,
      sequences: [SKELETON_IDLE_SEQUENCE]
    },
    [ACTION_ID_WALK]: {
      maxSpeed: .004,
      sequences: [SKELETON_DEFENSIVE_WALK_SEQUENCE],
    },
    [ACTION_ID_WALK_BACKWARD]: {
      maxSpeed: .003,
      sequences: [SKELETON_DEFENSIVE_WALK_SEQUENCE],
    },
    [ACTION_ID_RUN]: {
      maxSpeed: .005,
      sequences: [SKELETON_RUN_SEQUENCE],
    },
    [ACTION_ID_JUMP]: {
      maxSpeed: .01,
      blockActions:  ACTION_ID_IDLE | ACTION_ID_FALL | ACTION_ID_WALK | ACTION_ID_JUMP,
      translate: [0, 0, -SKELETON_FEMUR_LENGTH],
      sequences: [{
        [SKELETON_PART_ID_HIPS]: [[
          [0, Math.PI/8, 0],
        ], 1, EASE_OUT_QUAD],
        [SKELETON_PART_ID_FEMUR_LEFT]: [[
          [0, -Math.PI/6, 0],
          [0, 0, 0],
        ]],
        [SKELETON_PART_ID_FEMUR_RIGHT]: [[
          [0, -Math.PI/6, 0],
          [0, 0, 0],
        ]],
        [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
          [0, Math.PI*3/4, 0],
        ]],
        [SKELETON_PART_ID_FOREARM_RIGHT]: [[
          [0, -Math.PI/3, 0],
        ]],
        [SKELETON_PART_ID_HUMERUS_LEFT]: [[
          [0, Math.PI*3/4, 0],
        ]],
        [SKELETON_PART_ID_FOREARM_LEFT]: [[
          [0, -Math.PI/3, 0],
        ]],
      }]
    },
    [ACTION_ID_FALL]: {
      maxSpeed: .001,
      sequences: [{
        [SKELETON_PART_ID_HIPS]: [[
          [0, 0, 0],
        ]],
        [SKELETON_PART_ID_HUMERUS_RIGHT]: [[
          [0, -Math.PI/2, 0],
        ]],
        [SKELETON_PART_ID_FOREARM_RIGHT]: [[
          [0, -Math.PI/5, 0],
        ]],  
      }]
    },
    [ACTION_ID_DUCK]: {
      maxSpeed: .005,
      blockActions: ACTION_ID_IDLE | ACTION_ID_FALL | ACTION_ID_WALK | ACTION_ID_RUN,
      translate: [0, 0, -SKELETON_SHIN_WIDTH],
      sequences: [{
        [SKELETON_PART_ID_HEAD]: [[
          [0, -Math.PI/6, 0],
        ], 1],
        [SKELETON_PART_ID_HIPS]: [[
          [0, Math.PI/6, 0],
        ], 1, EASE_OUT_QUAD],
        [SKELETON_PART_ID_FEMUR_LEFT]: [[
          [0, -Math.PI*2/10, Math.PI/5],
        ], 1],
        [SKELETON_PART_ID_SHIN_LEFT]: [[
          [0, Math.PI*5/10, Math.PI/5],
        ], 1],
        [SKELETON_PART_ID_FEMUR_RIGHT]: [[
          [0, Math.PI*1/10, -Math.PI/5],
        ], 1],
        [SKELETON_PART_ID_SHIN_RIGHT]: [[
          [0, Math.PI*7/10, 0],
        ], 1],
      }],
    },
    [ACTION_ID_ATTACK_LIGHT]: {
      maxSpeed: .007,
      blockActions: ACTION_ID_JUMP | ACTION_ID_IDLE | ACTION_ID_RUN,
      translate: [.2, 0, 0],
      sequences: [SKELETON_LIGHT_ATTACK_SEQUENCE],
    },    
    [ACTION_ID_TAKE_DAMAGE]: {
      maxSpeed: .005,
      blockActions: ACTION_ID_JUMP | ACTION_ID_IDLE | ACTION_ID_WALK | ACTION_ID_RUN | ACTION_ID_ATTACK_LIGHT | ACTION_ID_ATTACK_HEAVY,
      translate: [-.2, 0, 0],
      sequences: [{
        [SKELETON_PART_ID_HEAD]: [[
          [0, -Math.PI/6, 0],
          [0, Math.PI/6, 0],          
        ], 1],
        [SKELETON_PART_ID_HIPS]: [[
          [0, -Math.PI/12, 0],
          [0, Math.PI/12, 0],
        ], 1],
      }]
    }
  },
  id: SKELETON_PART_ID_HIPS,
  modelId: MODEL_SKELETON_HIPS,
  textureId: TEXTURE_ID_HIPS,
  vulnerability: 1,
  preRotationTransform: matrix4Translate(
      -SKELETON_DIMENSION/4,
      0,
      SKELETON_FEMUR_LENGTH + SKELETON_SHIN_WIDTH - SKELETON_DEPTH/2,
  ),
  postRotationTransform: matrix4Translate(
      0,
      0,
      0,
  ),
  children: [
    // upper body
    {
      id: SKELETON_PART_ID_RIBCAGE,
      modelId: MODEL_SKELETON_TORSO,
      textureId: TEXTURE_ID_RIBCAGE,
      vulnerability: 1,
      preRotationTransform: matrix4Translate(
          0,
          0,
          SKELETON_HIPS_DEPTH/2,
      ),
      postRotationTransform: matrix4Translate(0, 0, SKELETON_RIBCAGE_DEPTH/2),  
      children: [
        // head
        {
          id: SKELETON_PART_ID_HEAD,
          modelId: MODEL_SKELETON_HEAD,
          textureId: TEXTURE_ID_SKULL,
          vulnerability: 2,
          preRotationTransform: matrix4Translate(
              0,
              0,
              SKELETON_RIBCAGE_DEPTH/2 + SKELETON_HEAD_DEPTH/2 + SKELETON_NECK_LENGTH,
          ),
        },
        // right shoulder
        {
          id: SKELETON_PART_ID_HUMERUS_RIGHT,
          modelId: MODEL_SKELETON_HUMERUS,
          textureId: TEXTURE_ID_BONE,
          preRotationTransform: matrix4Translate(
              0,
              -SKELETON_RIBCAGE_HEIGHT/2 + SKELETON_HUMERUS_DIAMETER/2,
              SKELETON_RIBCAGE_DEPTH/2 - SKELETON_HUMERUS_DIAMETER,
          ),
          postRotationTransform: matrix4Translate(
              SKELETON_HUMERUS_WIDTH/2,
              0, 
              0,
          ),
          children: [{
            id: SKELETON_PART_ID_FOREARM_RIGHT,
            modelId: MODEL_SKELETON_FOREARM,
            textureId: TEXTURE_ID_BONE,
            preRotationTransform: matrix4Translate(
                SKELETON_HUMERUS_WIDTH/2 + SKELETON_HUMERUS_DIAMETER/2,
                0,
                0,
            ),
            postRotationTransform: matrix4Translate(
                SKELETON_FOREARM_WIDTH/2,
                0,
                0,
            ),
            children: [{
              id: SKELETON_PART_ID_HAND_RIGHT,
              modelId: MODEL_SKELETON_HAND,
              textureId: TEXTURE_ID_HAND_RIGHT,
              preRotationTransform: matrix4Translate(
                  SKELETON_FOREARM_WIDTH/2,
                  0,
                  0,
              ),
              postRotationTransform: matrix4Translate(
                  SKELETON_HAND_DIMENSION/2,
                  0,
                  0
              ),
              jointAttachmentHolderTransform: matrix4Multiply(
                  matrix4Rotate(
                      -Math.PI/2,
                      0,
                      1, 
                      0,
                  ),
                  matrix4Translate(
                    SKELETON_HAND_DIMENSION/2,
                    SKELETON_HAND_DIMENSION/3,
                    0,
                ),

              ),
            }]
          }]
        },
        // left shoulder
        {
          id: SKELETON_PART_ID_HUMERUS_LEFT,
          modelId: MODEL_SKELETON_HUMERUS,
          textureId: TEXTURE_ID_BONE,
          // TODO flip model
          preRotationTransform: matrix4Translate(
              0,
              SKELETON_RIBCAGE_HEIGHT/2 - SKELETON_HUMERUS_DIAMETER/2,
              SKELETON_RIBCAGE_DEPTH/2 - SKELETON_HUMERUS_DIAMETER,
          ),
          postRotationTransform: matrix4Translate(
              SKELETON_HUMERUS_WIDTH/2,
              0, 
              0,
          ),
          children: [{
            id: SKELETON_PART_ID_FOREARM_LEFT,
            modelId: MODEL_SKELETON_FOREARM,
            textureId: TEXTURE_ID_BONE,
            // TODO flip model
            preRotationTransform: matrix4Translate(
                SKELETON_HUMERUS_WIDTH/2 + SKELETON_HUMERUS_DIAMETER/2,
                0,
                0,
            ),
            postRotationTransform: matrix4Translate(
                SKELETON_FOREARM_WIDTH/2,
                0,
                0,
            ),
            children: [{
              id: SKELETON_PART_ID_HAND_LEFT,
              modelId: MODEL_SKELETON_HAND,
              textureId: TEXTURE_ID_HAND_LEFT,
              preRotationTransform: matrix4Translate(
                  SKELETON_FOREARM_WIDTH/2,
                  0,
                  0,
              ),
              postRotationTransform: matrix4Translate(
                  SKELETON_HAND_DIMENSION/2,
                  0,
                  0
              ),
              jointAttachmentHolderTransform: matrix4Multiply(
                  matrix4Rotate(
                      -Math.PI/2,
                      0,
                      1, 
                      0,
                  ),
                  matrix4Translate(
                    SKELETON_HAND_DIMENSION/2,
                    -SKELETON_HAND_DIMENSION/3,
                    0,
                ),
              ),
            }]            
          }]
        },
      ],
    },
    // right leg
    {
      id: SKELETON_PART_ID_FEMUR_RIGHT,
      modelId: MODEL_SKELETON_FEMUR,
      textureId: TEXTURE_ID_BONE,
      preRotationTransform: matrix4Translate(
          0,
          -SKELETON_HIPS_HEIGHT/2,
          -SKELETON_HIPS_DEPTH/2 + SKELETON_FEMUR_RADIUS,
      ),
      postRotationTransform: matrix4Translate(
          SKELETON_FEMUR_LENGTH/2,
          0,
          0,
      ),
      children: [{
        id: SKELETON_PART_ID_SHIN_RIGHT,
        modelId: MODEL_SKELETON_SHIN,
        textureId: TEXTURE_ID_BONE,
        preRotationTransform: matrix4Translate(
            SKELETON_FEMUR_LENGTH/2,
            0,
            0,
        ),
        postRotationTransform: matrix4Translate(
            // TODO this should be SKELETON_FEMUR_LENGTH          
            SKELETON_SHIN_WIDTH/2,
            0, 
            0
        ),
        children: [{
          id: SKELETON_PART_ID_FOOT_RIGHT,
          modelId: MODEL_SKELETON_FOOT,
          textureId: TEXTURE_ID_FOOT,
          preRotationTransform: matrix4Translate(
              SKELETON_SHIN_WIDTH,
              0,
              0,
          ),
          postRotationTransform: matrix4Multiply(
              matrix4Rotate(
                  Math.PI/2.5,
                  0,
                  1, 
                  0,
              ),
              matrix4Translate(
                  -SKELETON_FOOT_WIDTH/2,
                  0, 
                  -SKELETON_FOOT_DEPTH,
              ),
          ),
        }],
      }],
    },
    // left leg
    {
      id: SKELETON_PART_ID_FEMUR_LEFT,
      modelId: MODEL_SKELETON_FEMUR,
      textureId: TEXTURE_ID_BONE,
      // TODO flip model
      preRotationTransform: matrix4Translate(
          0,
          SKELETON_HIPS_HEIGHT/2,
          -SKELETON_HIPS_DEPTH/2 + SKELETON_FEMUR_RADIUS,
      ),
      postRotationTransform: matrix4Translate(
          SKELETON_FEMUR_LENGTH/2,
          0,
          0,
      ),
      children: [{
        id: SKELETON_PART_ID_SHIN_LEFT,
        modelId: MODEL_SKELETON_SHIN,
        textureId: TEXTURE_ID_BONE,
        // TODO flip model
        preRotationTransform: matrix4Translate(
            // TODO this should be SKELETON_FEMUR_LENGTH
            SKELETON_FEMUR_LENGTH/2,
            0,
            0,
        ),
        postRotationTransform: matrix4Translate(
            SKELETON_SHIN_WIDTH/2,
            0, 
            0
        ),
        children: [{
          id: SKELETON_PART_ID_FOOT_RIGHT,
          modelId: MODEL_SKELETON_FOOT,
          textureId: TEXTURE_ID_FOOT,
          preRotationTransform: matrix4Translate(
              SKELETON_SHIN_WIDTH,
              0,
              0,
          ),
          postRotationTransform: matrix4Multiply(
              matrix4Rotate(
                  Math.PI/2.5,
                  0,
                  1, 
                  0,
              ),
              matrix4Translate(
                  -SKELETON_FOOT_WIDTH/2,
                  0, 
                  -SKELETON_FOOT_DEPTH,
              ),
          ),
        }],        
      }],      
    }
  ],
};

//const SHAPE_SKELETON = shapeFromPlanes(planesCube(SKELETON_DIMENSION, SKELETON_DIMENSION, SKELETON_DEPTH));

const SHAPE_SKELETON_TORSO = shapeFromPlanes([
  ...planesCube(
      SKELETON_RIBCAGE_WIDTH,
      SKELETON_RIBCAGE_HEIGHT,
      SKELETON_RIBCAGE_DEPTH,
  ),
  ...planeFlipAndDuplicateOnAxis(planeFlipAndDuplicateOnAxis([
    // shoulder
    {
      d: .09,
      normal: vectorNNormalize([0, 1, 1])
    },
    // waist
    {
      d: .07,
      normal: vectorNNormalize([0, 3, -1])
    },
    // back rounding
    {
      d: .06,
      normal: vectorNNormalize([-2, 3, -1])
    },
  ], 1), 0),
  // collar
  {
    d: .085, 
    normal: vectorNNormalize([1, 0, 1])
  },
  // back
  {
    d: .07, 
    normal: vectorNNormalize([-1, 0, 1])
  },
  
]);

const SHAPE_SKELETON_HEAD = shapeFromPlanes([
  ...planesCube(
      SKELETON_HEAD_WIDTH,
      SKELETON_HEAD_HEIGHT,
      SKELETON_HEAD_DEPTH,
  ),
  ...planeFlipAndDuplicateOnAxis([
    // under jaw
    {
      d: .04,
      normal: vectorNNormalize([-1, 0, -3]),
    },
    // front of face
    {
      d: .05,
      normal: vectorNNormalize([1, 0, 0]),
    },
    // top of back of head
    {
      d: .04,
      normal: vectorNNormalize([-2, 0, 3]),
    },
    // side of face
    {
      d: .05,
      normal: vectorNNormalize([3, 3, 1]),
    },
    // forehead
    {
      d: .045,
      normal: vectorNNormalize([2, 0, 3]),
    },
    // right cheek narrowing
    {
      d: .05,
      normal: vectorNNormalize([4, 5, -2])
    },
    // right cranium rounding
    {
      d: .04,
      normal: vectorNNormalize([0, 2, 3])
    },
    // right back of head rounding (top)
    {
      d: .04,
      normal: vectorNNormalize([-3, 3, 1])
    },
    // right back of head rounding (bottom)
    {
      d: .045,
      normal: vectorNNormalize([-3, 3, -1])
    },
    // right bottom of head rounding
    {
      d: .045,
      normal: vectorNNormalize([0, 1, -1])
    },
  ], 1),
]);

const SHAPE_SKELETON_HIPS = shapeFromPlanes([
  ...planesCube(
      SKELETON_HIPS_WIDTH,
      SKELETON_HIPS_HEIGHT,
      SKELETON_HIPS_DEPTH,
  ),
  // ...planeFlipAndDuplicateOnAxis([
  //   {
  //     d: .04,
  //     normal: vectorNNormalize([0, 2, -1])
  //   }
  // ], 1)
]);

const SHAPE_SKELETON_HUMERUS = shapeFromPlanes(
    planesCapsule(6, SKELETON_HUMERUS_WIDTH, SKELETON_HUMERUS_DIAMETER/2)
    //planesCube(SKELETON_HUMERUS_WIDTH, SKELETON_HUMERUS_DIAMETER, SKELETON_HUMERUS_DIAMETER)
);

const SHAPE_SKELETON_FOREARM = shapeFromPlanes(
  planesCube(SKELETON_FOREARM_WIDTH, SKELETON_FOREARM_DIAMETER, SKELETON_FOREARM_DIAMETER),
)

const SHAPE_SKELETON_FEMUR = shapeFromPlanes(
    planesCapsule(6, SKELETON_FEMUR_LENGTH, SKELETON_FEMUR_RADIUS)
);

const SHAPE_SKELETON_SHIN = shapeFromPlanes(
    //planesCapsule(8, SKELETON_SHIN_LENGTH, SKELETON_SHIN_RADIUS, SKELETON_ANKLE_RADIUS)
    planesCube(SKELETON_SHIN_WIDTH, SKELETON_SHIN_DIAMETER, SKELETON_SHIN_DIAMETER)
);

const SHAPE_SKELETON_HAND = shapeFromPlanes(
    planesCube(SKELETON_HAND_DIMENSION, SKELETON_HAND_DIMENSION, SKELETON_HAND_DIMENSION),
);

const SHAPE_SKELETON_FOOT = shapeFromPlanes(
    planesCube(SKELETON_FOOT_WIDTH, SKELETON_FOOT_HEIGHT, SKELETON_FOOT_DEPTH),
);