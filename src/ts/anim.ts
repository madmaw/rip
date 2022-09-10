type Anim = (now: number) => Booleanish;

type Easing = (p: number) => number;

const EASE_LINEAR = 0;
const EASE_IN_QUAD = 1;
const EASE_OUT_QUAD = 2;
const EASE_IN_OUT_QUAD = 3;

type EasingId = 
    | typeof EASE_LINEAR
    | typeof EASE_IN_QUAD
    | typeof EASE_OUT_QUAD
    | typeof EASE_IN_OUT_QUAD
    ;

const EASINGS: Easing[] = [
  p => p,
  p => p * p,
  p => p*(2-p),
  p => p<.5 ? 2*p*p : -1+(4-2*p)*p
];

const animDeltaRotation = (from: Vector3, to: Vector3) => {
  const fromNormal = vector3TransformMatrix4(matrix4RotateInOrder(...from), 1, 0, 0);
  const toNormal = vector3TransformMatrix4(matrix4RotateInOrder(...to), 1, 0, 0);
  const cosDiffNormal = vectorNDotProduct(fromNormal, toNormal);
  return Math.acos(cosDiffNormal);
}

const animLerp = <T, F extends keyof T>(
    start: number,
    on: T,
    field: F,
    to: Vector3,
    duration: number,
    easing: Easing,
    wrapAngles?: Booleanish,
    onComplete?: (() => void) | Falsey,
    ///logPrefix?: string,
) => {
  // TODO is there a way to specify that the field has to be a Vector3?
  const from: Vector3 = on[field] as any;
  return (now: number): Booleanish => {
    const delta = now - start;
    const proportion = duration ? Math.min(delta / duration, 1) : 1;
    const progress = easing(proportion);
    on[field] = from.map((v, i) => {
      const diff = wrapAngles ? mathAngleDiff(v, to[i]) : to[i] - v;
      const result = from[i] + diff * progress;
      return result;
    }) as any;
    if (proportion | 0) {
      onComplete && onComplete();
      return 1;
    }
  }
};

const animComposite = (...anims: ((start: number) => Anim)[]): Anim => {
  let currentAnim: Anim | Falsey = 0;
  if (FLAG_CHECK_FOR_EMPTY_ANIMATIONS && !anims.length) {
    throw new Error();
  }
  return (now: number): Booleanish => {
    if (!currentAnim) {
      // TODO how can anims be empty here?
      currentAnim = anims.shift()?.(now);
    }
    if (!currentAnim || currentAnim(now)) {
      currentAnim = 0;
      return !anims.length;
    }
  }
};