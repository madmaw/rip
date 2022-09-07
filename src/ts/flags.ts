const ENVIRONMENT: 'test' | 'small' | 'ultra' = 'test' as any;

const FLAG_SHOW_GL_ERRORS = ENVIRONMENT == 'test';
const FLAG_LONG_GL_VARIABLE_NAMES = ENVIRONMENT == 'test' && false;
const FLAG_SHOW_FPS = ENVIRONMENT == 'test';
const FLAG_THROTTLE_LIGHT_RENDERING = false;
const FLAG_TEXTURE_CLAMP_TO_EDGE = true;
// prevents banding on bump maps
const FLAG_TEXTURE_SCALE_NEAREST = true;
const FLAG_GAMEPAD_SUPPORT = ENVIRONMENT != 'ultra';
const FLAG_ALLOW_ZOOM = ENVIRONMENT == 'test';
const FLAG_INSTANCED_RENDERING = ENVIRONMENT != 'ultra';
const FLAG_DEBUG_COLLISIONS = false;
const FLAG_EXCLUDE_UNLIT_FROM_RENDER = ENVIRONMENT != 'ultra';
const FLAG_SMOOTH_NORMALS = true;
const FLAG_FAST_COLLISIONS = true;
const FLAG_PRINT_LEVEL = ENVIRONMENT == 'test' && false;
const FLAG_DEBUG_SHORTENED_METHODS = ENVIRONMENT == 'test' && false;
const FLAG_SHORTEN_METHODS = true;
const FLAG_PRINT_GL_CONSTANTS = ENVIRONMENT == 'test' && false;
const FLAG_UNPACK_CHECK_ORIGINALS = ENVIRONMENT == 'test';
