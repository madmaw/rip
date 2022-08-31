type Anim = (now: number) => Booleanish;

type Easing = (p: number) => number;

const EASE_LINEAR: Easing = p => p;
const EASE_IN_QUAD: Easing = p => p * p;
const EASE_OUT_QUAD: Easing = p => p*(2-p);
const EASE_IN_OUT_QUAD: Easing = p => p<.5 ? 2*p*p : -1+(4-2*p)*p;

const animDeltaRotation = (from: Vector3, to: Vector3) => {
  const fromNormal = vector3TransformMatrix4(matrix4RotateInOrder(...from), 1, 0, 0);
  const toNormal = vector3TransformMatrix4(matrix4RotateInOrder(...to), 1, 0, 0);
  const cosDiffNormal = vectorNDotProduct(fromNormal, toNormal);
  return Math.acos(cosDiffNormal);
}

const animLerp = (start: number, into: Vector3, to: Vector3, duration: number, easing: Easing, wrapAngles?: Booleanish) => {
  const from = [...into];
  return (now: number): 0 | 1 => {
    const delta = now - start;
    const proportion = duration ? Math.min(delta / duration, 1) : 1;
    const progress = easing(proportion);
    arrayMapAndSet(into, (_, i) => {
      const diff = wrapAngles ? mathAngleDiff(from[i], to[i]) : to[i] - from[i];
      const result = from[i] + diff * progress;
      return result;
    });
    return (proportion | 0) as any; // round down gives zero, until it's >= 1
  }
};

const animComposite = (...anims: ((start: number) => Anim)[]): Anim => {
  let currentAnim: Anim | Falsey = 0;
  return (now: number): Booleanish => {
    if (!currentAnim) {
      currentAnim = anims.shift()(now);
    }
    if (currentAnim(now)) {
      currentAnim = 0;
      return !anims.length;
    }
  }
};