///<reference path="checkered.ts"/>
///<reference path="gradient.ts"/>
///<reference path="shaped.ts"/>
///<reference path="solid.ts"/>
///<reference path="texture.ts"/>

const whiteTextureFactory = createSolidTextureColorFactory([255, 255, 255, 127]);
const boneTextureFactory = createSolidTextureColorFactory([255, 255, 240, 127]);
const redTextureFactory = createSolidTextureColorFactory([255, 0, 0, 127]);
const blueTextureFactory = createSolidTextureColorFactory([128, 128, 255, 127]);
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
const TEXTURE_ID_BRICKS = 1;
const TEXTURE_ID_SKELETON_HEAD = 2;
const TEXTURE_ID_INCANDESENT = 3;

type TextureID = 
    | typeof TEXTURE_ID_WHITE
    | typeof TEXTURE_ID_BRICKS
    | typeof TEXTURE_ID_SKELETON_HEAD
    | typeof TEXTURE_ID_INCANDESENT
    ;

const TEXTURE_FACTORIES: [TextureFactory, TextureFactory][] = [
  // TEXTURE_ID_WHITE
  [whiteTextureFactory, solidTextureNormalFactory],
  // TEXTURE_ID_BRICKS
  [checkeredTextureFactory, solidTextureNormalFactory],
  // TEXTURE_ID_SKELETON_HEAD
  [
    createRadialGradientTextureFactory(
        [255, 0, 0, 127],
        [0, 0, 0],
        [255, 255, 220, 127],
        .3,
    ),
    createShapedTextureNormalFactory([{
      shape: shapeFromPlanes(planesCube(1, 1, 1)),
      type: SHAPED_RULE_TYPE_ADDITION,
    // }, {
    //   // face hole
    //   shape: shapeFromPlanes(planesCapsule(8, .1, .4)),
    //   transform: matrix4Translate(.5, 0, 0),
    //   type: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // cheek
      shape: shapeFromPlanes(planesCube(5, .5, .4)),
      transform: matrix4Translate(0, -.5, -.5),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
      /*

    }, {
      // eye
      shape: shapeFromPlanes(planesCapsule(8, .1, .2)),
      transform: matrix4Translate(.5, .2, .1),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // eye
      shape: shapeFromPlanes(planesCapsule(6, .5, .1)),
      transform: matrix4Translate(.5, -.2, .1),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // tooth gap
      shape: shapeFromPlanes(planesCube(1, .1, .2)),
      transform: matrix4Translate(0, .1, -.5),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // tooth gap
      shape: shapeFromPlanes(planesCube(1, .1, .2)),
      transform: matrix4Translate(0, -.1, -.5),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // cheek
      shape: shapeFromPlanes(planesCube(5, .5, .4)),
      transform: matrix4Translate(0, -.5, -.5),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
    }, {
      // cheek
      shape: shapeFromPlanes(planesCube(5, .5, .4)),
      transform: matrix4Translate(0, .5, -.5),
      type: SHAPED_RULE_TYPE_SUBTRACTION,
      */
    }]),
  ],
  // TEXTURE_ID_INCANDESENT
  [createSolidTextureColorFactory([255, 255, 255, 255]), solidTextureNormalFactory],
];

const texture3D = createTextures(
    TEXTURE_FACTORIES,
    TEXTURE_SIZE,
);
//const texture3D = createTextures([[[[checkeredTextureFactory, solidTextureNormalFactory]]]], [1, 1, 1], TEXTURE_SIZE);