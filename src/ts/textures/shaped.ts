const SHAPED_RULE_TYPE_ADDITION = 0;
const SHAPED_RULE_TYPE_SUBTRACTION = 1;

type ShapedRuleType =
    | typeof SHAPED_RULE_TYPE_ADDITION
    | typeof SHAPED_RULE_TYPE_SUBTRACTION;

type ShapedRule = {
  shape: Shape,
  transform?: Matrix4,
  type: ShapedRuleType,
};

const createShapedTextureNormalFactory = (
  rules: ShapedRule[],  
): TextureFactory => {
  const transformedRules = rules.map(rule => {
    const transformsAndNormals = rule.shape.map(face => {
      const normal = vector3TransformMatrix4(rule.transform, ...face.plane.normal);
      const original = vector3TransformMatrix4(rule.transform, 0, 0, 0);
      // almost certianly wrong
      const transform = matrix4Multiply(face.transformToCoordinateSpace, rule.transform && matrix4Invert(rule.transform));
      return [
        transform,
        vectorNNormalize(vectorNSubtract(normal, original)),
      ] as const;
    });
    return [
      transformsAndNormals,
      rule.type,
    ] as const;
  });
  return (z: number, y: number, x: number): Vector4 => {
    // return the distance and the normal, otherwise
    // 0 = not set
    // 1 = excluded
    const result = transformedRules.reduce<[number, Vector3] | 0>((acc, [transformsAndNormals, ruleType]) => {
      const result = transformsAndNormals.reduce<[number, Vector3] | 0 | 1>((acc, [transform, normal]) => {
        const d = vector3TransformMatrix4(transform, x, y, z)[2];
        if (ruleType == SHAPED_RULE_TYPE_ADDITION && acc != 1) {
          if (d > 0) {
            acc = 1;
          } else if (!acc || acc[0] > -d){
            acc = [-d, normal];
          }
        }
        if (ruleType == SHAPED_RULE_TYPE_SUBTRACTION
            && d > 0
            && (!acc || acc[0] > d)
        ) {
          acc = [d, normal];
        }
        return acc;
      }, 0);
      //acc && !result && console.log('removing', x, y, z);
      return result == 1
          ? acc
          : result
              ? acc
                  ? result[0] < acc[0]
                      ? result
                      : acc
                  : result
              : ruleType == SHAPED_RULE_TYPE_SUBTRACTION
                  ? 0
                  : acc;
    }, 0);
    
    return result
        ? [...(result[1]).map(v => (1 - v) * 127.5 | 0) as Vector3, 255]
        : [0, 0, 0, 0];
  };
};