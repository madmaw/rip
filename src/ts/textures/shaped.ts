const SHAPED_RULE_TYPE_ADDITION = 0;
const SHAPED_RULE_TYPE_SUBTRACTION = 1;

const SHAPED_AGGREGATE_LIMIT = 1/TEXTURE_SIZE;

type ShapedRuleType =
    | typeof SHAPED_RULE_TYPE_ADDITION
    | typeof SHAPED_RULE_TYPE_SUBTRACTION;

type ShapedRule = {
  shaped: Shape,
  transforms?: Matrix4,
  ruleType?: ShapedRuleType,
};

const createShapedTextureNormalFactory = (
  rules: ShapedRule[],  
): TextureFactory => {
  const transformedRules = rules.map(rule => {
    const transformsAndNormals = rule.shaped.map((face, i) => {
      const normal = vector3TransformMatrix4(rule.transforms, ...face.plane.normal);
      const original = vector3TransformMatrix4(rule.transforms, 0, 0, 0);
      const transform = matrix4Multiply(
          face.transformToCoordinateSpace,
          rule.transforms && matrix4Invert(rule.transforms),
      );
      return [
        transform,
        vectorNNormalize(vectorNSubtract(normal, original)),
        face.perimeter.map(p => p.firstOutgoingIntersection),
      ] as const;
    });
    return [
      transformsAndNormals,
      rule.ruleType,
    ] as const;
  });
  return (z: number, y: number, x: number): Vector4 => {
    // return the distance and the normal, otherwise
    // 0 = not set
    // 1 = excluded
    const result = transformedRules.reduce<[number, Vector3[]] | 0>((acc, [transformsAndNormals, ruleType]) => {
      const result = transformsAndNormals.reduce<[number, Vector3[]] | 0 | 1>((acc, [transform, normal, perimeter]) => {
        const v = vector3TransformMatrix4(transform, x, y, z);
        const d = v[2];
        if (
            !ruleType //  == SHAPED_RULE_TYPE_ADDITION 
            && acc != 1
        ) {
          if (d > 0) {
            acc = 1;
          } else if (!acc || acc[0] > -d){
            acc = [-d, [normal]];
          }
        }
        if (ruleType // == SHAPED_RULE_TYPE_SUBTRACTION
            && d > 0
            && (!acc || acc[0] > d)
        ) {
          const d2 = vector2PolyContains(perimeter, v[0], v[1])
              ? d
              // find the actual closest point 
              : perimeter.reduce((acc, p, i) => {
                const next = perimeter[(i+1)%perimeter.length];
                const lineDelta = vectorNSubtract(next, p);
                const vDelta = vectorNSubtract(v.slice(0, 2) as Vector2, p);
                const rotatedVDelta = vector2Rotate(-Math.atan2(lineDelta[1], lineDelta[0]), vDelta);
                const d3 = rotatedVDelta[0] > 0 && rotatedVDelta[0] < vectorNLength(lineDelta)
                    ? rotatedVDelta[1]
                    : acc;
                return Math.min(acc, Math.abs(d3), vectorNLength(vDelta));
              }, 1);
          acc = [d2, [vectorNScale(normal, -1)]];
        }  
        return acc;
      }, 0);
      //acc && !result && console.log('removing', x, y, z);
      return result == 1
          ? acc
          : result
              ? acc
                  ? result[0] < acc[0] + SHAPED_AGGREGATE_LIMIT
                      ? Math.abs(acc[0] - result[0]) < SHAPED_AGGREGATE_LIMIT
                            ? [result[0], [...acc[1], ...result[1]]]
                            : result
                      : acc
                  : ruleType // == SHAPED_RULE_TYPE_SUBTRACTION
                      ? 0
                      : result
              : ruleType // == SHAPED_RULE_TYPE_SUBTRACTION
                  ? 0
                  : acc;
    }, 0);
    
    // average equal normals
    let r: Vector4 = [0, 0, 0, 0];
    if (result) {
      const normals = result[1];
      const averageNormal = vectorNNormalize(
          normals.reduce((acc, v) => vectorNAdd(vectorNScale(v, 1/normals.length), acc),
          [0, 0, 0],
      ));
      r = [...averageNormal.map(v => (v + 1) * 127.5 | 0) as Vector3, 255];
    }
    //console.log(x, y, z, r);

    return r;
  };
};