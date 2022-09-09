///<reference path="../util/hax.ts"/>

type BricksDescriptor = number[][][];

const BRICK_AXISES: Vector3[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const BRICK_ANGLES = [0, CONST_PI_ON_2_1DP, CONST_PI_1DP, -CONST_PI_ON_2_1DP];
const BRICK_OFFSET_POINTS: Vector3[] = [[1, 0, 0], [0, 1, 0]];

const createBrickTextureNormalFactory = (descriptor: BricksDescriptor, dimension: number): TextureFactory => {
  const blockDimension = 1/dimension;

  const rules = array3New(dimension, dimension, dimension, (...pos) => {
    const center = pos.map(v => (v + .5) * blockDimension - .5) as Vector3;
    const [x, y, z] = pos;
    const brickId = descriptor[x][y][z];
    const planes = planesCube(blockDimension, blockDimension, blockDimension);
    BRICK_AXISES.forEach(axis => {
    const cosAngle = vectorNDotProduct(VECTOR3_UP, axis);
      const angle = Math.acos(cosAngle);
      const rotationAxis = cosAngle < 1 - EPSILON
          ? vectorNNormalize(vector3CrossProduct(VECTOR3_UP, axis))
          : VECTOR3_EAST;
      const offsetPointTransform = matrix4Rotate(angle, ...rotationAxis);
      const offsetPoints = BRICK_OFFSET_POINTS.map(p => vector3TransformMatrix4(offsetPointTransform, ...p));

      BRICK_ANGLES.forEach(angle => {
        const transform = matrix4Rotate(angle, ...axis);
        const sameAdjacent = offsetPoints.some(offsetPoint => {
          const offset = vector3TransformMatrix4(transform, ...offsetPoint).map(Math.round);
          if (!offset.some((v, i) => v + pos[i] < 0 || v + pos[i] >= dimension)) {
            const [ox, oy, oz] = offset;
            const result = descriptor[x + ox][y + oy][z + oz] == brickId;
            //console.log(pos, offset, axis, angle, offsetPoint, result);
            return result;
          }
        });
        //console.log(pos, axis, angle, sameAdjacent);
        if (!sameAdjacent) {
          // add in the plane
          const offset = vector3TransformMatrix4(matrix4Multiply(transform, offsetPointTransform), 1, 1, 0);
          //planes.push(planeFromPointAndNormal([0, 0, 0], vectorNNormalize(offset), blockDimension * 1.3/2)); 
          planes.push({
            d: blockDimension * (1.4 - dimension*2/TEXTURE_SIZE)/2,
            normal: vectorNNormalize(offset),
          });
        }
      });
    });


    const rule: ShapedRule = {
      shaped: shapeFromPlanes(planes),
      transforms: matrix4Translate(...center),
      // type: SHAPED_RULE_TYPE_ADDITION,
    };
    return rule;
  }).flat(3);

  return createShapedTextureNormalFactory(rules);
};
