const createCheckeredTextureFactory = (v1: Vector4, v2: Vector4, scale: number): TextureFactory => (z, y, x) => {
  return [x, y, z].reduce((acc, v) => acc + Math.round(v * scale), 0) % 2
      ? v1
      : v2;
}
