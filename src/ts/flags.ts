const ENVIRONMENT: 'test' | 'small' | 'ultra' = 'test' as any;

const FLAG_SHOW_GL_ERRORS = ENVIRONMENT == 'test';
const FLAG_LONG_GL_VARIABLE_NAMES = ENVIRONMENT == 'test' && false;
const FLAG_SHOW_FPS = ENVIRONMENT == 'test';
const FLAG_THROTTLE_LIGHT_RENDERING = false;
// doesn't seem to do anything
const FLAG_TEXTURE_CLAMP_TO_EDGE = false;
// prevents banding on bump maps
const FLAG_TEXTURE_SCALE_NEAREST = true;
const FLAG_MULTIKEY_SUPPORT = ENVIRONMENT != 'ultra' && false;
const FLAG_ALLOW_ZOOM = ENVIRONMENT == 'test';
const FLAG_DEBUG_COLLISIONS = false;
const FLAG_EXCLUDE_UNLIT_FROM_RENDER = ENVIRONMENT != 'ultra';
const FLAG_SMOOTH_NORMALS = true;
const FLAG_FAST_COLLISIONS = false;
const FLAG_PRINT_LEVEL = ENVIRONMENT == 'test';
const FLAG_DEBUG_SHORTENED_METHODS = ENVIRONMENT == 'test' && false;
const FLAG_SHORTEN_METHODS = true;
const FLAG_PRINT_GL_CONSTANTS = ENVIRONMENT == 'test' && false;
const FLAG_UNPACK_CHECK_ORIGINALS = ENVIRONMENT == 'test';
const FLAG_UNPACK_USE_ORIGINALS = false;
// NOTE the use of undefined here allows CC to remove the argument entirely in a && 
const FLAG_UNPACK_SUPPLY_ORIGINALS = FLAG_UNPACK_CHECK_ORIGINALS || FLAG_UNPACK_USE_ORIGINALS ? true : undefined;
const FLAG_HASH_TEXTURE_QUALITY = ENVIRONMENT == 'test';
const FLAG_DETECT_BROKEN_TRANSFORM = ENVIRONMENT == 'test';
const FLAG_AI_USE_HEAVY_ATTACKS = true;
const FLAG_DROP_ITEMS_FORWARD = ENVIRONMENT != 'ultra';
const FLAG_CLEAR_PREVIOUSLY_PICKED_UP_ARRAY = ENVIRONMENT != 'ultra';
const FLAG_CHECK_FOR_EMPTY_ANIMATIONS = ENVIRONMENT == 'test';
const FLAG_PREVENT_EVENT_DEFAULT = ENVIRONMENT != 'ultra';
const FLAG_NATIVE_RESOLUTION = ENVIRONMENT != 'test';
const FLAG_SPEARS_AS_LOOT = true;
const FLAG_DELETE_CLEAN_UP = ENVIRONMENT != 'ultra';
const FLAG_AGGRO_ON_HIT = true;
const FLAG_FADE_IN = true;
const FLAG_DWINDILING_TORCHES = false;
const FLAG_IDLE_TORCH_ALOFT = ENVIRONMENT != 'ultra';
const FLAG_FAST_LEVEL_GENERATION = true;
const FLAG_SCALE_WARM_UP_SPEED = true;
const FLAG_INSTANCED_RENDERING = ENVIRONMENT != 'ultra';
