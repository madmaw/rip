///<reference path="../util/arrays.ts"/>

type Texel = [
  // color and alpha
  Vector4,
  // normal and (self) illumination
  Vector4?,
];

type Texture3D = Texel[][][];

// NOTE: Z Y X order!!!
type TextureFactory = (z: number, y: number, x: number) => Vector4;

const createTextures = (
    textureFactories: [TextureFactory, TextureFactory][][][],
    blocks: Vector3,
    textureDimension: number,
): Texture3D => {
  return array3New(...blocks.map(v => v * textureDimension) as Vector3, (...p) => {
    const [blockX, blockY, blockZ] = p.map(v => v / textureDimension | 0) as Vector3;
    const internalPoint = p.map(v => (v % textureDimension + .5)/textureDimension - .5) as Vector3;
    return textureFactories[blockX][blockY][blockZ].map<Vector4>(f => f(...internalPoint)) as Texel;
  });
}