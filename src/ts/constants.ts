///<reference path="math/matrix.ts"/>

const EPSILON = .00001;
const GRAVITY = .00001;
const ONE_MINUS_EPSILON = 1 - EPSILON;
const MAX_VELOCITY = .01;
const MAX_COLLISIONS = 5;
const MAX_MILLISECONDS_PER_FRAME = 40;
const MAX_JUMP_DELAY = 199;
const MAX_LIGHTS = 9;
const MAX_LIGHT_THROW = '9.';
const MIN_LIGHT_THROW = '2.';

const VECTOR3_UP: [number, number, number] = [0, 0, 1];
const VECTOR3_EAST: [number, number, number] = [1, 0, 0];

// 1 = tan(90 degrees/2)
//const CUBE_MAP_PERPSECTIVE_TRANSFORM = matrix4InfinitePerspective(1, 1, .09);
const CUBE_MAP_PERPSECTIVE_Z_NEAR = .09;
const CUBE_MAP_PERPSECTIVE_Z_FAR = 9;
const CUBE_MAP_PERPSECTIVE_TRANSFORM = matrix4Perspective(
    1,
    1,
    CUBE_MAP_PERPSECTIVE_Z_NEAR,
    CUBE_MAP_PERPSECTIVE_Z_FAR,
);
const CUBE_MAP_ROTATION_TRANSFORMS: Matrix4[] = ([
  // +ve X
  [Math.PI, -Math.PI/2, 0],
  // -ve X
  [Math.PI, Math.PI/2, 0],
  // +ve Y
  [Math.PI/2, Math.PI, Math.PI],
  // -ve Y
  [-Math.PI/2, Math.PI, Math.PI],
  // +ve Z
  [Math.PI, 0, 0],
  // -ve Z
  [Math.PI, Math.PI, 0],
] as Vector3[]).map(v => matrix4RotateInOrder(...v));
const CUBE_MAP_DIMENSION = 256;