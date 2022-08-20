const EPSILON = .00001;
const ONE_MINUS_EPSILON = 1 - EPSILON;
const MAX_VELOCITY = .01;
const MAX_COLLISIONS = 5;
const MAX_MILLISECONDS_PER_FRAME = 40;
const MAX_JUMP_DELAY = 199;

const VECTOR3_UP: [number, number, number] = [0, 0, 1];
const VECTOR3_EAST: [number, number, number] = [1, 0, 0];