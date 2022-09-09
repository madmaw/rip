///<reference path="../util/arrays.ts"/>

type Texel = [
  // color and alpha with variants
  Vector4,
  // normal and (self) illumination
  Vector4?,
];

type Texture3D = Texel[][][];

// NOTE: Z Y X order!!!
type TextureFactory = (z: number, y: number, x: number) => Vector4;
