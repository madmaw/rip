///<reference path="math/matrix.ts"/>

const EPSILON = .00001;
const GRAVITY = .00001;
const RAIL_ALIGNMENT_VELOCITY = .01;
const ONE_MINUS_EPSILON = 1 - EPSILON;
const MAX_VELOCITY = .01;
const MAX_COLLISIONS = 5;
const MAX_MILLISECONDS_PER_FRAME = 40;
const MAX_JUMP_DELAY = 199;
const MAX_LIGHTS = 4;
const MAX_LIGHT_THROW = 9;
const MAX_LIGHT_THROW_C = `${MAX_LIGHT_THROW}.`;
const MIN_LIGHT_THROW_C = '2.';
const LIGHT_Z_FUTZ = .1;

const VECTOR3_UP: [number, number, number] = [0, 0, 1];
const VECTOR3_EAST: [number, number, number] = [1, 0, 0];

// 1 = tan(90 degrees/2)
//const CUBE_MAP_PERPSECTIVE_TRANSFORM = matrix4InfinitePerspective(1, 1, .09);
const CUBE_MAP_PERPSECTIVE_Z_NEAR = .01;
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
const CUBE_MAP_LIGHT_TEXTURE_FAKE_INDICES: number[] = new Array(MAX_LIGHTS).fill(MAX_LIGHTS);
const CUBE_MAP_LIGHTS_FAKE: number[] = new Array(MAX_LIGHTS * 4).fill(0);
const CUBE_MAP_LIGHTS_TEXTURE_INDICES: number[] = CUBE_MAP_LIGHT_TEXTURE_FAKE_INDICES.map((_, i) => i);
const TEXTURE_COLOR_INDEX = MAX_LIGHTS + 2;
const TEXTURE_NORMAL_INDEX = TEXTURE_COLOR_INDEX + 1;
const TEXTURE_SIZE = 18;
const TEXTURE_SIZE_PLUS_2 = TEXTURE_SIZE + 2;

const TEXTURE_LOOP_STEPS = 30;
const TEXTURE_LOOP_STEP_SIZE = `.05`;
const TEXTURE_ALPHA_THRESHOLD = `.5`;

const TARGET_HORIZONTAL_RESOLUTION = 640;
const TARGET_VERTICAL_RESOLUTION = 480;
const TARGET_ASPECT_RATIO = TARGET_HORIZONTAL_RESOLUTION / TARGET_VERTICAL_RESOLUTION;
