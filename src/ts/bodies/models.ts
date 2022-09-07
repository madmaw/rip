const MODEL_WALL = 0;
const MODEL_STEP_1 = 1;
const MODEL_STEP_2 = 2;
const MODEL_STEP_3 = 3;
const MODEL_STEP_4 = 4;
const MODEL_STEP_5 = 5;
const MODEL_SKELETON_TORSO = 6;
const MODEL_SKELETON_HEAD = 7;
const MODEL_SKELETON_HIPS = 8;
const MODEL_SKELETON_HUMERUS = 9;
const MODEL_SKELETON_FOREARM = 10;
const MODEL_SKELETON_FEMUR = 11;
const MODEL_SKELETON_SHIN = 12;
const MODEL_SKELETON_HAND = 13;
const MODEL_SKELETON_FOOT = 14;
const MODEL_CLUB_1 = 15;
const MODEL_CLUB_2 = 16;
const MODEL_CLUB_3 = 17;
const MODEL_CLUB_4 = 18;
const MODEL_CLUB_5 = 19;
const MODEL_TORCH_HANDLE = 20;
const MODEL_TORCH_HEAD = 21;
const MODEL_SPEAR = 22;

type ModelId =
    | typeof MODEL_WALL
    | typeof MODEL_STEP_1
    | typeof MODEL_STEP_2
    | typeof MODEL_STEP_3
    | typeof MODEL_STEP_4
    | typeof MODEL_STEP_5
    | typeof MODEL_SKELETON_TORSO
    | typeof MODEL_SKELETON_HEAD
    | typeof MODEL_SKELETON_HIPS
    | typeof MODEL_SKELETON_HUMERUS
    | typeof MODEL_SKELETON_FOREARM
    | typeof MODEL_SKELETON_FEMUR
    | typeof MODEL_SKELETON_SHIN
    | typeof MODEL_SKELETON_HAND
    | typeof MODEL_SKELETON_FOOT
    | typeof MODEL_CLUB_1
    | typeof MODEL_CLUB_2
    | typeof MODEL_CLUB_3
    | typeof MODEL_CLUB_4
    | typeof MODEL_CLUB_5
    | typeof MODEL_TORCH_HANDLE
    | typeof MODEL_TORCH_HEAD
    | typeof MODEL_SPEAR
    ;