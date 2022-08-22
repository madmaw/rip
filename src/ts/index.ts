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
///<reference path="inputs.ts"/>
///<reference path="webgl.ts"/>


const A_VERTEX_POSIITON = 'aVertexPosition';
const A_VERTEX_NORMAL = 'aVertexNormal';

const ATTRIBUTES = [
  A_VERTEX_POSIITON,
  A_VERTEX_NORMAL,
];

const U_MODEL_VIEW_MATRIX = 'uModelViewMatrix';
const U_MODEL_ATTRIBUTES = 'uModelAttributes';
const U_PROJECTION_MATRIX = 'uProjectionMatrix';
const U_CAMERA_POSITION = 'uCameraPosition';
const U_LIGHT_POSITIONS = 'uLightPositions';

const UNIFORMS = [
  U_MODEL_VIEW_MATRIX,
  U_MODEL_ATTRIBUTES,
  U_PROJECTION_MATRIX,
  U_CAMERA_POSITION,
  U_LIGHT_POSITIONS,
];

const V_POSITION = 'vPosition';
const V_NORMAL = 'vNormal';

const VERTEX_SHADER = `#version 300 es
  precision lowp float;

  uniform mat4 ${U_MODEL_VIEW_MATRIX};
  uniform mat4 ${U_PROJECTION_MATRIX};

  in vec4 ${A_VERTEX_POSIITON};
  in vec3 ${A_VERTEX_NORMAL};
  out vec3 ${V_POSITION};
  out vec3 ${V_NORMAL};

  void main() {
    vec4 position = ${U_MODEL_VIEW_MATRIX} * ${A_VERTEX_POSIITON};
    ${V_POSITION} = position.xyz;
    ${V_NORMAL} = normalize(${U_MODEL_VIEW_MATRIX} * vec4(${A_VERTEX_NORMAL}, 1.) - ${U_MODEL_VIEW_MATRIX} * vec4(vec3(0.), 1.)).xyz;
    gl_Position = ${U_PROJECTION_MATRIX} * position;
  }
`;

const OUT_RESULT = 'result';

const FRAGMENT_SHADER = `#version 300 es
  precision lowp float;

  float ambientLight = 0.;

  uniform vec3 ${U_CAMERA_POSITION};
  uniform vec4 ${U_LIGHT_POSITIONS}[${MAX_LIGHTS}];
  uniform float ${U_MODEL_ATTRIBUTES};

  in vec3 ${V_POSITION};
  in vec3 ${V_NORMAL};
  out vec4 ${OUT_RESULT};

  void main() {
    float l =${U_MODEL_ATTRIBUTES};
    if (l <= 0.) {
      for (int i=0; i<${MAX_LIGHTS}; i++) {
        if (${U_LIGHT_POSITIONS}[i].w > 0.) {
          vec3 d = ${U_LIGHT_POSITIONS}[i].xyz - ${V_POSITION};
          l += mix(
                  dot(normalize(${V_NORMAL}), normalize(d)),
                  1.,
                  pow(max(0., (${MIN_LIGHT_THROW} - length(d))*${U_LIGHT_POSITIONS}[i].w), 2.)
              )
              * ${U_LIGHT_POSITIONS}[i].w
              * (1. - pow(1. - max(0., ${MAX_LIGHT_THROW}*${U_LIGHT_POSITIONS}[i].w - length(d))/${MAX_LIGHT_THROW}, 2.));
        }
      }  
    }
    vec3 c = vec3(l + ambientLight);
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

const [
  attributeVertexPosition,
  attributeVertexNormal,
] = ATTRIBUTES.map(attribute => gl.getAttribLocation(program, attribute));

const [
  uniformModelViewMatrix,
  uniformModelAttributes,
  uniformProjectionMatrix,
  uniformCameraPosition,
  uniformLightPositions,
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
  const [positions, normals, indices] = shape.reduce<[Vector3[], Vector3[], number[]]>(
      ([positions, normals, indices], face) => {
        const points = face.perimeter.map(({ firstOutgoingIntersection }) => firstOutgoingIntersection);
        const surfaceIndices = face.perimeter.slice(2).flatMap(
            (_, i) => [positions.length, positions.length + i + 1, positions.length + i + 2]
        );
        indices.push(...surfaceIndices);
        positions.push(
            ...points.map(p =>
                vectorNToPrecision(
                    vector3TransformMatrix4(face.transformFromCoordinateSpace, ...p, 0),
                ),
            ),
        );
        normals.push(
            ...new Array<Vector3>(points.length).fill(face.plane.normal),
        )
        return [positions, normals, indices];
      },
      [[], [], []],
  );
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  ([
    [attributeVertexPosition, positions],
    [attributeVertexNormal, normals],
  ] as const).forEach(
      ([attribute, vectors]) => {
        const buffer = gl.createBuffer();
        gl.enableVertexAttribArray(attribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(vectors.flat()),
          gl.STATIC_DRAW,
        );
        gl.vertexAttribPointer(attribute, vectors[0].length, gl.FLOAT, false, 0, 0);  
      }
  );

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
const clubs = PARTS_CLUBS.slice(0, 1).map((clubBody, i) => {
  const clubShape = shapes[clubBody.modelId];
  const t = matrix4Multiply(matrix4Translate(i + .5, 2.5, 1.2)/*, matrix4Rotate(Math.PI/2, 0, 1, 0)*/);
  const [position, dimensions] = shapeBounds(clubShape, t);
  const club: Entity<ClubPartId> = {
    id: id++,
    body: clubBody,
    dimensions,
    position,
    rotation: [0, 0, 0],
    velocity: [0, 0, 0],
    collisionGroup: COLLISION_GROUP_ITEM,
    collisionMask: COLLISION_GROUP_WALL,
  };
  return club;
});
clubs.map(club => levelAddEntity(level, club));

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
  // TODO remove this
  joints: PART_SKELETON_BODY.defaultJointRotations.map(rotation => ({
    rotation: [...rotation],
  }))  
};
player.joints[SKELETON_PART_ID_HEAD].light = .5;
// player.joints[SKELETON_PART_ID_FOREARM_RIGHT].attachedEntity = clubs[0];
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

onkeydown = (e: KeyboardEvent) => {
  keySet(e.keyCode as KeyCode, then, 1);
  e.preventDefault();
};

onkeyup = (e: KeyboardEvent) => keySet(e.keyCode as KeyCode, then, 0);

let then = 0;
let worldTime = 0;
let previousLights: Vector4[] = [];
const update = (now: number) => {
  const delta = Math.min(now - then, MAX_MILLISECONDS_PER_FRAME);
  worldTime += delta;
  then = now;

  const playerCenter = player.position.map((v, i) => v + player.dimensions[i]/2);
  previousLights.sort((a, b) => {
    return vectorNLength(vectorNSubtract(playerCenter, a)) - vectorNLength(vectorNSubtract(playerCenter, b));
  });

  const targetCameraZRotation = targetCameraOrientation * Math.PI/2;  
  const cameraZDelta = mathAngleDiff(cameraZRotation, targetCameraZRotation);
  cameraZRotation += cameraZDelta * delta / 100;
  const cameraRotation = matrix4Rotate(cameraZRotation, 0, 0, 1);
  const playerMidPoint = player.position.map((v, i) => v + player.dimensions[i]/2) as Vector3;
  const negatedPlayerMidPoint = vectorNScale(playerMidPoint, -1);
  const cameraPositionMatrix = matrix4Multiply(
      cameraOffsetTransform,
      cameraRotation,
      matrix4Translate(...negatedPlayerMidPoint),
  );
  const cameraPosition = vector3TransformMatrix4(matrix4Invert(cameraPositionMatrix), 0, 0, 0);
  const cameraRenderCutoffTransform = matrix4Multiply(
    matrix4Translate(0, .5, .2),
    matrix4Rotate(cameraZRotation, 0, 0, 1),
    matrix4Translate(...negatedPlayerMidPoint),
  );

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(
      uniformProjectionMatrix,
      false,
      matrix4Multiply(projection, cameraPositionMatrix),
  );
  gl.uniform3fv(
      uniformCameraPosition,
      cameraPosition,
  );

  gl.uniform4fv(
      uniformLightPositions,
      previousLights
          .slice(0, MAX_LIGHTS)
          .concat(...new Array(Math.max(0, MAX_LIGHTS - previousLights.length)).fill([0, 0, 0, 0]))
          .flat(),
  );
  previousLights = [];

  levelIterateEntitiesInBounds(
      level, [0, 0, 0],
      level.dimensions,
      entity => {
        // update animations
        if (!entity.joints && entity.body.defaultJointRotations) {
          entity.joints = entity.body.defaultJointRotations.map(rotation => ({
            rotation: [...rotation],
          }));
        }
        [...(entity.joints || []), entity].forEach((joint) => {
          if (joint.anim && joint.anim?.(worldTime)) {
            joint.anim = 0;
            joint.animAction = 0;
          }
        });
        if (entity.offsetAnim && entity.offsetAnim(worldTime)) {
          entity.offsetAnim = 0;
        }

        if (entity.velocity) {
          let action: ActionId | 0 = 0;
          const availableActions = entityAvailableActions(entity);
          const definitelyOnGround = entity.lastZCollision >= worldTime - delta;
          const probablyOnGround = entity.lastZCollision > worldTime - MAX_JUMP_DELAY;
          levelRemoveEntity(level, entity);


          if (entity == player) {

            const canIdle = availableActions & ACTION_ID_IDLE;
            const canWalk = availableActions & ACTION_ID_WALK;
            const canRun = availableActions & ACTION_ID_RUN;
            const canJump = availableActions & ACTION_ID_JUMP;
            const canTurn = availableActions & ACTION_ID_TURN;
            const canFall = availableActions & ACTION_ID_FALL;
            const canDuck = availableActions & ACTION_ID_DUCK;
            const canLightAttack = availableActions & ACTION_ID_ATTACK_LIGHT;
            const canHeavyAttack = availableActions & ACTION_ID_ATTACK_HEAVY;

            const right = inputRead(INPUT_RIGHT);
            const left = inputRead(INPUT_LEFT);
            const up = canJump && probablyOnGround && inputRead(INPUT_UP, now);
            const down = inputRead(INPUT_DOWN);
            const rotateCameraRight = inputRead(INPUT_ROTATE_CAMERA_RIGHT, now);
            const rotateCameraLeft = inputRead(INPUT_ROTATE_CAMERA_LEFT, now);
            const lightAttack = inputRead(INPUT_ATTACK_LIGHT, now);
            const heavyAttack = inputRead(INPUT_ATTACK_HEAVY, now);

            let running = 0;
            let interact = 0;
            // running and interact share keys, so we want to avoid collisions
            if (down) {
              interact = inputRead(INPUT_INTERACT, now);
            } else {
              running = inputRead(INPUT_RUN, now, 1);
            }
            
            if (rotateCameraRight) {
              targetCameraOrientation = mathSafeMod(targetCameraOrientation - 1, 4) as Orientation;
            }
            if (rotateCameraLeft) {
              targetCameraOrientation = ((targetCameraOrientation + 1) % 4) as Orientation;
            }

            const playerVelocity = canWalk ? (right - left) * (1 + (canRun ? running : 0)) / 999 : 0;
            if (canIdle) {
              action = ACTION_ID_IDLE;
            }
            if (canWalk && (left || right) && probablyOnGround) {
              action = ACTION_ID_WALK;
            }
            if (canRun && up && probablyOnGround) {
              action = ACTION_ID_RUN;
            }
            if (canJump && up && probablyOnGround) {
              action = ACTION_ID_JUMP;
              entity.velocity[2] += .003;
            }
            if (canDuck && down && probablyOnGround) {
              action = ACTION_ID_DUCK;
            }
            if (canFall && !probablyOnGround) {
              action = ACTION_ID_FALL;
            }
            if (canLightAttack && lightAttack) {
              action = ACTION_ID_ATTACK_LIGHT;
            }
            if (canHeavyAttack && heavyAttack) {
              action = ACTION_ID_ATTACK_HEAVY;
            }
            if (interact) {
              // find any entities we might be able to pick up
              let pickedUp: Entity | undefined;
              levelIterateEntitiesInBounds(level, entity.position, entity.dimensions, found => {
                // NOTE: while 0 is a valid part id, we assume it's not used for extremities
                if (found.body.jointAttachmentHolderPartId) {
                  // TODO get the closest one
                  pickedUp = found;
                }
              });
              // drop whatever we are carrying
              const joint = entity.joints.find(
                  (joint, partId) => joint.attachedEntity && (!pickedUp || partId == pickedUp.body.jointAttachmentHolderPartId),
              );
              if (joint) {
                // add the attached entity back into the world
                const held = joint.attachedEntity as Entity;
                held.position = entity.position.map(
                    (v, i) => v + (entity.dimensions[i] - held.dimensions[i])/2,
                ) as Vector3;
                held.rotation = [...entity.rotation];
                held.velocity = [0, 0, 0];
                levelAddEntity(level, held);
                joint.attachedEntity = 0;
              }
              if (pickedUp) {
                levelRemoveEntity(level, pickedUp);
                entity.joints[pickedUp.body.jointAttachmentHolderPartId].attachedEntity = pickedUp;
              }
            }
            if (definitelyOnGround) {
              entity.velocity = vector3TransformMatrix4(
                  matrix4Rotate(-targetCameraZRotation, 0, 0, 1),
                  playerVelocity,
                  0,
                  entity.velocity[2],
              );
            }
            const cameraDelta = entity.orientation % 2 - targetCameraOrientation % 2
            if ((
                cameraDelta
                    || entity.orientation == targetCameraOrientation && left
                    || (entity.orientation + 2) % 4 == targetCameraOrientation && right
                )
                && canTurn
            ) {
              entity.orientation =left || cameraDelta && entity.lastCameraOrientation != entity.orientation
                      ? (targetCameraOrientation + 2) % 4 as Orientation
                      : targetCameraOrientation;
              entity.lastCameraOrientation = targetCameraOrientation;
              const targetAngle = -entity.orientation * Math.PI/2;
              const to: Vector3 = [0, 0, targetAngle];
              entity.anim = animLerp(
                  worldTime,
                  player.rotation,
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
          movable.velocity[2] -= delta * GRAVITY;
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
                (v, i) => v + Math.abs(targetPosition[i] - entity.position[i]),
            ) as Vector3;

            let maxOverlapDelta = 0;
            let maxCollisionEntity: Entity | Falsey;
            maxOverlapIndex = -1;
            levelIterateEntitiesInBounds(level, maximalPosition, maximalDimensions, collisionEntity => {
              // no need to check for ourselves since we have been removed from the level at this point
              if (!(collisionEntity.collisionGroup & entity.collisionMask)) {
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
                  console.log('previous position', entity['previousPosition']);
                  console.log('previous velocity', entity['previousVelocity']);
                  console.log('previous move delta', entity['previousMoveDelta']);
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
            entity['previousPosition'] = entity.position;
            entity['previousVelocity'] = entity.velocity;
            entity['previousMoveDelta'] = moveDelta;
            entity['previousCollisions'] = collisions;
            entity['previousMaximalPosition'] = maximalPosition;
            entity['previousMaximalDimensions'] = maximalDimensions;
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
          const bodyAnimations: EntityBodyAnimation<number> = action && entity.joints?.reduce<Falsey | EntityBodyAnimation<number>>(
              (acc, joint) => acc || joint.attachedEntity && joint.attachedEntity.body.jointAttachmentHolderAnims?.[action],
              0,
          ) || entity.body.anims?.[action];
          if (bodyAnimations) {
            // find the index with the smallest move time
            const [bestAnimationDuration, bestAnimationIndex] = bodyAnimations.sequences.reduce((acc, bodyAnimation, i) => {
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
            
            const bodyAnimation = bodyAnimations.sequences[bestAnimationIndex];
            const animFrameDurations = entity.joints.reduce<number[]>((acc, joint, jointId) => {
              const bodyJointAnimation = bodyAnimation[jointId];
              let prev = joint.rotation;
              return bodyJointAnimation?.[0].reduce((acc, rotation, index) => {
                const deltaRotation = animDeltaRotation(prev, rotation);
                const minDuration = deltaRotation / bodyAnimations.maxSpeed;
                if (index < acc.length) {
                  acc[index] = Math.max(minDuration, acc[index]);
                } else {
                  acc.push(minDuration);
                }
                prev = rotation;
                return acc;
              }, acc) || acc;
            }, []);

            entity.offset = entity.offset || [0, 0, 0];
            
            if (entity.offset?.some((v, i) => Math.abs(v - (bodyAnimations.translate?.[i] || 0)) < EPSILON)) {
              const totalDuration = animFrameDurations.reduce((acc, v) => acc + v, 0);
              entity.offsetAnim = animLerp(
                  worldTime,
                  entity.offset,
                  bodyAnimations.translate || [0, 0, 0],
                  totalDuration,
                  EASE_OUT_QUAD,
              );
            }

            entity.joints.forEach((joint, jointId) => {
              const bodyJointAnimation = bodyAnimation[jointId];
              const defaultBodyJointRotation = entity.body.defaultJointRotations?.[jointId];
              if (joint.animAction != action && bodyJointAnimation
                  || defaultBodyJointRotation && !joint.animAction) {
                const easing = bodyJointAnimation?.[2] || EASE_LINEAR;
                const anim = bodyJointAnimation
                    ? animComposite(...bodyJointAnimation[0].map((rotation, index) => {
                      // TODO use max speed correctly
                      //const duration = 1/bodyAnimations.maxSpeed;
                      const duration = animFrameDurations[index];
                      return now => animLerp(now, joint.rotation, rotation, duration, easing);
                    }))
                    // TODO use overall speed of the animation
                    : animLerp(worldTime, joint.rotation, defaultBodyJointRotation, 100, easing);
                joint.anim = anim;
                joint.animAction = action;
                joint.animActionIndex = bestAnimationIndex;
              }
            })
          }

          levelAddEntity(level, entity);
        }

        const entityMidpoint = entity.position.map((v, i) => v + entity.dimensions[i]/2) as Vector3;
        // do we need to render?
        const [cx, cy, cz] = vector3TransformMatrix4(cameraRenderCutoffTransform, ...entityMidpoint);
        const shouldRender = (cy > 0 || cz < 0) || entity.joints?.some(j => j.light); 
        if (shouldRender) {
          entityIterateParts(
            (part, transform, joint) => {
              if (joint?.light) {
                const position = vector3TransformMatrix4(transform, 0, 0, 0);
                previousLights.push([...position, joint.light]);
              }
              if (cy > 0 || cz < 0) {
                const [vao, count] = models[part.modelId];
                gl.uniformMatrix4fv(uniformModelViewMatrix, false, transform);
                gl.uniform1f(uniformModelAttributes, joint?.light || 0);
                gl.bindVertexArray(vao);
                gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
              }
            },
            entity.body,
            entity.joints,
            matrix4Multiply(
                matrix4Translate(...(entity.dimensions.map(
                    (v, i) => v/2 + entity.position[i] + (entity.offset?.[i] || 0)) as Vector3),
                ),
                matrix4RotateInOrder(...entity.rotation),
            ),
          );
        }
      },
  );

  requestAnimationFrame(update);
};
update(0);
