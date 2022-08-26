///<reference path="checkered.ts"/>
///<reference path="gradient.ts"/>
///<reference path="shaped.ts"/>
///<reference path="solid.ts"/>
///<reference path="texture.ts"/>

const redTextureFactory = createSolidTextureColorFactory([255, 0, 0, 255]);
const blueTextureFactory = createSolidTextureColorFactory([128, 128, 255, 255]);
const checkeredTextureFactory = createCheckeredTextureFactory([128, 128, 180, 255], [255, 255, 255, 255], 4);
const gradientTextureFactory = createLinearGradientTextureFactory(
    [255, 0, 0, 255],
    [0, 0, -.5],
    [0, 255, 0, 255],
    [0, 0, .5],
)

const shapedTextureNormalFactory = createShapedTextureNormalFactory([{
  shape: shapeFromPlanes(planesCube(1, 1, 1)),
  //transform: matrix4Translate(0, 0, 0),
  type: SHAPED_RULE_TYPE_ADDITION,
}, {
  shape: shapeFromPlanes(planesCube(1, 1, 1)),
  transform: matrix4Translate(.5, .5, .5),
  type: SHAPED_RULE_TYPE_SUBTRACTION,
}]);

const texture3D = createTextures(
    [[[[gradientTextureFactory, shapedTextureNormalFactory]]]],
    [1, 1, 1],
    TEXTURE_SIZE,
);
//const texture3D = createTextures([[[[checkeredTextureFactory, solidTextureNormalFactory]]]], [1, 1, 1], TEXTURE_SIZE);