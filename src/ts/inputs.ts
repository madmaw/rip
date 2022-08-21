const KEY_SHIFT = 16;
const KEY_CAPS_LOCK = 20;
const KEY_SPACE = 32;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_A = 65;
const KEY_D = 68;
const KEY_E = 69;
const KEY_Q = 81;
const KEY_S = 83;
const KEY_W = 87;
const KEY_X = 88;
const KEY_Z = 90;

type KeyCode =
    | typeof KEY_SHIFT
    | typeof KEY_CAPS_LOCK
    | typeof KEY_SPACE
    | typeof KEY_LEFT
    | typeof KEY_UP
    | typeof KEY_RIGHT
    | typeof KEY_DOWN
    | typeof KEY_A
    | typeof KEY_D
    | typeof KEY_E
    | typeof KEY_Q
    | typeof KEY_S
    | typeof KEY_W
    | typeof KEY_X
    | typeof KEY_Z
    ;

const INPUT_LEFT = 0;
const INPUT_RIGHT = 1;
const INPUT_UP = 2;
const INPUT_DOWN = 3;
const INPUT_RUN = 4;
const INPUT_ROTATE_CAMERA_LEFT = 5;
const INPUT_ROTATE_CAMERA_RIGHT = 6;
const INPUT_INTERACT = 7;
const INPUT_ATTACK_LIGHT = 8;
const INPUT_ATTACK_HEAVY = 9;

type Input = 
    | typeof INPUT_LEFT
    | typeof INPUT_RIGHT
    | typeof INPUT_UP
    | typeof INPUT_DOWN
    | typeof INPUT_RUN
    | typeof INPUT_ROTATE_CAMERA_LEFT
    | typeof INPUT_ROTATE_CAMERA_RIGHT
    | typeof INPUT_INTERACT
    | typeof INPUT_ATTACK_LIGHT
    | typeof INPUT_ATTACK_HEAVY
    ;

type KeyState = [
  // intensity
  number,
  // world time set
  number,
  // world time read,
  number,
];

const inputKeyStates: Partial<Record<KeyCode, KeyState>> = {};

const inputRead = (input: Input, readTimestamp?: number, ignoreTimestamp?: Booleanish): number => {
  const keys = INPUT_KEYS[input];
  return keys.reduce((intensity, keyCode) => {
    const keyState = inputKeyStates[keyCode];
    if (keyState) {
      const [keyIntensity, keyWorldTimeSet, keyWorldTimeRead] = keyState;
      if (keyIntensity > 0 && (readTimestamp && keyWorldTimeRead < keyWorldTimeSet || ignoreTimestamp || !readTimestamp)) {
        keyState[2] = readTimestamp || 0;
        return Math.max(intensity, keyIntensity);
      }
    }
    return intensity;
  }, 0);
};

const keySet = (keyCode: KeyCode, now: number, intensity: number) => {
  const keyState = inputKeyStates[keyCode] || (inputKeyStates[keyCode] = [0, 0, 0]);
  if (keyState[0] != (keyState[0] = intensity)) {
    keyState[1] = now;
  }
};


const INPUT_KEYS: Record<Input, KeyCode[]> & KeyCode[][] = [
  // LEFT
  [KEY_LEFT], 
  // RIGHT
  [KEY_RIGHT],
  // UP
  [KEY_UP],
  // DOWN
  [KEY_DOWN],
  // RUN
  [KEY_SHIFT, KEY_CAPS_LOCK, KEY_D],
  // ROTATE_CAMERA_LEFT
  [KEY_Q],
  // ROTATE_CAMERA_RIGHT
  [KEY_E],
  // INTERACT
  [KEY_D],
  // ATTACK LIGHT
  [KEY_A],
  // ATTACK HEAVY
  [KEY_S],
]
