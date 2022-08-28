const createLinearGradientTextureFactory = (v1: Vector4, p1: Vector3, v2: Vector4, p2: Vector3): TextureFactory => {
  const delta = vectorNSubtract(p2, p1);
  const distance = vectorNLength(delta);
  const normal = vectorNNormalize(delta);
  return (z: number, y: number, x: number) => {
    const posDelta = vectorNSubtract([x, y, z], p1);
    const posNormal = vectorNNormalize(posDelta);
    const posDistance = vectorNLength(posDelta);
    const cosAngle = vectorNDotProduct(normal, posNormal);
    return vectorNSubtract(
        v1,
        vectorNScale(vectorNSubtract(v1, v2), (posDistance * cosAngle)/distance),
    );
  };
}

const createRadialGradientTextureFactory = (v1: Vector4, p: Vector3, v2: Vector4, r: number) => {
  return (z: number, y: number, x: number) => {
    const centerDelta = vectorNSubtract([x, y, z], p);
    const length = vectorNLength(centerDelta);
    return vectorNSubtract(
        v1,
        vectorNScale(vectorNSubtract(v1, v2), Math.min(length/r, 1))
    );
  };
}
