///<reference path="brick.ts"/>
///<reference path="checkered.ts"/>
///<reference path="gradient.ts"/>
///<reference path="shaped.ts"/>
///<reference path="speckle.ts"/>
///<reference path="solid.ts"/>
///<reference path="texture.ts"/>


const whiteTextureFactory = createSolidTextureColorFactory([255, 255, 255, 127]);
const boneColor: Vector4 = safeUnpackRGBA(
    !FLAG_UNPACK_USE_ORIGINALS && [...'hhZA'],
    FLAG_UNPACK_SUPPLY_ORIGINALS && [255, 255, 200, 99],
);
const charredBoneColor: Vector4 = safeUnpackRGBA(
    !FLAG_UNPACK_USE_ORIGINALS && [...'25<H'],
    FLAG_UNPACK_SUPPLY_ORIGINALS && [40, 50, 80, 127],
);

const rightHandNormalFactory = createShapedTextureNormalFactory([
  [
    shapeFromPlanes(planesCapsule(6, .5, .05)),
    matrix4Multiply(
        matrix4Translate(-.6, 0, 0),
        matrix4Rotate(-CONST_PI_ON_5_1DP, 0, .8, -.7),
        matrix4Translate(.4, 0, 0),
    ),
  ],
  ...new Array(4).fill(0).map<ShapedRule[]>((_, i) => {
    const a = -CONST_PI_ON_15_2DP + i * CONST_PI_ON_15_2DP;
    const t = matrix4Multiply(
        matrix4Translate(-.6, 0, 0),
        matrix4Rotate(a, 0, 1, 0),
        matrix4Translate(.4, 0, 0),
    );
    return [[
      shapeFromPlanes(planesCapsule(6, .5, .05)),
      t,
      //type: SHAPED_RULE_TYPE_ADDITION,
    ], [
      shapeFromPlanes(planesCapsule(6, .4, .05, .01)),
      matrix4Multiply(
        t,
        matrix4Translate(.3, 0, 0),
        matrix4Rotate(CONST_PI_ON_4_1DP, 0, 0, 1),
        matrix4Translate(.2, 0, 0),
      )
      //type: SHAPED_RULE_TYPE_ADDITION,
    ]]
  }).flat(),
]);
const leftHandNormalFactory = (z: number, y: number, x: number) => {
  const n = rightHandNormalFactory(z, -y, x);
  n[1] = 255 - n[1];
  return n;
}

/*
const shapedTextureNormalFactory = createShapedTextureNormalFactory([{
  shape: shapeFromPlanes(planesCube(1, 1, 1)),
  //transform: matrix4Translate(0, 0, 0),
  // TODO make type (default to addition)
  type: SHAPED_RULE_TYPE_ADDITION,
}, {
  shape: shapeFromPlanes(planesCube(.4, .4, .1)),
  transform: matrix4Translate(0, 0, .5),
  type: SHAPED_RULE_TYPE_SUBTRACTION,
}, {
  shape: shapeFromPlanes(planesCube(.1, .4, .4)),
  transform: matrix4Translate(-.5, 0, 0),
  type: SHAPED_RULE_TYPE_SUBTRACTION,
// }, {
//   shape: shapeFromPlanes(planesCube(.4, .4, .4)),
//   transform: matrix4Translate(.5, .5, .5),
//   type: SHAPED_RULE_TYPE_SUBTRACTION,
}]);
*/
const COLOR_TEXTURE_ID_FLAME = 0;
const COLOR_TEXTURE_ID_WOOD = 1;
const COLOR_TEXTURE_ID_POTION_HEALING = 2;
const COLOR_TEXTURE_ID_BONE = 3;
const COLOR_TEXTURE_ID_SKULL = 4;
const COLOR_TEXTURE_ID_BONE_BLACKENED = 5;
const COLOR_TEXTURE_ID_SKULL_BLACKENED = 6;
const COLOR_TEXTURE_ID_METAL = 7;
const COLOR_TEXTURE_ID_STONE_1 = 8;
const COLOR_TEXTURE_ID_STONE_2 = 9;
const COLOR_TEXTURE_ID_STONE_3 = 10;
const COLOR_TEXTURE_ID_STONE_4 = 11;
const COLOR_TEXTURE_ID_STONE_5 = 12;

const COLOR_TEXTURE_STONE_COUNT = 5;

const COLOR_TEXTURE_STONE_FROM = safeUnpackRGBA(
    !FLAG_UNPACK_USE_ORIGINALS && [...'2<FH'],
    FLAG_UNPACK_SUPPLY_ORIGINALS && [40, 80, 120, 127],
);
const COLOR_TEXTURE_STONE_TO = safeUnpackRGBA(
    !FLAG_UNPACK_USE_ORIGINALS && [...'dKA:'],
    FLAG_UNPACK_SUPPLY_ORIGINALS && [240, 140, 100, 70],
);

const NORMAL_TEXTURE_BRICKS_COUNT = 4;

const NORMAL_TEXTURE_ID_SOLID = 0;
const NORMAL_TEXTURE_ID_BONE = 1;
const NORMAL_TEXTURE_ID_FOOT = 2;
const NORMAL_TEXTURE_ID_SKULL = 3;
const NORMAL_TEXTURE_ID_HIPS = 4;
const NORMAL_TEXTURE_ID_RIBCAGE = 5;
const NORMAL_TEXTURE_ID_HAND_RIGHT = 6;
const NORMAL_TEXTURE_ID_HAND_LEFT = 7;
const NORMAL_TEXTURE_ID_BRICKS_1 = 8;
const NORMAL_TEXTURE_ID_BRICKS_2 = 9;
const NORMAL_TEXTURE_ID_BRICKS_3 = 10;
const NORMAL_TEXTURE_ID_BRICKS_4 = 11;


type ColorTextureId = 
    | typeof COLOR_TEXTURE_ID_FLAME
    | typeof COLOR_TEXTURE_ID_WOOD
    | typeof COLOR_TEXTURE_ID_POTION_HEALING
    | typeof COLOR_TEXTURE_ID_BONE
    | typeof COLOR_TEXTURE_ID_BONE_BLACKENED
    | typeof COLOR_TEXTURE_ID_SKULL
    | typeof COLOR_TEXTURE_ID_SKULL_BLACKENED
    | typeof COLOR_TEXTURE_ID_METAL
    | typeof COLOR_TEXTURE_ID_STONE_1
    | typeof COLOR_TEXTURE_ID_STONE_2
    | typeof COLOR_TEXTURE_ID_STONE_3
    | typeof COLOR_TEXTURE_ID_STONE_4
    | typeof COLOR_TEXTURE_ID_STONE_5
    ;

type NormalTextureId =
    | typeof NORMAL_TEXTURE_ID_SOLID
    | typeof NORMAL_TEXTURE_ID_BONE
    | typeof NORMAL_TEXTURE_ID_FOOT
    | typeof NORMAL_TEXTURE_ID_SKULL
    | typeof NORMAL_TEXTURE_ID_HIPS
    | typeof NORMAL_TEXTURE_ID_RIBCAGE
    | typeof NORMAL_TEXTURE_ID_HAND_RIGHT
    | typeof NORMAL_TEXTURE_ID_HAND_LEFT
    | typeof NORMAL_TEXTURE_ID_BRICKS_1
    | typeof NORMAL_TEXTURE_ID_BRICKS_2
    | typeof NORMAL_TEXTURE_ID_BRICKS_3
    | typeof NORMAL_TEXTURE_ID_BRICKS_4
    ;



const COLOR_TEXTURE_FACTORIES: TextureFactory[] = [
  //COLOR_TEXTURE_ID_FLAME
  createSolidTextureColorFactory(
      safeUnpackRGBA(
          !FLAG_UNPACK_USE_ORIGINALS && [...'hU5h'],
          FLAG_UNPACK_SUPPLY_ORIGINALS && [255, 180, 50, 255],
      ),
  ),
  // COLOR_TEXTURE_ID_WOOD
  createSpeckleTextureFactory(
      createRadialGradientTextureFactory(
          safeUnpackRGBA(
              !FLAG_UNPACK_USE_ORIGINALS && [...'93+H'],
              FLAG_UNPACK_SUPPLY_ORIGINALS && [66, 44, 11, 127]
          ),
          [-.5, 0, 0],
          safeUnpackRGBA(
              !FLAG_UNPACK_USE_ORIGINALS && [...'NA0H'],
              FLAG_UNPACK_SUPPLY_ORIGINALS && [150, 99, 30, 127],
          ),
          .7,
      ),
      .4,
      1,
  ),
  // COLOR_TEXTURE_ID_POTION_HEALING
  createRadialGradientTextureFactory(
      safeUnpackRGBA(
          !FLAG_UNPACK_USE_ORIGINALS && [...'h8HS'],
          FLAG_UNPACK_SUPPLY_ORIGINALS && [255, 64, 128, 170],
      ),
      [.5, 0, 0],
      safeUnpackRGBA(
          !FLAG_UNPACK_USE_ORIGINALS && [...'h((h'],
          FLAG_UNPACK_SUPPLY_ORIGINALS && [255, 0, 0, 255],
      ),
      .8,
  ),
  // COLOR_TEXTURE_ID_BONE
  createSpeckleTextureFactory(
      createSolidTextureColorFactory(boneColor),
      .1,
      1,
  ),
  // COLOR_TEXTURE_ID_SKULL
  createSpeckleTextureFactory(
      createRadialGradientTextureFactory(
          safeUnpackRGBA(
              !FLAG_UNPACK_USE_ORIGINALS && [...'h((h'],
              FLAG_UNPACK_SUPPLY_ORIGINALS && [255, 0, 0, 255],
          ),
          [0, 0, 0],
          boneColor,
          .4,
      ),
      .1,
      1,
  ),
  // COLOR_TEXTURE_ID_BONE_BLACKENED
  createSpeckleTextureFactory(
      createSolidTextureColorFactory(charredBoneColor),
      .2,
      1,
  ),
  // COLOR_TEXTURE_ID_SKULL_BLACKENED  
  createSpeckleTextureFactory(
      createRadialGradientTextureFactory(
          safeUnpackRGBA(
              !FLAG_UNPACK_USE_ORIGINALS && [...'(Zhh'],
              FLAG_UNPACK_SUPPLY_ORIGINALS && [0, 199, 255, 255],
          ),
          [0, 0, 0],
          charredBoneColor,
          .4,
      ),
      .2,
      1,
  ),
  // COLOR_TEXTURE_ID_METAL
  // TODO what would a radial gradient look like here instead?
  createRadialGradientTextureFactory(
      safeUnpackRGBA(
          !FLAG_UNPACK_USE_ORIGINALS && [...'9:;0'],
          FLAG_UNPACK_SUPPLY_ORIGINALS && [67,70,75, 30]
      ),
      [0, 0, 0],
      safeUnpackRGBA(
          !FLAG_UNPACK_USE_ORIGINALS && [...'FIN+'],
          FLAG_UNPACK_SUPPLY_ORIGINALS && [120,130,150, 10],
      ),
      .4,
  ),
  // COLOR_TEXTURES
  ...new Array(COLOR_TEXTURE_STONE_COUNT).fill(0).map((_, i) => {
    return createSpeckleTextureFactory(
        createSolidTextureColorFactory(
            COLOR_TEXTURE_STONE_FROM.map(
                (v, j) => v + (COLOR_TEXTURE_STONE_TO[j] - v) * i/(COLOR_TEXTURE_STONE_COUNT-1) | 0,
            ) as Vector4,
        ),
        .3,
        1,
    );
  }),
];

const NORMAL_TEXTURE_FACTORIES: TextureFactory[] = [
  // NORMAL_TEXTURE_ID_SOLID
  solidTextureNormalFactory,
  // NORMAL_TEXTURE_ID_BONE
  createShapedTextureNormalFactory([
    [
      //shape: shapeFromPlanes(planesCube(.9, .3, 1)),
      shapeFromPlanes(planesCapsule(8, .3, .4, .3)),
      matrix4Translate(.05, 0, 0),
      //type: SHAPED_RULE_TYPE_ADDITION,
    ],
    ...new Array(8).fill(0).map<ShapedRule>((_, i) => ([
      shapeFromPlanes(planesCapsule(6, .4, .35, .4)),
      matrix4Multiply(matrix4Rotate(i * CONST_PI_ON_4_1DP, 1, 0, 0), matrix4Translate(.1, 0, .5)),
      SHAPED_RULE_TYPE_SUBTRACTION,
    ]))
  ]),
  
  // NORMAL_TEXTURE_ID_FOOT
  createShapedTextureNormalFactory([
    ...new Array(5).fill(0).map<ShapedRule>((_, i) => {
      const a = -CONST_PI_ON_10_2DP + i * CONST_PI_ON_30_2DP;
      const t = matrix4Multiply(
          matrix4Translate(.6, 0, 0),
          matrix4Rotate(a, 0, 0, 1),
          matrix4Translate(-.4, 0, 0),
      );
      return [
        shapeFromPlanes(planesCapsule(6, 1, .05, .02)),
        t,
        //type: SHAPED_RULE_TYPE_ADDITION,
      ];
    }),
  ]),

  // NORMAL_TEXTURE_ID_SKULL
  createShapedTextureNormalFactory(
      [[
        shapeFromPlanes(planesCube(1, 1, 1)),
        //ruleType: SHAPED_RULE_TYPE_ADDITION,
      ], [
        // eye
        shapeFromPlanes(planesCapsule(8, .5, .1)),
        matrix4Translate(.5, .2, 0),
        SHAPED_RULE_TYPE_SUBTRACTION,
      ], [
        // eye
        shapeFromPlanes(planesCapsule(8, .5, .1)),
        matrix4Translate(.5, -.2, 0),
        SHAPED_RULE_TYPE_SUBTRACTION,
      ], [
        // tooth gap
        shapeFromPlanes(planesCube(.4, .1, .3)),
        matrix4Translate(.5, .1, -.5),
        SHAPED_RULE_TYPE_SUBTRACTION,
      ], [
        // tooth gap
        shapeFromPlanes(planesCube(.4, .1, .3)),
        matrix4Translate(.5, -.1, -.5),
        SHAPED_RULE_TYPE_SUBTRACTION,
      ], [
        // back of teeth
        shapeFromPlanes(planesCube(.2, 1, .2)),
        matrix4Translate(.3, 0, -.5),
        SHAPED_RULE_TYPE_SUBTRACTION,
      ], [
        // cheek
        shapeFromPlanes(planesCube(1, .3, .4)),
        matrix4Translate(.5, -.5, -.5),
        SHAPED_RULE_TYPE_SUBTRACTION,
      ], [
        // cheek
        shapeFromPlanes(planesCube(1, .3, .4)),
        matrix4Translate(.5, .5, -.5),
        SHAPED_RULE_TYPE_SUBTRACTION,
      ]]
  ),
  // NORMAL_TEXTURE_ID_HIPS
  createShapedTextureNormalFactory(
      [[
        shapeFromPlanes(planesCapsule(6, .6, .2, .1)),
        safeUnpackMatrix4(
            !FLAG_UNPACK_USE_ORIGINALS && [...'G@)HHg@HhHGHHRHh'],
            FLAG_UNPACK_SUPPLY_ORIGINALS && matrix4Multiply(
                matrix4Translate(0, .3, 0),
                matrix4Rotate(-CONST_PI_ON_12_2DP, 1, 0, 0),
                matrix4Rotate(CONST_PI_ON_2_1DP, 0, 1, 0),
            )
        ),
        // matrix4Multiply(
        //     matrix4Translate(0, .3, 0),
        //     matrix4Rotate(-CONST_PI_ON_12_2DP, 1, 0, 0),
        //     matrix4Rotate(CONST_PI_ON_2_1DP, 0, 1, 0),
        // )
        //type: SHAPED_RULE_TYPE_ADDITION,
      ], [
        shapeFromPlanes(planesCapsule(6, .6, .2, .1)),
        safeUnpackMatrix4(
            !FLAG_UNPACK_USE_ORIGINALS && [...'GP)HHgPHhHGHH>Hh'],
            FLAG_UNPACK_SUPPLY_ORIGINALS && matrix4Multiply(
                matrix4Translate(0, -.3, 0),
                matrix4Rotate(CONST_PI_ON_12_2DP, 1, 0, 0),
                matrix4Rotate(CONST_PI_ON_2_1DP, 0, 1, 0),
            ),
        ),
        // matrix4Multiply(
        //     matrix4Translate(0, -.3, 0),
        //     matrix4Rotate(CONST_PI_ON_12_2DP, 1, 0, 0),
        //     matrix4Rotate(CONST_PI_ON_2_1DP, 0, 1, 0),
        // )
        //type: SHAPED_RULE_TYPE_ADDITION,
      ], [
        shapeFromPlanes(planesCapsule(6, .6, .15)),
        // safeUnpackMatrix4(
        //   !FLAG_UNPACK_USE_ORIGINALS && [...'GhHH(GHHHHhHHHRh'],
        //   FLAG_UNPACK_SUPPLY_ORIGINALS && matrix4Multiply(
        //       matrix4Translate(0, 0, .3),
        //       matrix4Rotate(CONST_PI_ON_2_1DP, 0, 0, 1),
        //   )
        // ),
        matrix4Multiply(
            matrix4Translate(0, 0, .3),
            matrix4Rotate(CONST_PI_ON_2_1DP, 0, 0, 1),
        ),
        //type: SHAPED_RULE_TYPE_ADDITION,
      ], [
        shapeFromPlanes(planesCapsule(6, .2, .1)),
        // safeUnpackMatrix4(
        //   !FLAG_UNPACK_USE_ORIGINALS && [...'GhHH(GHHHHhHHHRh'],
        //   FLAG_UNPACK_SUPPLY_ORIGINALS && matrix4Multiply(
        //       matrix4Translate(0, 0, -.3),
        //       matrix4Rotate(CONST_PI_ON_2_1DP, 0, 0, 1),
        //   ),
        // ),
        matrix4Multiply(
            matrix4Translate(0, 0, -.3),
            matrix4Rotate(CONST_PI_ON_2_1DP, 0, 0, 1),
        )
        //type: SHAPED_RULE_TYPE_ADDITION,
      ]]
  ),
  // NORMAL_TEXTURE_ID_RIBCAGE
  createShapedTextureNormalFactory([
    // spine
    [
      shapeFromPlanes(planesCapsule(6, .8, .05)),
      matrix4Multiply(
        matrix4Translate(-.2, 0, 0),
        matrix4Rotate(CONST_PI_ON_2_2_1DP, 0, 1, 0),
      ),
      //type: SHAPED_RULE_TYPE_ADDITION,
    ],
    // ribs
    ...new Array(4).fill(0).map<ShapedRule[]>((_, i) => {
      const RIB_RADIUS = .05;
      const RIB_WIDTH = .49;
      const CHEST_OFFSET = .3;
      const rib = shapeFromPlanes(planesCapsule(6, RIB_WIDTH, RIB_RADIUS));
      //const rib = shapeFromPlanes(planesCube(RIB_WIDTH, RIB_RADIUS, RIB_RADIUS));
      const z = .4 - i * .11;
      const yAngle = i * -CONST_PI_ON_9_1DP;
      return [[
        rib,
        matrix4Multiply(
          matrix4Translate(CHEST_OFFSET, 0, z),
          matrix4Rotate(CONST_PI_ON_1_7_1DP, 0, 0, 1),
          matrix4Rotate(-yAngle, 0, 1, 0),
          matrix4Translate(RIB_WIDTH/2, 0, 0),
        ),
        //type: SHAPED_RULE_TYPE_ADDITION,
      ], [
        rib,
        matrix4Multiply(
          matrix4Translate(CHEST_OFFSET, 0, z),
          matrix4Rotate(-CONST_PI_ON_1_7_1DP, 0, 0, 1),
          matrix4Rotate(-yAngle, 0, 1, 0),
          matrix4Translate(RIB_WIDTH/2, 0, 0),
        ),
        //type: SHAPED_RULE_TYPE_ADDITION,
      ], [
        rib,
        matrix4Multiply(
          matrix4Translate(-CHEST_OFFSET, 0, z),
          matrix4Rotate(CONST_PI_ON_1_5_1DP, 0, 0, 1),
          matrix4Rotate(yAngle, 0, 1, 0),
          matrix4Translate(-RIB_WIDTH/2, 0, 0),
        ),
        //type: SHAPED_RULE_TYPE_ADDITION,
      ], [
        rib,
        matrix4Multiply(
          matrix4Translate(-CHEST_OFFSET, 0, z),
          matrix4Rotate(-CONST_PI_ON_1_5_1DP, 0, 0, 1),
          matrix4Rotate(yAngle, 0, 1, 0),
          matrix4Translate(-RIB_WIDTH/2, 0, 0),
        ),
        //type: SHAPED_RULE_TYPE_ADDITION,
      ]]
    }).flat(),
  ]),
  // NORMAL_TEXTURE_ID_HAND_RIGHT
  rightHandNormalFactory,
  // NORMAL_TEXTURE_ID_HAND_LEFT
  leftHandNormalFactory,
  // BRICKS
  ...new Array(NORMAL_TEXTURE_BRICKS_COUNT).fill(0).map((_, i) => {
    const dimension = i+1;
    return createSpeckleTextureFactory(
        createBrickTextureNormalFactory(
            array3New(dimension, dimension, dimension, () => Math.random() * 3 | 0),
            dimension,
        ),
        ((NORMAL_TEXTURE_BRICKS_COUNT) - i)/(NORMAL_TEXTURE_BRICKS_COUNT * 9),
    );
  }),
];

const TEXTURE_FACTORIES = [COLOR_TEXTURE_FACTORIES, NORMAL_TEXTURE_FACTORIES];