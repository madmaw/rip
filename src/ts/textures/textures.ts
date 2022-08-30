///<reference path="checkered.ts"/>
///<reference path="gradient.ts"/>
///<reference path="shaped.ts"/>
///<reference path="solid.ts"/>
///<reference path="texture.ts"/>

const whiteTextureFactory = createSolidTextureColorFactory([255, 255, 255, 127]);
const boneTextureFactory = createSolidTextureColorFactory([255, 255, 240, 127]);
const redTextureFactory = createSolidTextureColorFactory([255, 0, 0, 127]);
const blueTextureFactory = createSolidTextureColorFactory([128, 128, 255, 127]);
const cyanTextureFactory = createSolidTextureColorFactory([128, 255, 255, 127]);
const magentaTextureFactory = createSolidTextureColorFactory([255, 0, 255, 127]);

const checkeredTextureFactory = createCheckeredTextureFactory([128, 128, 180, 127], [255, 255, 255, 127], 2);
const gradientTextureFactory = createLinearGradientTextureFactory(
    [255, 0, 0, 127],
    [-.5, -.5, -.5],
    [0, 255, 0, 127],
    [.5, .5, .5],
)

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
const TEXTURE_ID_SKULL = 3;
const TEXTURE_ID_BONE = 4;

type TextureID = 
    | typeof TEXTURE_ID_WHITE
    | typeof TEXTURE_ID_INCANDESENT
    | typeof TEXTURE_ID_BRICKS
    | typeof TEXTURE_ID_SKULL
    | typeof TEXTURE_ID_BONE
    ;

const TEXTURE_FACTORIES: [TextureFactory, TextureFactory][] = [
  // TEXTURE_ID_WHITE
  [whiteTextureFactory, solidTextureNormalFactory],
  // TEXTURE_ID_INCANDESENT
  [createSolidTextureColorFactory([255, 255, 255, 255]), solidTextureNormalFactory],
  // TEXTURE_ID_BRICKS
  [checkeredTextureFactory, solidTextureNormalFactory],
  // TEXTURE_ID_SKULL
  [magentaTextureFactory, solidTextureNormalFactory],
  /*
  [
    createRadialGradientTextureFactory(
        [128, 0, 0, 255],
        [0, 0, 0],
        [255, 255, 220, 127],
        .4,
    ),
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
  */
  [
    //boneTextureFactory,
    gradientTextureFactory,
    createShapedTextureNormalFactory([{
      shape: shapeFromPlanes(planesCube(1, .3, 1)),
      //type: SHAPED_RULE_TYPE_ADDITION,
    },
    {
      shape: shapeFromPlanes(planesCapsule(3, .2, .2)),
      transform: matrix4Multiply(matrix4Translate(.85, 0, 0), matrix4Rotate(Math.PI/2, 0, 1, 0), matrix4Rotate(Math.PI/2, 0, 0, 1)),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    },
    ...new Array(8).fill(0).map<ShapedRule>((_, i) => ({
      shape: shapeFromPlanes(planesCapsule(6, .4, .4)),
      transform: matrix4Multiply(matrix4Rotate(i * Math.PI/4, 1, 0, 0), matrix4Translate(0, 0, .5)),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    }))]),
  ]
];

const texture3D = createTextures(
    TEXTURE_FACTORIES,
    TEXTURE_SIZE,
);
//const texture3D = createTextures([[[[checkeredTextureFactory, solidTextureNormalFactory]]]], [1, 1, 1], TEXTURE_SIZE);