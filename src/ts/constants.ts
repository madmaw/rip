///<reference path="math/matrix.ts"/>
///<reference path="flags.ts"/>
///<reference path="util/unpack.ts"/>

const EPSILON = .00001;
const GRAVITY = .000012;
const SKELETON_WALK_SPEED = .001;
const RAIL_ALIGNMENT_VELOCITY = SKELETON_WALK_SPEED * 2;
const ONE_MINUS_EPSILON = 1 - EPSILON;
const MAX_VELOCITY = .01;
const MAX_COLLISIONS = 5;
const MAX_MILLISECONDS_PER_FRAME = 40;
const MAX_JUMP_DELAY = 199;
const MAX_LIGHTS = 4;
const MAX_LIGHT_THROW = 6;
const MAX_LIGHT_THROW_C = `${MAX_LIGHT_THROW}.`;
const MIN_LIGHT_THROW_C = '2.';
const LIGHT_Z_FUTZ = .1;
const VERTICAL_INTERSECTION_IGNORE = .01;
const PICK_UP_ITEM_RADIUS = .4; // this, plus the skeleton bounds, plus the item bounds should cover every scenario

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
const CUBE_MAP_ROTATION_TRANSFORMS: Matrix4[] = safeUnpackVector3Rotations(
    !FLAG_UNPACK_USE_ORIGINALS && [...'.h8HhXHXhh8hhhHHhhH'],
    FLAG_UNPACK_SUPPLY_ORIGINALS && [
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
    ] as Vector3[]
).map(v => matrix4RotateInOrder(...v));
const CUBE_MAP_DIMENSION = 256;
const CUBE_MAP_LIGHT_TEXTURE_FAKE_INDICES: number[] = new Array(MAX_LIGHTS).fill(MAX_LIGHTS);
const CUBE_MAP_LIGHTS_FAKE: number[] = new Array(MAX_LIGHTS * 4).fill(0);
const CUBE_MAP_LIGHTS_TEXTURE_INDICES: number[] = CUBE_MAP_LIGHT_TEXTURE_FAKE_INDICES.map((_, i) => i);
const TEXTURE_COLOR_INDEX = MAX_LIGHTS + 2;
const TEXTURE_NORMAL_INDEX = TEXTURE_COLOR_INDEX + 1;
const DEFAULT_TEXTURE_SIZE = 32; // probably the best balance between quality and speed
const TEXTURE_SIZE = FLAG_HASH_TEXTURE_QUALITY
    ? parseInt(window.location.hash.substring(1)) || DEFAULT_TEXTURE_SIZE
    : DEFAULT_TEXTURE_SIZE;
//const TEXTURE_EXTENT = .5 - .1/TEXTURE_SIZE;
const TEXTURE_EXTENT = .499;

const TEXTURE_LOOP_STEPS = 30;
const TEXTURE_LOOP_STEP_SIZE = `.05`;
const TEXTURE_ALPHA_THRESHOLD = `.5`;

const TARGET_HORIZONTAL_RESOLUTION = FLAG_NATIVE_RESOLUTION ? 0 : 480;
const TARGET_VERTICAL_RESOLUTION = FLAG_NATIVE_RESOLUTION ? 0 : 360;

const MAX_ATTACK_RADIUS = 1;
const DAMAGE_INVULNERABILITY_DURATION = 300;
const AI_RECALCULATION_TIME = 1e3;
const AI_LOOK_RADIUS = 1;
const AI_DIRECT_MOVE_RADIUS = .7;
const LEVEL_DIMENSION = 9;
const LEVEL_LAYER_CHUNK_SIZE = 4;
const RENDER_DIMENSIONS: Vector3 = [MAX_LIGHT_THROW*1.5, MAX_LIGHT_THROW*1.5, 3];
const HEALTH_FLASH = 5;
const WEBGL_PRECISION: 'lowp' | 'mediump' | 'highp' = ENVIRONMENT == 'ultra' ? 'lowp' : 'highp';

