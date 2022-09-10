const KEY_SHIFT = 16;
const KEY_CAPS_LOCK = 20;
const KEY_SPACE = 32;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_A = 65;
const KEY_C = 67;
const KEY_D = 68;
const KEY_E = 69;
const KEY_F = 70;
const KEY_G = 71;
const KEY_I = 73;
const KEY_J = 74;
const KEY_K = 75;
const KEY_M = 77;
const KEY_Q = 81;
const KEY_S = 83;
const KEY_W = 87;
const KEY_X = 88;
const KEY_Z = 90;
const KEY_LESS_THAN = 188;
const KEY_GREATER_THAN = 190;

type KeyCode =
    | typeof KEY_SHIFT
    | typeof KEY_CAPS_LOCK
    | typeof KEY_SPACE
    | typeof KEY_LEFT
    | typeof KEY_UP
    | typeof KEY_RIGHT
    | typeof KEY_DOWN
    | typeof KEY_A
    | typeof KEY_C
    | typeof KEY_D
    | typeof KEY_E
    | typeof KEY_F
    | typeof KEY_G
    | typeof KEY_J
    | typeof KEY_K
    | typeof KEY_M
    | typeof KEY_I
    | typeof KEY_Q
    | typeof KEY_S
    | typeof KEY_W
    | typeof KEY_X
    | typeof KEY_Z
    | typeof KEY_LESS_THAN
    | typeof KEY_GREATER_THAN
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

// CC should remove if unused
const GAMEPAD_INPUT_BUTTON_INDICES: Partial<Record<Input, number>> = {
  [INPUT_LEFT]: 14,
  [INPUT_RIGHT]: 15,
  [INPUT_UP]: 12,
  [INPUT_DOWN]: 13,
  [INPUT_RUN]: 0,
  [INPUT_INTERACT]: 1,
  [INPUT_ROTATE_CAMERA_LEFT]: 4,
  [INPUT_ROTATE_CAMERA_RIGHT]: 5,
};

const inputKeyStates: Partial<Record<KeyCode, KeyState>> = {};

// if readtimestamp is supplied, we only read the value once
const inputRead = (input: Input, readTimestamp?: number, ignoreTimestamp?: Booleanish): number => {
  const keys = INPUT_KEYS[input];
  if (FLAG_MULTIKEY_SUPPORT) {
    return (keys as KeyCode[]).reduce((intensity, keyCode) => {
      const keyState = inputKeyStates[keyCode];
      if (keyState) {
        const [keyIntensity, keyWorldTimeSet, keyWorldTimeRead] = keyState;
        if (
            readTimestamp && keyWorldTimeRead < keyWorldTimeSet 
            || keyIntensity && (readTimestamp && ignoreTimestamp || !readTimestamp)
        ) {
          keyState[2] = readTimestamp || 0;
          return Math.max(intensity, keyIntensity || 1);
        }
      }
      return intensity;
    }, 0);  
  } else {
    const keyCode = keys as KeyCode;
    const keyState = inputKeyStates[keyCode];
    if (keyState) {
      const [keyIntensity, keyWorldTimeSet, keyWorldTimeRead] = keyState;
      if (
          readTimestamp && keyWorldTimeRead < keyWorldTimeSet 
          || keyIntensity && (readTimestamp && ignoreTimestamp || !readTimestamp)
      ) {
        keyState[2] = readTimestamp || 0;
        return keyIntensity;
      }
    }
    return 0;
  }
};

const keySet = (keyCode: KeyCode, now: number, intensity: number) => {
  const keyState = inputKeyStates[keyCode] || (inputKeyStates[keyCode] = [0, 0, 0]);
  if (keyState[0] != (keyState[0] = intensity) && intensity) {
    keyState[1] = now;
  }
};

const INPUT_KEYS: Record<Input, KeyCode[] | KeyCode> & (KeyCode[] | KeyCode)[] = [
  // LEFT
  FLAG_MULTIKEY_SUPPORT ? [KEY_LEFT, KEY_E] : KEY_LEFT, 
  // RIGHT
  FLAG_MULTIKEY_SUPPORT ? [KEY_RIGHT, KEY_F] : KEY_RIGHT,
  // UP
  FLAG_MULTIKEY_SUPPORT ? [KEY_UP, KEY_SPACE, KEY_C] : KEY_UP,
  // DOWN
  FLAG_MULTIKEY_SUPPORT ? [KEY_DOWN] : KEY_DOWN,
  // RUN
  FLAG_MULTIKEY_SUPPORT ? [KEY_SHIFT, KEY_CAPS_LOCK, KEY_G] : KEY_SHIFT,
  // ROTATE_CAMERA_LEFT
  FLAG_MULTIKEY_SUPPORT ? [KEY_Z, KEY_K] : KEY_Z,
  // ROTATE_CAMERA_RIGHT
  FLAG_MULTIKEY_SUPPORT ? [KEY_X, KEY_M] : KEY_X,
  // INTERACT
  FLAG_MULTIKEY_SUPPORT ? [KEY_G, KEY_D] : KEY_D,
  // ATTACK LIGHT
  FLAG_MULTIKEY_SUPPORT ? [KEY_J, KEY_A] : KEY_A,
  // ATTACK HEAVY
  FLAG_MULTIKEY_SUPPORT ? [KEY_I, KEY_S]: KEY_S,
]
