///<reference path="brick.ts"/>
///<reference path="checkered.ts"/>
///<reference path="gradient.ts"/>
///<reference path="shaped.ts"/>
///<reference path="speckle.ts"/>
///<reference path="solid.ts"/>
///<reference path="texture.ts"/>


const whiteTextureFactory = createSolidTextureColorFactory([255, 255, 255, 127]);
const boneTextureFactory = createSpeckleTextureFactory(
    createSolidTextureColorFactory([255, 255, 200, 50]),
    .1,
    1,
);
const redTextureFactory = createSolidTextureColorFactory([255, 0, 0, 127]);
const brickTextureFactory = createSpeckleTextureFactory(createSolidTextureColorFactory([200, 120, 100, 127]), .2, 1);
const graniteTextureFactory = createSpeckleTextureFactory(createSolidTextureColorFactory([56, 67, 80, 127]), .4, 1);
const cyanTextureFactory = createSolidTextureColorFactory([128, 255, 255, 127]);
const magentaTextureFactory = createSolidTextureColorFactory([255, 0, 255, 127]);

const checkeredTextureFactory = createCheckeredTextureFactory([128, 128, 180, 127], [255, 255, 255, 127], 2);
const gradientTextureFactory = createLinearGradientTextureFactory(
    [255, 0, 0, 127],
    [-.5, -.5, -.5],
    [0, 255, 0, 127],
    [.5, .5, .5],
);

const rightHandNormalFactory = createShapedTextureNormalFactory([
  {
    shape: shapeFromPlanes(planesCapsule(6, .5, .05)),
    transform: matrix4Multiply(
        matrix4Translate(-.6, 0, 0),
        matrix4Rotate(-Math.PI/5, 0, .8, -.7),
        matrix4Translate(.4, 0, 0),
    ),
  },
  ...new Array(4).fill(0).flatMap((_, i) => {
    const a = -Math.PI/15 + i * Math.PI/15;
    const t = matrix4Multiply(
        matrix4Translate(-.6, 0, 0),
        matrix4Rotate(a, 0, 1, 0),
        matrix4Translate(.4, 0, 0),
    );
    return [{
      shape: shapeFromPlanes(planesCapsule(6, .5, .05)),
      transform: t,
      //type: SHAPED_RULE_TYPE_ADDITION,
    }, {
      shape: shapeFromPlanes(planesCapsule(6, .4, .05, .01)),
      transform: matrix4Multiply(
        t,
        matrix4Translate(.3, 0, 0),
        matrix4Rotate(Math.PI/4, 0, 0, 1),
        matrix4Translate(.2, 0, 0),
      )
      //type: SHAPED_RULE_TYPE_ADDITION,
    }]
  }),
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
const TEXTURE_ID_WHITE = 0;
const TEXTURE_ID_INCANDESENT = 1;
const TEXTURE_ID_BRICKS = 2;
const TEXTURE_ID_BLOCK = 3;
const TEXTURE_ID_SKULL = 4;
const TEXTURE_ID_BONE = 5
const TEXTURE_ID_HIPS = 6;
const TEXTURE_ID_RIBCAGE = 7;
const TEXTURE_ID_HAND_RIGHT = 8;
const TEXTURE_ID_HAND_LEFT = 9;
const TEXTURE_ID_FOOT = 10;
const TEXTURE_ID_WOOD = 11;

type TextureId = 
    | typeof TEXTURE_ID_WHITE
    | typeof TEXTURE_ID_INCANDESENT
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
    ;

const TEXTURE_FACTORIES: [TextureFactory, TextureFactory][] = [
  // TEXTURE_ID_WHITE
  [whiteTextureFactory, solidTextureNormalFactory],
  // TEXTURE_ID_INCANDESENT
  [createSolidTextureColorFactory([255, 255, 255, 255]), solidTextureNormalFactory],
  // TEXTURE_ID_BRICKS
  [
    graniteTextureFactory,
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
    whiteTextureFactory,
    //createBrickTextureNormalFactory(array3New(2, 2, 2, (x, y, z) => x * 16 + y * 4 + z), 2),
    createSpeckleTextureFactory(
        createBrickTextureNormalFactory([[[1]]], 1),
        .2,
    ),
    //createBrickTextureNormalFactory(array3New(1, 1, 1, () => 0), 1),
  ],
  // TEXTURE_ID_SKULL
  [
    createRadialGradientTextureFactory(
        [0, 255, 0, 255],
        [0, 0, 0],
        [255, 255, 200, 130],
        .4,
    ),
    //solidTextureNormalFactory,
    createShapedTextureNormalFactory([{
      shape: shapeFromPlanes(planesCube(1, 1, 1)),
      type: SHAPED_RULE_TYPE_ADDITION,
    }, {
      // eye
      shape: shapeFromPlanes(planesCapsule(8, .5, .1)),
      transform: matrix4Translate(.5, .2, 0),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // eye
      shape: shapeFromPlanes(planesCapsule(8, .5, .1)),
      transform: matrix4Translate(.5, -.2, 0),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // tooth gap
      shape: shapeFromPlanes(planesCube(.4, .1, .3)),
      transform: matrix4Translate(.5, .1, -.5),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // tooth gap
      shape: shapeFromPlanes(planesCube(.4, .1, .3)),
      transform: matrix4Translate(.5, -.1, -.5),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // back of teeth
      shape: shapeFromPlanes(planesCube(.2, 1, .2)),
      transform: matrix4Translate(.3, 0, -.5),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // cheek
      shape: shapeFromPlanes(planesCube(1, .3, .4)),
      transform: matrix4Translate(.5, -.5, -.5),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // cheek
      shape: shapeFromPlanes(planesCube(1, .3, .4)),
      transform: matrix4Translate(.5, .5, -.5),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    }]),
  ],
  // bone
  [
    boneTextureFactory,
    //gradientTextureFactory,
    createShapedTextureNormalFactory([
      {
        //shape: shapeFromPlanes(planesCube(.9, .3, 1)),
        shape: shapeFromPlanes(planesCapsule(8, .3, .4, .3)),
        transform: matrix4Translate(.05, 0, 0),
        //type: SHAPED_RULE_TYPE_ADDITION,
      },
      ...new Array(8).fill(0).map<ShapedRule>((_, i) => ({
        shape: shapeFromPlanes(planesCapsule(6, .4, .35, .4)),
        transform: matrix4Multiply(matrix4Rotate(i * Math.PI/4, 1, 0, 0), matrix4Translate(.1, 0, .5)),
        type: SHAPED_RULE_TYPE_SUBTRACTION,
      }))
    ]),
  ],
  // TEXTURE_ID_HIPS
  [
    boneTextureFactory,
    //solidTextureNormalFactory,
    createShapedTextureNormalFactory([{
      shape: shapeFromPlanes(planesCapsule(6, .6, .2, .1)),
      transform: matrix4Multiply(
        matrix4Translate(0, .3, 0),
        matrix4Rotate(-Math.PI/12, 1, 0, 0),
        matrix4Rotate(Math.PI/2, 0, 1, 0),
      ),
      //type: SHAPED_RULE_TYPE_ADDITION,
    }, {
      shape: shapeFromPlanes(planesCapsule(6, .6, .2, .1)),
      transform: matrix4Multiply(
        matrix4Translate(0, -.3, 0),
        matrix4Rotate(Math.PI/12, 1, 0, 0),
        matrix4Rotate(Math.PI/2, 0, 1, 0),
      ),
      //type: SHAPED_RULE_TYPE_ADDITION,
    }, {
      shape: shapeFromPlanes(planesCapsule(6, .6, .15)),
      transform: matrix4Multiply(
        matrix4Translate(0, 0, .3),
        matrix4Rotate(Math.PI/2, 0, 0, 1),
      ),
      //type: SHAPED_RULE_TYPE_ADDITION,
    }, {
      shape: shapeFromPlanes(planesCapsule(6, .2, .1)),
      transform: matrix4Multiply(
        matrix4Translate(0, 0, -.3),
        matrix4Rotate(Math.PI/2, 0, 0, 1),
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
        shape: shapeFromPlanes(planesCapsule(6, .8, .05)),
        transform: matrix4Multiply(
          matrix4Translate(-.2, 0, 0),
          matrix4Rotate(Math.PI/2.2, 0, 1, 0),
        ),
        //type: SHAPED_RULE_TYPE_ADDITION,
      },
      // ribs
      ...new Array(4).fill(0).flatMap<ShapedRule>((_, i) => {
        const RIB_RADIUS = .05;
        const RIB_WIDTH = .49;
        const CHEST_OFFSET = .3;
        const rib = shapeFromPlanes(planesCapsule(6, RIB_WIDTH, RIB_RADIUS));
        //const rib = shapeFromPlanes(planesCube(RIB_WIDTH, RIB_RADIUS, RIB_RADIUS));
        const z = .4 - i * .11;
        const yAngle = i * -Math.PI/16;
        return [{
          shape: rib,
          transform: matrix4Multiply(
            matrix4Translate(CHEST_OFFSET, 0, z),
            matrix4Rotate(Math.PI/1.7, 0, 0, 1),
            matrix4Rotate(-yAngle, 0, 1, 0),
            matrix4Translate(RIB_WIDTH/2, 0, 0),
          ),
          //type: SHAPED_RULE_TYPE_ADDITION,
        }, {
          shape: rib,
          transform: matrix4Multiply(
            matrix4Translate(CHEST_OFFSET, 0, z),
            matrix4Rotate(-Math.PI/1.7, 0, 0, 1),
            matrix4Rotate(-yAngle, 0, 1, 0),
            matrix4Translate(RIB_WIDTH/2, 0, 0),
          ),
          //type: SHAPED_RULE_TYPE_ADDITION,
        }, {
          shape: rib,
          transform: matrix4Multiply(
            matrix4Translate(-CHEST_OFFSET, 0, z),
            matrix4Rotate(Math.PI/1.5, 0, 0, 1),
            matrix4Rotate(yAngle, 0, 1, 0),
            matrix4Translate(-RIB_WIDTH/2, 0, 0),
          ),
          //type: SHAPED_RULE_TYPE_ADDITION,
        }, {
          shape: rib,
          transform: matrix4Multiply(
            matrix4Translate(-CHEST_OFFSET, 0, z),
            matrix4Rotate(-Math.PI/1.5, 0, 0, 1),
            matrix4Rotate(yAngle, 0, 1, 0),
            matrix4Translate(-RIB_WIDTH/2, 0, 0),
          ),
          //type: SHAPED_RULE_TYPE_ADDITION,
        }]
      }),
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
        const a = -Math.PI/10 + i * Math.PI/30;
        const t = matrix4Multiply(
            matrix4Translate(.6, 0, 0),
            matrix4Rotate(a, 0, 0, 1),
            matrix4Translate(-.4, 0, 0),
        );
        return {
          shape: shapeFromPlanes(planesCapsule(6, 1, .05, .02)),
          transform: t,
          //type: SHAPED_RULE_TYPE_ADDITION,
        };
      }),
    ])
  ],
  // TEXTURE_ID_WOOD
  [
    createSpeckleTextureFactory(
        createLinearGradientTextureFactory(
            [33, 22, 0, 127],
            [-.5, 0, 0],
            [164, 116, 73, 127],
            [.25, 0, 0],
        ),
        .4,
        1,
    ),
    //solidTextureNormalFactory,
    createSpeckleTextureFactory(solidTextureNormalFactory, .2),
  ],
];

const texture3D = createTextures(
    TEXTURE_FACTORIES,
    TEXTURE_SIZE,
);
//const texture3D = createTextures([[[[checkeredTextureFactory, solidTextureNormalFactory]]]], [1, 1, 1], TEXTURE_SIZE);