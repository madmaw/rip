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
  const textureDimensionPlus2 = textureDimension + 2;
  return array3New(
      textureDimension,
      textureDimension,
      textureFactories.length * textureDimensionPlus2,
      (z, y, x) => {
        const i = x / textureDimensionPlus2 | 0;
        const internalPoint: Vector3 = [
          (z + .5)/textureDimension - .5,
          (y + .5)/textureDimension - .5, 
          (Math.max(0, Math.min((x % textureDimensionPlus2) - 1, textureDimension - 1)) + .5)/textureDimension - .5
        ];
        return textureFactories[i].map<Vector4>(f => f(...internalPoint)) as Texel;
      },
  );
}