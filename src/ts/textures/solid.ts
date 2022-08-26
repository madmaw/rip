const createSolidTextureColorFactory = (color: Vector4): TextureFactory => () => color;

const solidTextureNormalFactory = (): Vector4 => [0, 0, 0, 255];