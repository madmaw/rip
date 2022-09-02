const createSpeckleTextureFactory = (proxied: TextureFactory, d: number, linkVariation?: Booleanish): TextureFactory => {
  return (x, y, z) => {
    let variation: number | undefined;
    return proxied(x, y, z).map(
        (v, i) => i < 3
            ? Math.max(
                0,
                Math.min(
                    255,
                    v + v * (variation = (i && linkVariation ? variation : Math.random() * d - d/2)) | 0,
                ),
            )
            : v
    ) as Vector4;
  }
}