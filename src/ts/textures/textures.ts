///<reference path="brick.ts"/>
///<reference path="checkered.ts"/>
///<reference path="gradient.ts"/>
///<reference path="shaped.ts"/>
///<reference path="speckle.ts"/>
///<reference path="solid.ts"/>
///<reference path="texture.ts"/>


const whiteTextureFactory = createSolidTextureColorFactory([255, 255, 255, 127]);
const boneColor: Vector4 = safeUnpackRGBA(
    [...'``R@'],
    FLAG_UNPACK_SUPPLY_ORIGINALS && [255, 255, 200, 127],
);
const boneTextureFactory = createSpeckleTextureFactory(
    createSolidTextureColorFactory(boneColor),
    .1,
    1,
);
const brickTextureFactory = createSpeckleTextureFactory(
    createSolidTextureColorFactory(
        safeUnpackRGBA(
            [...'R>9@'],
            FLAG_UNPACK_SUPPLY_ORIGINALS && [200, 120, 100, 127],
        )
    ),
    .2,
    1,
);
const sandstoneTextureFactory = createSpeckleTextureFactory(
    createSolidTextureColorFactory(
        safeUnpackRGBA(
            [...'.14@'],
            FLAG_UNPACK_SUPPLY_ORIGINALS && [56, 67, 80, 127],
        ),
    ),
    .4,
    1,
);

const rightHandNormalFactory = createShapedTextureNormalFactory([
  {
    shaped: shapeFromPlanes(planesCapsule(6, .5, .05)),
    transforms: matrix4Multiply(
        matrix4Translate(-.6, 0, 0),
        matrix4Rotate(-CONST_PI_ON_5_1DP, 0, .8, -.7),
        matrix4Translate(.4, 0, 0),
    ),
  },
  ...new Array(4).fill(0).map((_, i) => {
    const a = -CONST_PI_ON_15_2DP + i * CONST_PI_ON_15_2DP;
    const t = matrix4Multiply(
        matrix4Translate(-.6, 0, 0),
        matrix4Rotate(a, 0, 1, 0),
        matrix4Translate(.4, 0, 0),
    );
    return [{
      shaped: shapeFromPlanes(planesCapsule(6, .5, .05)),
      transforms: t,
      //type: SHAPED_RULE_TYPE_ADDITION,
    }, {
      shaped: shapeFromPlanes(planesCapsule(6, .4, .05, .01)),
      transforms: matrix4Multiply(
        t,
        matrix4Translate(.3, 0, 0),
        matrix4Rotate(CONST_PI_ON_4_1DP, 0, 0, 1),
        matrix4Translate(.2, 0, 0),
      )
      //type: SHAPED_RULE_TYPE_ADDITION,
    }]
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
const TEXTURE_ID_FLAME = 0;
const TEXTURE_ID_BRICKS = 1;
const TEXTURE_ID_BLOCK = 2;
const TEXTURE_ID_SKULL = 3;
const TEXTURE_ID_BONE = 4
const TEXTURE_ID_HIPS = 5;
const TEXTURE_ID_RIBCAGE = 6;
const TEXTURE_ID_HAND_RIGHT = 7;
const TEXTURE_ID_HAND_LEFT = 8;
const TEXTURE_ID_FOOT = 9;
const TEXTURE_ID_WOOD = 10;
const TEXTURE_ID_POTION = 11;

type TextureId = 
    | typeof TEXTURE_ID_FLAME
    | typeof TEXTURE_ID_BRICKS
    | typeof TEXTURE_ID_BLOCK
    | typeof TEXTURE_ID_SKULL
    | typeof TEXTURE_ID_BONE
    | typeof TEXTURE_ID_HIPS
    | typeof TEXTURE_ID_RIBCAGE
    | typeof TEXTURE_ID_HAND_RIGHT
    | typeof TEXTURE_ID_HAND_LEFT
    | typeof TEXTURE_ID_FOOT
    | typeof TEXTURE_ID_WOOD
    | typeof TEXTURE_ID_POTION
    ;

const TEXTURE_FACTORIES: [TextureFactory, TextureFactory][] = [
  // TEXTURE_ID_FLAME
  [
    createSolidTextureColorFactory(
        safeUnpackRGBA(
            [...'`M-`'],
            FLAG_UNPACK_SUPPLY_ORIGINALS && [255, 180, 50, 255],
        ),
    ),
    solidTextureNormalFactory,
  ],
  // TEXTURE_ID_BRICKS
  [
    sandstoneTextureFactory,
    createSpeckleTextureFactory(
        createBrickTextureNormalFactory(
            array3New(3, 3, 3, () => Math.random() * 3 | 0),
            2,
        ),
        .2,
    ),
    //createBrickTextureNormalFactory(array3New(1, 1, 1, () => 0), 1),
  ],
  // TEXTURE_ID_BLOCK
  [
    sandstoneTextureFactory,
    //createBrickTextureNormalFactory(array3New(2, 2, 2, (x, y, z) => x * 16 + y * 4 + z), 2),
    createSpeckleTextureFactory(
        createBrickTextureNormalFactory([[[1]]], 1),
        .2,
    ),
    //createBrickTextureNormalFactory(array3New(1, 1, 1, () => 0), 1),
  ],
  // TEXTURE_ID_SKULL
  [
    createSpeckleTextureFactory(createRadialGradientTextureFactory(
        [0, 255, 0, 255],
        [0, 0, 0],
        boneColor,
        .4,
    ), .2),
    //solidTextureNormalFactory,
    createShapedTextureNormalFactory([{
      shaped: shapeFromPlanes(planesCube(1, 1, 1)),
      ruleType: SHAPED_RULE_TYPE_ADDITION,
    }, {
      // eye
      shaped: shapeFromPlanes(planesCapsule(8, .5, .1)),
      transforms: matrix4Translate(.5, .2, 0),
      ruleType: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // eye
      shaped: shapeFromPlanes(planesCapsule(8, .5, .1)),
      transforms: matrix4Translate(.5, -.2, 0),
      ruleType: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // tooth gap
      shaped: shapeFromPlanes(planesCube(.4, .1, .3)),
      transforms: matrix4Translate(.5, .1, -.5),
      ruleType: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // tooth gap
      shaped: shapeFromPlanes(planesCube(.4, .1, .3)),
      transforms: matrix4Translate(.5, -.1, -.5),
      ruleType: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // back of teeth
      shaped: shapeFromPlanes(planesCube(.2, 1, .2)),
      transforms: matrix4Translate(.3, 0, -.5),
      ruleType: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // cheek
      shaped: shapeFromPlanes(planesCube(1, .3, .4)),
      transforms: matrix4Translate(.5, -.5, -.5),
      ruleType: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // cheek
      shaped: shapeFromPlanes(planesCube(1, .3, .4)),
      transforms: matrix4Translate(.5, .5, -.5),
      ruleType: SHAPED_RULE_TYPE_SUBTRACTION,
    }]),
  ],
  // bone
  [
    boneTextureFactory,
    //gradientTextureFactory,
    createShapedTextureNormalFactory([
      {
        //shape: shapeFromPlanes(planesCube(.9, .3, 1)),
        shaped: shapeFromPlanes(planesCapsule(8, .3, .4, .3)),
        transforms: matrix4Translate(.05, 0, 0),
        //type: SHAPED_RULE_TYPE_ADDITION,
      },
      ...new Array(8).fill(0).map<ShapedRule>((_, i) => ({
        shaped: shapeFromPlanes(planesCapsule(6, .4, .35, .4)),
        transforms: matrix4Multiply(matrix4Rotate(i * CONST_PI_ON_4_1DP, 1, 0, 0), matrix4Translate(.1, 0, .5)),
        ruleType: SHAPED_RULE_TYPE_SUBTRACTION,
      }))
    ]),
  ],
  // TEXTURE_ID_HIPS
  [
    boneTextureFactory,
    //solidTextureNormalFactory,
    createShapedTextureNormalFactory([{
      shaped: shapeFromPlanes(planesCapsule(6, .6, .2, .1)),
      transforms: matrix4Multiply(
        matrix4Translate(0, .3, 0),
        matrix4Rotate(-CONST_PI_ON_12_2DP, 1, 0, 0),
        matrix4Rotate(CONST_PI_ON_2_1DP, 0, 1, 0),
      ),
      //type: SHAPED_RULE_TYPE_ADDITION,
    }, {
      shaped: shapeFromPlanes(planesCapsule(6, .6, .2, .1)),
      transforms: matrix4Multiply(
        matrix4Translate(0, -.3, 0),
        matrix4Rotate(CONST_PI_ON_12_2DP, 1, 0, 0),
        matrix4Rotate(CONST_PI_ON_2_1DP, 0, 1, 0),
      ),
      //type: SHAPED_RULE_TYPE_ADDITION,
    }, {
      shaped: shapeFromPlanes(planesCapsule(6, .6, .15)),
      transforms: matrix4Multiply(
        matrix4Translate(0, 0, .3),
        matrix4Rotate(CONST_PI_ON_2_1DP, 0, 0, 1),
      ),
      //type: SHAPED_RULE_TYPE_ADDITION,
    }, {
      shaped: shapeFromPlanes(planesCapsule(6, .2, .1)),
      transforms: matrix4Multiply(
        matrix4Translate(0, 0, -.3),
        matrix4Rotate(CONST_PI_ON_2_1DP, 0, 0, 1),
      ),
      //type: SHAPED_RULE_TYPE_ADDITION,
    }]),
  ],
  // TEXTURE_ID_RIBCAGE
  [
    boneTextureFactory,
    //solidTextureNormalFactory,
    createShapedTextureNormalFactory([
      // spine
      {
        shaped: shapeFromPlanes(planesCapsule(6, .8, .05)),
        transforms: matrix4Multiply(
          matrix4Translate(-.2, 0, 0),
          matrix4Rotate(Math.PI/2.2, 0, 1, 0),
        ),
        //type: SHAPED_RULE_TYPE_ADDITION,
      },
      // ribs
      ...new Array(4).fill(0).map<ShapedRule[]>((_, i) => {
        const RIB_RADIUS = .05;
        const RIB_WIDTH = .49;
        const CHEST_OFFSET = .3;
        const rib = shapeFromPlanes(planesCapsule(6, RIB_WIDTH, RIB_RADIUS));
        //const rib = shapeFromPlanes(planesCube(RIB_WIDTH, RIB_RADIUS, RIB_RADIUS));
        const z = .4 - i * .11;
        const yAngle = i * -CONST_PI_ON_1_6_1DP;
        return [{
          shaped: rib,
          transforms: matrix4Multiply(
            matrix4Translate(CHEST_OFFSET, 0, z),
            matrix4Rotate(Math.PI/1.7, 0, 0, 1),
            matrix4Rotate(-yAngle, 0, 1, 0),
            matrix4Translate(RIB_WIDTH/2, 0, 0),
          ),
          //type: SHAPED_RULE_TYPE_ADDITION,
        }, {
          shaped: rib,
          transforms: matrix4Multiply(
            matrix4Translate(CHEST_OFFSET, 0, z),
            matrix4Rotate(-Math.PI/1.7, 0, 0, 1),
            matrix4Rotate(-yAngle, 0, 1, 0),
            matrix4Translate(RIB_WIDTH/2, 0, 0),
          ),
          //type: SHAPED_RULE_TYPE_ADDITION,
        }, {
          shaped: rib,
          transforms: matrix4Multiply(
            matrix4Translate(-CHEST_OFFSET, 0, z),
            matrix4Rotate(CONST_PI_ON_1_5_1DP, 0, 0, 1),
            matrix4Rotate(yAngle, 0, 1, 0),
            matrix4Translate(-RIB_WIDTH/2, 0, 0),
          ),
          //type: SHAPED_RULE_TYPE_ADDITION,
        }, {
          shaped: rib,
          transforms: matrix4Multiply(
            matrix4Translate(-CHEST_OFFSET, 0, z),
            matrix4Rotate(-CONST_PI_ON_1_5_1DP, 0, 0, 1),
            matrix4Rotate(yAngle, 0, 1, 0),
            matrix4Translate(-RIB_WIDTH/2, 0, 0),
          ),
          //type: SHAPED_RULE_TYPE_ADDITION,
        }]
      }).flat(),
    ]),
  ],
  // TEXTURE_ID_HAND_RIGHT
  [
    // maybe a gradient?
    boneTextureFactory,
    rightHandNormalFactory,
    //solidTextureNormalFactory,
  ],
  // TEXTURE_ID_HAND_LEFT
  [
    boneTextureFactory,
    leftHandNormalFactory,
    //solidTextureNormalFactory,
  ],
  // TEXTURE_ID_FOOT
  [
    boneTextureFactory,
    //solidTextureNormalFactory,
    createShapedTextureNormalFactory([
      ...new Array(5).fill(0).map((_, i) => {
        const a = -CONST_PI_ON_10_2DP + i * CONST_PI_ON_30_2DP;
        const t = matrix4Multiply(
            matrix4Translate(.6, 0, 0),
            matrix4Rotate(a, 0, 0, 1),
            matrix4Translate(-.4, 0, 0),
        );
        return {
          shaped: shapeFromPlanes(planesCapsule(6, 1, .05, .02)),
          transforms: t,
          //type: SHAPED_RULE_TYPE_ADDITION,
        };
      }),
    ])
  ],
  // TEXTURE_ID_WOOD
  [
    createSpeckleTextureFactory(
        createLinearGradientTextureFactory(
            safeUnpackRGBA(
                [...'1+#@'],
                FLAG_UNPACK_SUPPLY_ORIGINALS && [66, 44, 11, 127]
            ),
            [-.5, 0, 0],
            safeUnpackRGBA(
                [...'RA2@'],
                FLAG_UNPACK_SUPPLY_ORIGINALS && [200, 130, 73, 127],
            ),
            [.25, 0, 0],
        ),
        .4,
        1,
    ),
    //solidTextureNormalFactory,
    createSpeckleTextureFactory(solidTextureNormalFactory, .2),
  ],
  // TEXTURE_ID_POTION
  [
    createLinearGradientTextureFactory(
        safeUnpackRGBA(
            [...'`0@K'],
            FLAG_UNPACK_SUPPLY_ORIGINALS && [255, 64, 128, 170],
        ),
        [.5, 0, 0],
        safeUnpackRGBA(
            [...'`  `'],
            FLAG_UNPACK_SUPPLY_ORIGINALS && [255, 0, 0, 255],
        ),
        [-.5, 0, 0],
    ),
    solidTextureNormalFactory,
  ],
];

//const texture3D = createTextures([[[[checkeredTextureFactory, solidTextureNormalFactory]]]], [1, 1, 1], TEXTURE_SIZE);