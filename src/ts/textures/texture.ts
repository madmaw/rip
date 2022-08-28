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

// NOTE: Z Y X order!!!
// TODO do this inline
const createTextures = (
    textureFactories: [TextureFactory, TextureFactory][],
    textureDimension: number,
): Texture3D => {
  const textureDimensionPlus1 = textureDimension + 1;
  return array3New(
      textureDimension,
      textureDimension,
      textureFactories.length * textureDimensionPlus1,
      (...p) => {
        const i = p[2] / textureDimensionPlus1 | 0;
        const internalPoint = p.map(v => (Math.min(v % textureDimensionPlus1, textureDimension - 1) + .5)/textureDimension - .5) as Vector3;
        return textureFactories[i].map<Vector4>(f => f(...internalPoint)) as Texel;
      },
  );
}