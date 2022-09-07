const SPEAR_LENGTH = .4;
const SPEAR_RADIUS = .015;

const SPEAR_PART_ID_BODY = 0;

type SpearPartId = 
    | typeof SPEAR_PART_ID_BODY
    ;

const SPEAR_PART: EntityBody<SpearPartId> = {
  id: SPEAR_PART_ID_BODY,
  modelId: MODEL_SPEAR,
  textureId: TEXTURE_ID_WOOD,
};

const SPEAR_COS = Math.cos(CONST_PI_ON_2_5_1DP);
const SPEAR_SIN = Math.sin(CONST_PI_ON_2_5_1DP);
const SHAPE_SPEAR_BODY = shapeFromPlanes([
  ...planesCapsule(3, SPEAR_LENGTH, SPEAR_RADIUS),
  ...new Array(4).fill(0).map((_, i) => {
    const a = i/4 * CONST_2_PI_0DP;
    return planeFromPointAndNormal([SPEAR_LENGTH/2, 0, 0], [SPEAR_COS, SPEAR_SIN * Math.cos(a), SPEAR_SIN * Math.sin(a)]);
  })
]);


