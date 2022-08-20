///<reference path="bodies/clubs.ts"/>
///<reference path="bodies/steps.ts"/>
///<reference path="bodies/skeleton.ts"/>
///<reference path="bodies/wall.ts"/>
///<reference path="level/entity.ts"/>
///<reference path="level/level.ts"/>
///<reference path="math/math.ts"/>
///<reference path="math/matrix.ts"/>
///<reference path="math/shape.ts"/>
///<reference path="util/arrays.ts"/>
///<reference path="constants.ts"/>
///<reference path="flags.ts"/>
///<reference path="keys.ts"/>
///<reference path="webgl.ts"/>


const A_VERTEX_POSIITON = 'aVertexPosition';

const U_MODEL_VIEW_MATRIX = 'uModelViewMatrix';
const U_PROJECTION_MATRIX = 'uProjectionMatrix';
const U_CAMERA_POSITION = 'uCameraPosition';

const UNIFORMS = [
  U_MODEL_VIEW_MATRIX,
  U_PROJECTION_MATRIX,
  U_CAMERA_POSITION,
];

const V_POSITION = 'vPosition';

const VERTEX_SHADER = `#version 300 es
  precision lowp float;

  uniform mat4 ${U_MODEL_VIEW_MATRIX};
  uniform mat4 ${U_PROJECTION_MATRIX};

  in vec4 ${A_VERTEX_POSIITON};
  out vec3 ${V_POSITION};

  void main() {
    vec4 position = ${U_MODEL_VIEW_MATRIX} * ${A_VERTEX_POSIITON};
    ${V_POSITION} = position.xyz;
    gl_Position = ${U_PROJECTION_MATRIX} * position;
  }
`;

const OUT_RESULT = 'result';

const FRAGMENT_SHADER = `#version 300 es
  precision lowp float;

  uniform vec3 ${U_CAMERA_POSITION};

  in vec3 ${V_POSITION};
  out vec4 ${OUT_RESULT};

  void main() {
    float d = length(${U_CAMERA_POSITION} - ${V_POSITION});
    vec3 c = mix(${V_POSITION}/9., vec3(0.), d/3.);
    ${OUT_RESULT} = vec4(c, 1.);
  }
`;

const gl = Z.getContext('webgl2');
if (FLAG_SHOW_GL_ERRORS && gl == null) {
  throw new Error('no webgl2');
}
const vertexShader = loadShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

gl.clearColor(0, 0, 0, 1);

const program = gl.createProgram();
if (FLAG_SHOW_GL_ERRORS && program == null) {
  throw new Error();
}
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (FLAG_SHOW_GL_ERRORS && !gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramInfoLog(program) || 'bad');
}

const attributeVertexPosition = gl.getAttribLocation(program, A_VERTEX_POSIITON);

const [
  uniformModelViewMatrix,
  uniformProjectionMatrix,
  uniformCameraPosition,
] = UNIFORMS.map(uniform => gl.getUniformLocation(program, uniform));

gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LESS);
gl.enable(gl.CULL_FACE);
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const width = 9;
const height = 9;
const depth = 9;
const dimensions: Vector3 = [width, height, depth];
const tiles: Tile[][][] = array3New(...dimensions, () => ({}))

let playerRotation = 0;

const shapes = [
  SHAPE_WALL,
  ...SHAPE_STEPS,
  SHAPE_SKELETON_TORSO,
  SHAPE_SKELETON_HEAD,
  SHAPE_SKELETON_HIPS,
  SHAPE_SKELETON_HUMERUS,
  SHAPE_SKELETON_FOREARM,
  SHAPE_SKELETON_FEMUR,
  SHAPE_SKELETON_SHIN,
  ...SHAPES_CLUBS,
];
const models: [WebGLVertexArrayObject, number][] = shapes.map(shape => {
  const [vertexData, indices] = shape.reduce<[Vector3[], number[]]>(([vertexData, indices], face) => {
    
    const points = face.perimeter.map(({ firstOutgoingIntersection }) => firstOutgoingIntersection);
    const surfaceIndices = face.perimeter.slice(2).flatMap(
        (_, i) => [vertexData.length, vertexData.length + i + 1, vertexData.length + i + 2]
    );
    indices.push(...surfaceIndices);
    vertexData.push(
        ...points.map(([x, y]) =>
            vectorNToPrecision(
                vector3TransformMatrix4(face.transformFromCoordinateSpace, x, y, 0),
            ),
        ),
    );  
    return [vertexData, indices];
  }, [[], []]);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vertexBuffer = gl.createBuffer();
  gl.enableVertexAttribArray(attributeVertexPosition);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertexData.flat()),
    gl.STATIC_DRAW,
  );
  gl.vertexAttribPointer(attributeVertexPosition, 3, gl.FLOAT, false, 0, 0);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return [vao, indices.length];
});

const level: Level = {
  dimensions,
  tiles,
};

let id = 0;

// populate with a floor
for (let x=0; x<width; x++) {
  for (let y=0; y<height; y++) {
    const floor: Entity<WallPartId> = {
      id: id++,
      position: [x, y, 0],
      dimensions: [1, 1, 1],
      rotation: [0, 0, 0],
      body: PART_WALL,
      collisionGroup: COLLISION_GROUP_WALL,
    };
    levelAddEntity(level, floor);
    if ((y > Math.floor(height/2) && x != Math.floor(width/2) || x >= width - 3)) {
      const wall: Entity<WallPartId> = {
        id: id++,
        position: [x, y, 1],
        dimensions: [1, 1, 1],
        rotation: [0, 0, 0],
        body: PART_WALL,
        collisionGroup: COLLISION_GROUP_WALL,
      }
      levelAddEntity(level, wall);
    }
  }
}
// add some stairs
const stepOrientation = ORIENTATION_SOUTH;
const stepParts = PART_ORIENTATION_STEPS[stepOrientation];
const stepsPosition: Vector3 = [width - 4, height/2 | 0, 1];
const transform = matrix4Multiply(
    matrix4Translate(...stepsPosition),
    matrix4Translate(.5, 0, 0),
    matrix4Rotate(Math.PI/2 * stepOrientation, 0, 0, 1),
    matrix4Translate(-.5, 0, 0),
);

stepParts.reduce((z, stepPart, i) => {
  const t = matrix4Multiply(transform, matrix4Translate(-STEP_WIDTH/2 * i, 0, z + STEP_DEPTH/2));
  const [position, dimensions] = shapeBounds(SHAPE_STEPS[i], t);
  const step: Immovable & Entity = {
    id: id++,
    position,
    dimensions,
    rotation: [0, 0, 0],
    body: stepPart,
    collisionGroup: COLLISION_GROUP_WALL,
  };
  levelAddEntity(level, step);
  return z + dimensions[2];
}, 0);  

// clubs
PARTS_CLUBS.forEach((clubBody, i) => {
  const clubShape = shapes[clubBody.modelId];
  const t = matrix4Multiply(matrix4Translate(2.5 + i, 2.5, 1)/*, matrix4Rotate(Math.PI/2, 0, 1, 0)*/);
  const [position, dimensions] = shapeBounds(clubShape, t);
  const club: Entity<ClubPartId> = {
    id: id++,
    body: clubBody,
    dimensions,
    position: [position[0], position[1], position[2] + .5],
    rotation: [0, 0, 0],
    velocity: [0, 0, 0],
    collisionGroup: COLLISION_GROUP_ITEM,
    collisionMask: COLLISION_GROUP_WALL,
  };
  levelAddEntity(level, club);
});

// and a player
const player: Entity<SkeletonPartId> = {
  id: id++,
  position: [(width - SKELETON_DIMENSION)/2, (height - SKELETON_DIMENSION)/2, 1.1],
  dimensions: [SKELETON_DIMENSION, SKELETON_DIMENSION, SKELETON_DEPTH],
  orientation: ORIENTATION_EAST,
  body: PART_SKELETON_BODY,
  velocity: [0, 0, 0],
  rotation: [0, 0, 0],
  collisionGroup: COLLISION_GROUP_MONSTER,
  collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_MONSTER,
};
levelAddEntity(level, player);

const baseCameraRotation = matrix4Rotate(-Math.PI/2.5, 1, 0, 0);
let cameraOffset = 3;
let cameraOffsetTransform: Matrix4;
let projection: Matrix4;
const resizeCanvas = () => {
  Z.width = innerWidth;
  Z.height = innerHeight;
  projection = matrix4Multiply(matrix4InfinitePerspective(.8, Z.width/Z.height, .1), baseCameraRotation);
  gl.viewport(0, 0, Z.width, Z.height);
}
resizeCanvas();
onresize = resizeCanvas;
const zoom = (e?: WheelEvent) => {
  cameraOffset = Math.min(10, Math.max(1, cameraOffset + (e?.deltaY || 0)/9));
  cameraOffsetTransform = matrix4Translate(0, cameraOffset, -.5);
};
onwheel = zoom;
zoom();

let targetCameraOrientation: Orientation = ORIENTATION_EAST;
let cameraZRotation = 0;

let keyStates: Record<number, 0 | 1> = {};

onkeydown = (e: KeyboardEvent) => {
  keyStates[e.keyCode] = 1;
  if (e.keyCode == KEY_E) {
    targetCameraOrientation = (targetCameraOrientation - 1) as Orientation;
    if (targetCameraOrientation < 0) {
      targetCameraOrientation = ORIENTATION_SOUTH;
    }
  } 
  if (e.keyCode == KEY_Q) {
    targetCameraOrientation = (targetCameraOrientation + 1) % 4 as Orientation
  }
  e.preventDefault();
};

onkeyup = (e: KeyboardEvent) => {
  keyStates[e.keyCode] = 0;
};

let then = 0;
let worldTime = 0;
const update = (now: number) => {
  const delta = Math.min(now - then, MAX_MILLISECONDS_PER_FRAME);
  worldTime += delta;
  then = now;

  const targetCameraZRotation = targetCameraOrientation * Math.PI/2;  
  const cameraZDelta = mathAngleDiff(cameraZRotation, targetCameraZRotation);
  cameraZRotation += cameraZDelta * delta / 100;
  const cameraRotation = matrix4Rotate(cameraZRotation, 0, 0, 1);
  const playerMidPoint = player.position.map((v, i) => -player.dimensions[i]/2  - v) as Vector3;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(
      uniformProjectionMatrix,
      false,
      matrix4Multiply(projection, cameraOffsetTransform, cameraRotation, matrix4Translate(...playerMidPoint)),
  );
  gl.uniform3fv(
      uniformCameraPosition,
      player.position,
  );

  levelIterateEntitiesInBounds(
      level, [0, 0, 0],
      level.dimensions,
      entity => {
        // update animations
        if (!entity.joints && entity.body.defaultJointRotations) {
          entity.joints = entity.body.defaultJointRotations.map(rotation => ({
            rotation,
          }));
        }
        // TODO can we make the entity a joint?
        [...(entity.joints || []), entity].forEach((joint) => {
          if (joint.anim && joint.anim(worldTime)) {
            joint.anim = 0;
            joint.animAction = 0;
          }
        });

        if (entity.velocity) {
          let action: ActionId = ACTION_ID_IDLE;

          if (entity == player) {
            const running = keyStates[KEY_SHIFT] || keyStates[KEY_CAPS_LOCK] || 0;
            const right = keyStates[KEY_RIGHT] || keyStates[KEY_D] || 0;
            const left = keyStates[KEY_LEFT] || keyStates[KEY_A] || 0;
            const up = keyStates[KEY_UP] || keyStates[KEY_W] || keyStates[KEY_SPACE] || 0;
            if (up) {
              keyStates[KEY_UP] = 0;
              keyStates[KEY_W] = 0;
              keyStates[KEY_SPACE] = 0;
            }
            const definitelyOnGround = entity.lastZCollision >= worldTime - delta;
            const probablyOnGround = entity.lastZCollision > worldTime - MAX_JUMP_DELAY;
            // TODO can we compute all this in one loop?
            const cannotWalk = entityCannotPerformAction(entity, ACTION_ID_WALK);
            const cannotRun = entityCannotPerformAction(entity, ACTION_ID_RUN);
            const cannotJump = entityCannotPerformAction(entity, ACTION_ID_JUMP);
            const cannotTurn = entityCannotPerformAction(entity, ACTION_ID_TURN);
            const cannotFall = entityCannotPerformAction(entity, ACTION_ID_FALL);

            const playerVelocity = cannotWalk ? 0 : (right - left) * (1 + (cannotRun ? 0 : running)) / 999;
            if (!cannotWalk && (left || right) && probablyOnGround) {
              action = ACTION_ID_WALK;
            }
            if (!cannotRun && up && probablyOnGround) {
              action = ACTION_ID_RUN;
            }
            if (!cannotJump && up && probablyOnGround) {
              action = ACTION_ID_JUMP;
            }
            if (!cannotFall && !probablyOnGround) {
              action = ACTION_ID_FALL;
            }
            if (definitelyOnGround) {
              entity.velocity = vector3TransformMatrix4(
                  matrix4Rotate(-targetCameraZRotation, 0, 0, 1),
                  playerVelocity,
                  0,
                  entity.velocity[2] + (cannotJump ? 0 : up * .003),
              );
            }
            const cameraDelta = entity.orientation % 2 - targetCameraOrientation % 2
            if ((
                cameraDelta
                    || entity.orientation == targetCameraOrientation && left
                    || (entity.orientation + 2) % 4 == targetCameraOrientation && right
                )
                && !cannotTurn
            ) {
              entity.orientation =left || cameraDelta && entity.lastCameraOrientation != entity.orientation
                      ? (targetCameraOrientation + 2) % 4 as Orientation
                      : targetCameraOrientation;
              entity.lastCameraOrientation = targetCameraOrientation;
              const targetAngle = -entity.orientation * Math.PI/2;
              const to: Vector3 = [0, 0, targetAngle];
              entity.anim = animLerp(
                  worldTime,
                  player,
                  to,
                  499,
                  EASE_IN_OUT_QUAD,
                  1,
              );
              action = ACTION_ID_TURN;
            }
          }

          const movable = entity as Moveable;
          // add in gravity
          movable.velocity[2] -= delta * .00001;
          // move toward centerline of cross-orientation
          if (entity.orientation != null) {
            const crossAxis = (entity.orientation + 1) % 2;
            const center = entity.position[crossAxis] + entity.dimensions[crossAxis]/2; 
            const rail = (center | 0) + .5;
            movable.velocity[crossAxis] += (rail - center)/99;  
          }
          
          // limit velocity
          movable.velocity = entity.velocity.map(
              v => v > 0 ? Math.min(v, MAX_VELOCITY) : Math.max(v, -MAX_VELOCITY),
          ) as Vector3;
          // check collisions
          let collisions = 0;
          let maxOverlapIndex: number;
          let remainingDelta = delta;
          let maxIntersectionArea = 0;
          let verticalIntersectionCount = 0;
          do {
            const targetPosition = entity.position.map((v, i) => v + entity.velocity[i] * remainingDelta) as Vector3;
            const maximalPosition = entity.position.map((v, i) => Math.min(v, targetPosition[i])) as Vector3;
            const maximalDimensions = entity.dimensions.map(
                (v, i) => v + Math.abs(entity.velocity[i] * remainingDelta),
            ) as Vector3;

            let maxOverlapDelta = 0;
            let maxCollisionEntity: Entity | Falsey;
            maxOverlapIndex = -1;
            levelIterateEntitiesInBounds(level, maximalPosition, maximalDimensions , collisionEntity => {
              if (collisionEntity == entity
                  || !(collisionEntity.collisionGroup & entity.collisionMask)
              ) {
                return;
              }
              const startingIntersection = rect3Intersection(
                entity.position,
                entity.dimensions,
                collisionEntity.position,
                collisionEntity.dimensions,
              );
              if (startingIntersection.every(v => v > 0)) {
                  console.log('collions', collisions);
                  console.log('started inside');
                  console.log('position', entity.position);
                  console.log('dimensions', entity.dimensions);
                  console.log('velocity', entity.velocity);
                  console.log('collision position', collisionEntity.position);
                  console.log('collision dimensions' , collisionEntity.dimensions);
                  console.log('intersection', startingIntersection);
                  console.log('previous collision', entity.previousCollision);
                  //console.log('index', i);
              }

              // do we overlap?
              const intersection = rect3Intersection(
                  targetPosition,
                  entity.dimensions,
                  collisionEntity.position,
                  collisionEntity.dimensions,
              );
              if (intersection.every(v => v >= 0)) {
                if (collisionEntity.velocity) {
                  // only do soft collisions in first iteration
                  if (!collisions) {
                    // TODO soft collisions with other movable objects
                  }
                } else {
                  // scale by velocity to get collision time
                  const overlap = intersection.reduce<[number, number, number] | Falsey>((acc, v, i) => {
                    const velocity = entity.velocity[i];
                    if (velocity < 0 && targetPosition[i] + v + EPSILON > collisionEntity.position[i] + collisionEntity.dimensions[i] ||
                        velocity > 0 && targetPosition[i] + entity.dimensions[i] - v - EPSILON < collisionEntity.position[i]
                    ) {
                      const overlapDelta = v/Math.abs(velocity);
                      // unclear if this actually has any effect
                      const intersectionArea = intersection.reduce((a, v, j) => a * (j == i ? 1 : v), 1);
                      // if ((i != 2 || maxOverlapIndex >= 0 && maxOverlapIndex < 2) && overlapDelta <= remainingDelta) {
                      //   console.log('trip', intersection, i, velocity, intersectionArea);
                      // }
                      
                      if (overlapDelta < remainingDelta + EPSILON && 
                          (!acc
                              || overlapDelta > acc[0]
                              || overlapDelta > acc[0] - EPSILON && acc[1] < intersectionArea
                          )
                      ) {
                        return [overlapDelta, intersectionArea, i];
                      }  
                    }
                    return acc;
                  }, 0);
                  if (overlap) {
                    const [overlapDelta, intersectionArea, overlapIndex] = overlap;
                    if (overlapIndex != 2) {
                      verticalIntersectionCount++;
                    }
                    if (overlapDelta < remainingDelta + EPSILON && 
                        (overlapDelta > maxOverlapDelta
                            || overlapDelta > maxOverlapDelta - EPSILON && maxIntersectionArea < intersectionArea
                        )
                    ) {
                      maxOverlapDelta = overlapDelta;
                      maxIntersectionArea = intersectionArea;
                      maxOverlapIndex = overlapIndex;
                      maxCollisionEntity = collisionEntity;
                    }
                  }
                }
              }
            });
            const moveDelta = Math.max(0, remainingDelta - maxOverlapDelta - .1);
            remainingDelta = maxOverlapDelta;
            entity.position = entity.position.map((v, i) => v + entity.velocity[i] * moveDelta) as Vector3;
            if (maxCollisionEntity) {
              entity.previousCollision = {
                maxCollisionEntity,
                maxIntersectionArea,
                maxOverlapIndex,
                worldTime,
              };
              collisions ++;
              // check if we can step up
              // TODO: only do this if we are a creature
              if (maxOverlapIndex != 2
                  && verticalIntersectionCount == 1
                  && entity.position[2] > maxCollisionEntity.position[2] + maxCollisionEntity.dimensions[2] - STEP_DEPTH - EPSILON
              ) {
                entity.velocity[2] = Math.max(.001, entity.velocity[2]);
                // steps count as a z collision
                entity.lastZCollision = worldTime;
              }
              entity.velocity[maxOverlapIndex] = 0;
              if (maxOverlapIndex == 2) {
                entity.lastZCollision = worldTime;
              }
              // if (maxOverlapIndex != 2) {
              //   console.log('x', maxOverlapIndex);
              // }
            }
          } while (remainingDelta > EPSILON && collisions < MAX_COLLISIONS);

          if (collisions >= MAX_COLLISIONS) {
            console.log('too many collisions');
          }

          // start new animations
          const bodyAnimations = entity.body.anims?.[action];
          if (!entityCannotPerformAction(entity, action) && bodyAnimations) {
            // find the index with the smallest move time
            const [bestAnimationDuration, bestAnimationIndex] = bodyAnimations.reduce((acc, bodyAnimation, i) => {
              const [min] = acc;
              const animationDuration = entity.joints.reduce((max, v, jointId) => {
                const jointBodyAnim = bodyAnimation[jointId];
                // only interested in how long it takes to move to the first step
                return jointBodyAnim && animDeltaRotation(v.rotation, jointBodyAnim[0][0]) > max
                    ? delta
                    : max;
              }, 0);
              if (animationDuration < min) {
                return [animationDuration, i];
              }
              return acc;
            }, [9999, 0]);
            const bodyAnimation = bodyAnimations[bestAnimationIndex];
            entity.joints.forEach((joint, jointId) => {
              const bodyJointAnimation = bodyAnimation[jointId];
              const defaultBodyJointRotation = entity.body.defaultJointRotations?.[jointId];
              if (joint.animAction != action && bodyJointAnimation
                  || defaultBodyJointRotation && !joint.animAction) {
                const easing = bodyJointAnimation?.[3] || EASE_LINEAR;
                const anim = bodyJointAnimation
                    ? animComposite(...bodyJointAnimation[0].map(rotation => {
                      // TODO use max speed correctly
                      const duration = 1/bodyAnimation.maxSpeed;
                      return now => animLerp(now, joint, rotation, duration, easing);
                    }))
                    // TODO use overall speed of the animation
                    : animLerp(worldTime, joint, defaultBodyJointRotation, 100, easing);
                joint.anim = anim;
                joint.animAction = action;
                joint.animActionIndex = bestAnimationIndex;
              }
            })
          }
        }

        entityIterateParts(
            (part, transform) => {
              const [vao, count] = models[part.modelId];
              gl.uniformMatrix4fv(uniformModelViewMatrix, false, transform);
              gl.bindVertexArray(vao);
              gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
            },
            entity.body,
            entity.joints,
            matrix4Multiply(
                matrix4Translate(...(entity.dimensions.map((v, i) => v/2 + entity.position[i]) as Vector3)),
                matrix4RotateInOrder(...entity.rotation),
            ),
        );
      },
  );

  requestAnimationFrame(update);
};
update(0);
