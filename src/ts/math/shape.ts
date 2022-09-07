///<reference path="../constants.ts"/>
///<reference path="matrix.ts"/>
///<reference path="vector.ts"/>

type Plane = {
  normal: Vector3,
  d: number,
};

type PerimeterEdge = {
  firstOutgoingIntersection?: Vector2,
  firstOutgoingIntersectionEdge?: PerimeterEdge,
  dir: Vector2,
  withPlane: Plane,
}

type Perimeter = PerimeterEdge[];

type Face = {
  transformToCoordinateSpace: Matrix4,
  transformFromCoordinateSpace: Matrix4,
  plane: Plane,
  perimeter: Perimeter,
}

type Shape = Face[];

const planesCube = (
    width: number,
    height: number,
    depth: number,
): Plane[] => {
  // TODO can we iterate over this instead?
  return [
    {
      normal: [-1, 0, 0],
      d: width/2,
    },
    {
      normal: [1, 0, 0],
      d: width/2,
    },
    {
      normal: [0, -1, 0],
      d: height/2,
    },
    {
      normal: [0, 1, 0],
      d: height/2,
    },
    {
      normal: [0, 0, -1],
      d: depth/2,
    },
    {
      normal: [0, 0, 1],
      d: depth/2,
    },
  ];
};

const planeFromPointAndNormal = (p: Vector3, n: Vector3, d: number = 0): Plane => {
  const point = p.map((v, i) => v + n[i] * d) as Vector3;
  const cosAngle = vectorNDotProduct(VECTOR3_UP, n);
  const axis = Math.abs(cosAngle) < ONE_MINUS_EPSILON
      ? vectorNNormalize(vector3CrossProduct(VECTOR3_UP, n))
      : VECTOR3_EAST;
  const transform = matrix4Rotate(-Math.acos(cosAngle), ...axis);
  const rotatedPoint = vector3TransformMatrix4(transform, ...point);
  const newD = rotatedPoint[2];
  return {
    d: newD,
    normal: n,
  };
}

const planeTransform = (p: Plane, transform: Matrix4) => {
  const point = vectorNScale(p.normal, p.d);
  const transformedPoint = vector3TransformMatrix4(transform, ...point);
  const transformedNormal = vector3TransformMatrix4(transform, ...p.normal);
  const transformedOrigin = vector3TransformMatrix4(transform, 0, 0, 0);
  return planeFromPointAndNormal(
      transformedPoint,
      vectorNNormalize(
          vectorNSubtract(transformedNormal, transformedOrigin),
      ),
  );
};

const planesCapsule = (steps: number, width: number, radiusLeft: number, radiusRight: number = radiusLeft): Plane[] => {
  const endSteps = steps / 2 | 0;

  const sphereAngle = Math.asin((radiusRight - radiusLeft)/width);
  const sideAngle = Math.PI/2 + sphereAngle;
  const sinSideAngle = Math.sin(sideAngle);
  const cosSideAngle = Math.cos(sideAngle);

  const minRadiansPerStep = Math.PI*2/steps;
  const leftSteps = radiusLeft ? (Math.PI - sphereAngle) / minRadiansPerStep | 0 : 0;
  const rightSteps = radiusRight ? (Math.PI + sphereAngle) / minRadiansPerStep | 0 : 0;
  
  // create the cylinder
  return new Array(steps).fill(0).flatMap<Plane>((_, i) => {

    const angle = i * Math.PI * 2 / steps;
    const sinAngle = Math.sin(angle);
    const cosAngle = Math.cos(angle);

    return [
      planeFromPointAndNormal(
          [width/2, 0, 0],
          [cosSideAngle, sinAngle * sinSideAngle, cosAngle * sinSideAngle],
          radiusRight,
      ), 
      ...new Array(leftSteps).fill(0).map((_, j) => {
        const a = Math.PI/2 + sphereAngle + (Math.PI/2 - sphereAngle) * (j+.5) / leftSteps;
        const sin = Math.sin(a);
        const cos = Math.cos(a);
        return planeFromPointAndNormal(
            [-width/2, 0, 0],
            [cos, sinAngle * sin, cosAngle * sin],
            radiusLeft,
        )
      }),
      ...new Array(rightSteps).fill(0).map((_, j) => {
        const a = Math.PI/2 - sphereAngle - (Math.PI/2 + sphereAngle) * (j+.5) / rightSteps;
        const sin = Math.sin(a);
        const cos = Math.cos(a);
        return planeFromPointAndNormal(
            [width/2, 0, 0],
            [cos, sinAngle * sin, cosAngle * sin],
            radiusRight,
        )
      }),
    ];
  }).concat({
    // create the end pieces
    // TODO we could generate this as part fo the sphere above if we had plane/point trimming
    d: width/2 + radiusRight,
    normal: [1, 0, 0],
  }, {
    d: width/2 + radiusLeft,
    normal: [-1, 0, 0],
  });
};

const planeFlipAndDuplicateOnAxis = (planes: Plane[], axis: number) => {
  const normal = [0, 0, 0];
  normal[axis] = 1;
  return planes.flatMap(plane => {
    const cosAngle =  vectorNDotProduct(plane.normal, normal);
    if (Math.abs(cosAngle) < EPSILON) {
      // perpendicular, we ignore
      return [plane];
    }
    const inverseNormal: Vector3 = [...plane.normal];
    inverseNormal[axis] = -inverseNormal[axis];
    const inverse: Plane = {
      ...plane,
      normal: inverseNormal,
    };
    return [plane, inverse];
  });
};

const shapeBounds = (shape: Shape, transform?: Matrix4 | Falsey, minimalDimensions?: Booleanish): Rect3 => {
  const [min, max]: [Vector3, Vector3] = shape.reduce<[Vector3|Falsey, Vector3|Falsey]>((acc, face) => {
    const t = matrix4Multiply(transform, face.transformFromCoordinateSpace);
    return face.perimeter.reduce(([min, max], { firstOutgoingIntersection }) => {
      const p = vector3TransformMatrix4(t, ...firstOutgoingIntersection, 0);
      return [
        min ? min.map((v, i) => Math.min(v, p[i])) as Vector3 : p,
        max ? max.map((v, i) => Math.max(v, p[i])) as Vector3 : p,
      ];
    }, acc);
  }, [0, 0]) as Rect3;
  const physicalDimensions = max.map((v, i) => v - min[i]) as Vector3
  const dimensions = minimalDimensions
      ? new Array(3)
          .fill(physicalDimensions.reduce((acc, p) => Math.min(acc, p), physicalDimensions[0])) as Vector3
      : physicalDimensions;
  const position = min.map((m, i) => m + (physicalDimensions[i] - dimensions[i])/2) as Vector3;
  
  return [position, dimensions];
};

const shapeFromPlanes = (planes: Plane[], transform: Matrix4 = matrix4Identity()): Shape => {
  const faces: Face[] = [];
  for (let i=0; i<planes.length; i++) {
    const plane = planes[i];
    
    // create the surface
    
    const cosAngle = vectorNDotProduct(plane.normal, VECTOR3_UP);
    // console.log('plane', plane.normal);
    let rotateToCoordinateSpace: Matrix4;
    if (cosAngle < 1 - EPSILON) {
      const angle = Math.acos(cosAngle);
      const axis: Vector3 = cosAngle > EPSILON - 1
          ? vectorNNormalize(vector3CrossProduct(plane.normal, VECTOR3_UP))
          : [1, 0, 0];
      // console.log('angle', angle);
      // console.log('axis', axis);
      rotateToCoordinateSpace = matrix4Rotate(angle, ...axis);
    } else {
      rotateToCoordinateSpace = matrix4Identity();
    }
    const transformToCoordinateSpace = matrix4Multiply(matrix4Translate(0, 0, -plane.d), rotateToCoordinateSpace);
    const transformFromCoordinateSpace = matrix4Multiply(transform, matrix4Invert(transformToCoordinateSpace)!);

    // console.log('v', vectorNToPrecision(vector3TransformMatrix4(transformToCoordinateSpace, plane.normal[0] * plane.d, plane.normal[1] * plane.d, plane.normal[2] * plane.d), 100));

    const edges: (PerimeterEdge & {
      point: Vector2,
    })[] = [];

    for (let j=0; j<planes.length; j++) {
      const compare = planes[j];
      const dot = vectorNDotProduct(plane.normal, compare.normal);
      if (Math.abs(dot) < 1 - EPSILON) {
        // rotate to coordinate space
        const rotatedCompareNormal = vector3TransformMatrix4(rotateToCoordinateSpace, ...compare.normal);
        const comparePoint = vectorNScale(compare.normal, compare.d);
        const rotatedComparePoint = vector3TransformMatrix4(transformToCoordinateSpace, ...comparePoint);
        const intersectionDirection = vectorNNormalize(vector3CrossProduct(rotatedCompareNormal, VECTOR3_UP));

        const compareDirection = vectorNNormalize(vector3CrossProduct(intersectionDirection, rotatedCompareNormal));
        const intersectionProportion = -rotatedComparePoint[2]/compareDirection[2];
        const intersectionPoint = rotatedComparePoint.map((v, i) => v + intersectionProportion * compareDirection[i]) as Vector3;

        // console.log('  compare', compare.normal);
        // console.log('  rotated compare normal', rotatedCompareNormal);
        // console.log('  rotated compoare point', rotatedComparePoint);
        // console.log('  compare direction', compareDirection);
        // console.log('  intersection direction', intersectionDirection);
        // console.log('  intersection point', intersectionPoint);

        edges.push({
          dir: intersectionDirection.slice(0, 2) as Vector2,
          point: intersectionPoint.slice(0, 2) as Vector2,
          withPlane: compare,
        });
      } else {
        if (plane.d > compare.d) {
          // this plane is dead to us
          //continue outer;
        }
      }
    }

    // compute perimeter

    //console.log('lines', JSON.stringify(lines.map(line => [line.point.slice(0, 2), line.direction.slice(0, 2)])));

    for (let j=0; j<edges.length; j++) {
      let line = edges[j];
      const nx2 = line.dir[0];
      const ny2 = line.dir[1];
      const px2 = line.point[0];
      const py2 = line.point[1];
      let minLine: PerimeterEdge | undefined;
      let maxD: number | undefined;
      for (let k=0; k<edges.length; k++) {
        let compare = edges[k];
        let cosAngle = vectorNDotProduct([-line.dir[1], line.dir[0]], compare.dir as [number, number]);
        if (cosAngle > EPSILON) {
          // px1 + nx1 * d1 = px2 + nx2 * d2
          //   => d1 = (px2 + nx2 * d2 - px1)/nx1
          // py1 + ny1 * d1 = py2 + ny2 * d2
          //   => d1 = (py2 + ny2 * d2 - py1)/ny1
          // => (px2 + nx2 * d2 - px1)/nx1 = (py2 + ny2 * d2 - py1)/ny1
          // => ny1 * px2 + ny1 * nx2 * d2 - ny1 * px1 = nx1 * py2 + nx1 * ny2 * d2 - nx1 * py1
          // => d2 * (ny1 * nx2 - nx1 * ny2) = nx1 * py2 - nx1 * py1 - ny1 * px2 + ny1 * px1
          // => d2 = (nx1 * py2 - nx1 * py1 - ny1 * px2 + ny1 * px1)/(ny1 * nx2 - nx1 * ny2)
        
          const nx1 = compare.dir[0];
          const ny1 = compare.dir[1];
          const px1 = compare.point[0];
          const py1 = compare.point[1];
          const d = (nx1 * py2 - nx1 * py1 - ny1 * px2 + ny1 * px1)/(ny1 * nx2 - nx1 * ny2);
          if (maxD == null || d > maxD) {
            minLine = compare;
            maxD = d;
          }
        }
      }
      if (maxD != null) {
        line.firstOutgoingIntersection = [px2 + nx2 * maxD, py2 + ny2 * maxD];
        line.firstOutgoingIntersectionEdge = minLine;
      }
    }

    const perimeter: PerimeterEdge[] = [];
    let edge: PerimeterEdge = edges.find(edge => edge.firstOutgoingIntersectionEdge);
    while (edge) {
      perimeter.push(edge);
      edge = edge.firstOutgoingIntersectionEdge;
      const index = perimeter.findIndex(p => p == edge);
      if (index >= 0) {
        perimeter.splice(0, index);
        break;
      }
    };
    if (perimeter.length > 2) {
      const face: Face = {
        transformToCoordinateSpace,
        transformFromCoordinateSpace,
        plane,
        perimeter,
      };
  
      faces.push(face);  
    // } else {
    //   console.log('dropped plane', plane);
    }
    // console.log('surface', JSON.stringify(surface.perimeter.map(l => l.firstOutgoingIntersection)));
  }
  return faces
      // remove any faces that contain points that are outside the other planes (alternatively, might be able to 
      // detect CW points and remove that way)
      .filter(f => {
        return f.perimeter.every(p => {
          const point = vector3TransformMatrix4(f.transformFromCoordinateSpace, ...p.firstOutgoingIntersection, 0);
          return faces.every(face => vector3TransformMatrix4(face.transformToCoordinateSpace, ...point)[2] < EPSILON);
        });
      })
      // remove any surfaces that no longer intersect with any plane used in the shape
      .filter((f, i, faces) => faces.some(
          face => face.perimeter.some(
              edge => edge.firstOutgoingIntersectionEdge?.withPlane == f.plane,
          ),
      ));
}

const shapeContainsPointsFromShape = (
    container: Shape,
    containerTransform: Matrix4,
    pointSource: Shape,
    pointSourceTransform: Matrix4,
) => {
  return pointSource.some(face => {
    const transform = matrix4Multiply(
        matrix4Invert(containerTransform),
        pointSourceTransform,
        face.transformFromCoordinateSpace,
    );
    return face.perimeter.some(p => {
      const point = vector3TransformMatrix4(transform, ...p.firstOutgoingIntersection, 0);
      return container.every(face => {
        return vector3TransformMatrix4(face.transformToCoordinateSpace, ...point)[2] < EPSILON;
      });
    });
  });
}

