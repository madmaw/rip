///<reference path="bodies/clubs.ts"/>
///<reference path="bodies/steps.ts"/>
///<reference path="bodies/skeleton.ts"/>
///<reference path="bodies/torch.ts"/>
///<reference path="bodies/wall.ts"/>
///<reference path="level/entity.ts"/>
///<reference path="level/level.ts"/>
///<reference path="math/math.ts"/>
///<reference path="math/matrix.ts"/>
///<reference path="math/shape.ts"/>
///<reference path="textures/textures.ts"/>
///<reference path="util/arrays.ts"/>
///<reference path="constants.ts"/>
///<reference path="flags.ts"/>
///<reference path="inputs.ts"/>
///<reference path="webgl.ts"/>


const A_VERTEX_POSIITON = 'aVertexPosition';
const A_VERTEX_NORMAL = 'aVertexNormal';
const A_TEXTURE_POSITION = 'aTexturePosition';

const ATTRIBUTES = [
  A_VERTEX_POSIITON,
  A_VERTEX_NORMAL,
  A_TEXTURE_POSITION,
];

const U_MODEL_VIEW_MATRIX = 'uModelViewMatrix';
// inverting in the shader has performance issues
const U_MODEL_VIEW_MATRIX_INVERSE = 'uModelViewMatrixInverse';
const U_MODEL_ATTRIBUTES = 'uModelAttributes';
const U_PROJECTION_MATRIX = 'uProjectionMatrix';
const U_CAMERA_POSITION = 'uCameraPosition';
const U_LIGHT_POSITIONS = 'uLightPositions';
const U_LIGHT_TEXTURES = 'uLightTextures';
const U_TEXTURE_COLORS = 'uTextureColors';
const U_TEXTURE_NORMALS = 'uTextureNormals';

const UNIFORMS = [
  U_MODEL_VIEW_MATRIX,
  U_MODEL_VIEW_MATRIX_INVERSE,
  U_MODEL_ATTRIBUTES,
  U_PROJECTION_MATRIX,
  U_CAMERA_POSITION,
  U_LIGHT_POSITIONS,
  U_LIGHT_TEXTURES,
  U_TEXTURE_COLORS,
  U_TEXTURE_NORMALS,
];

const V_POSITION = 'vPosition';
const V_NORMAL = 'vNormal';
const V_MODEL_POSITION = 'vModelPosition';
const V_MODEL_NORMAL = 'vModelNormal';
const V_TEXTURE_POSITION = 'vTextureCoords';

const VERTEX_SHADER = `#version 300 es
  precision lowp float;

  uniform mat4 ${U_MODEL_VIEW_MATRIX};
  uniform mat4 ${U_PROJECTION_MATRIX};

  in vec4 ${A_VERTEX_POSIITON};
  in vec3 ${A_VERTEX_NORMAL};
  in vec3 ${A_TEXTURE_POSITION};
  out vec3 ${V_POSITION};
  out vec3 ${V_MODEL_POSITION};
  out vec3 ${V_NORMAL};
  out vec3 ${V_MODEL_NORMAL};

  out vec3 ${V_TEXTURE_POSITION};

  void main() {
    ${V_MODEL_POSITION} = ${A_VERTEX_POSIITON}.xyz;
    ${V_TEXTURE_POSITION} = ${A_TEXTURE_POSITION};
    vec4 position = ${U_MODEL_VIEW_MATRIX} * ${A_VERTEX_POSIITON};
    ${V_POSITION} = position.xyz;
    ${V_NORMAL} = normalize(
        ${U_MODEL_VIEW_MATRIX} * vec4(${A_VERTEX_NORMAL}, 1.)
        - ${U_MODEL_VIEW_MATRIX} * vec4(vec3(0.), 1.)
    ).xyz;
    ${V_MODEL_NORMAL} = ${A_VERTEX_NORMAL};
    gl_Position = ${U_PROJECTION_MATRIX} * position;
  }
`;

const OUT_RESULT = 'result';

const FRAGMENT_SHADER = `#version 300 es
  precision lowp float;
  precision lowp sampler3D;

  uniform mat4 ${U_MODEL_VIEW_MATRIX};
  uniform mat4 ${U_MODEL_VIEW_MATRIX_INVERSE};
  uniform vec3 ${U_CAMERA_POSITION};
  uniform vec4 ${U_LIGHT_POSITIONS}[${MAX_LIGHTS}];
  uniform ivec2 ${U_MODEL_ATTRIBUTES};
  uniform samplerCube ${U_LIGHT_TEXTURES}[${MAX_LIGHTS}];
  uniform sampler3D ${U_TEXTURE_COLORS};
  uniform sampler3D ${U_TEXTURE_NORMALS};

  in vec3 ${V_POSITION};
  in vec3 ${V_MODEL_POSITION};
  in vec3 ${V_NORMAL};
  in vec3 ${V_MODEL_NORMAL};
  in vec3 ${V_TEXTURE_POSITION};
  out vec4 ${OUT_RESULT};

  vec3 tx(vec3 p) {
    return (vec3(float(${U_MODEL_ATTRIBUTES}.y), 0., 0.) + clamp(p, vec3(-.5), vec3(.5)) * vec3(${TEXTURE_SIZE/TEXTURE_SIZE_PLUS_2}, 1., 1.) + .5)
        / vec3(${TEXTURE_FACTORIES.length}., 1., 1.);
  }

  void main() {
    vec3 cameraDelta = ${V_POSITION} - ${U_CAMERA_POSITION};
    float textureScale = length(${V_MODEL_POSITION})/length(${V_TEXTURE_POSITION});
    vec3 modelCameraNormal = normalize(
        ${U_MODEL_VIEW_MATRIX_INVERSE} * vec4(cameraDelta, 1.) -
        ${U_MODEL_VIEW_MATRIX_INVERSE} * vec4(vec3(0.), 1.)
    ).xyz;
    vec3 scaleVector = normalize(vec3(abs(${V_MODEL_NORMAL}).x, abs(${V_MODEL_NORMAL}.y), abs(${V_MODEL_NORMAL}.z)));
    //vec3 textureCameraNormal = normalize(modelCameraNormal + modelCameraNormal * scaleVector / textureScale);
    vec3 textureCameraNormal = modelCameraNormal;
    
    float textureDelta = 0.;
    vec3 texturePosition = ${V_TEXTURE_POSITION};
    vec4 textureNormal = texture(${U_TEXTURE_NORMALS}, tx(texturePosition));
    vec3 position = ${V_POSITION};
    vec3 normal = normalize(${V_NORMAL});

    if (textureNormal.w < ${TEXTURE_ALPHA_THRESHOLD}) {
      // maximum extent should be 1,1,1, which gives a max len of sqrt(3)
      bool foundTexture = false;
      float minTextureDelta = 0.;
      for (int i=0; i<${TEXTURE_LOOP_STEPS}; i++) {
        float test = foundTexture
            ? (textureDelta + minTextureDelta)/2.
            : textureDelta + ${TEXTURE_LOOP_STEP_SIZE};
        texturePosition = ${V_TEXTURE_POSITION} + textureCameraNormal * test;
        textureNormal = texture(${U_TEXTURE_NORMALS}, tx(texturePosition));
        if (
            textureNormal.w > ${TEXTURE_ALPHA_THRESHOLD}
        ) {
          foundTexture = true;
          textureDelta = test;
        } else {
          if (foundTexture) {
            minTextureDelta = test;
          } else {
            textureDelta = test;
          }
        }  
      }
      texturePosition = ${V_TEXTURE_POSITION} + textureCameraNormal * textureDelta;
      textureNormal = texture(${U_TEXTURE_NORMALS}, tx(texturePosition));
      vec3 modelPosition = ${V_MODEL_POSITION} + modelCameraNormal * textureDelta;
      if (textureNormal.w < ${TEXTURE_ALPHA_THRESHOLD}
          // || abs(modelPosition.x) > .5
          // || abs(modelPosition.y) > .5
          // || abs(modelPosition.z) > .5
      ) {
        discard;
      }
      position = (${U_MODEL_VIEW_MATRIX} * vec4(modelPosition, 1.)).xyz;
      normal = normalize(
          abs(texturePosition.x) < .5 && abs(texturePosition.y) < .5 && abs(texturePosition.z) < .5
              ? (
                  ${U_MODEL_VIEW_MATRIX} * vec4(textureNormal.xyz * 2. - 1., 1.)
                  - ${U_MODEL_VIEW_MATRIX} * vec4(vec3(0.), 1.)
              ).xyz
              : ${V_NORMAL}
      );
    }

    float depth = textureDelta * dot(normalize(${V_NORMAL}), normalize(cameraDelta));
    vec4 color = texture(${U_TEXTURE_COLORS}, tx(texturePosition));
    // color = vec4((normal + 1.) / 2., length(normal));
    // if (textureNormal.w < ${TEXTURE_ALPHA_THRESHOLD}) {
    //   color = vec4(vec3(textureDelta, 0., 0.), 1.);
    // }
    // vec3 modelPosition = ${V_MODEL_POSITION} + modelCameraNormal * textureDelta;
    // if (abs(modelPosition.x) > .5
    //     || abs(modelPosition.y) > .5
    //     || abs(modelPosition.z) > .5
    // ) {
    //   color = vec4(vec3(0, 0., 1.), 1.);
    // }


    //position = ${V_POSITION};
    //position = (${U_MODEL_VIEW_MATRIX} * vec4(${V_TEXTURE_POSITION}, 1.)).xyz;
    //color = vec4(position / 3., 1.);
    //color = vec4(${V_MODEL_POSITION} + modelCameraNormal * textureDelta + .5, 1.);
    //color = vec4(vec3(.5 + textureDelta * 2.), 1.);
    //color = vec4(texturePosition + .5, 0.);


    vec3 lightColor = vec3(
        color.w > .5
            ? (color.w -.5) * 2.
            : 0.
    );
    for (int i = ${MAX_LIGHTS}; i > 0;) {
      i--;
      if (${U_LIGHT_POSITIONS}[i].w > 0. || i == 0) {
        vec3 delta = position - ${U_LIGHT_POSITIONS}[i].xyz;
        vec3 deltan = normalize(delta);
        vec3 pn = normalize(
            abs(deltan.x) > abs(deltan.y) && abs(deltan.x) > abs(deltan.z)
                ? vec3(deltan.x, 0, 0)
                : abs(deltan.y) > abs(deltan.z)
                    ? vec3(0, deltan.y, 0)
                    : vec3(0, 0, deltan.z)
        );
        float n = dot(normal, deltan);
        //color = vec4(vec3(length(delta)/4.), 1.);
        // cannot index into samplers!
        vec4 tex = i == 0
            ? texture(${U_LIGHT_TEXTURES}[0], deltan)
            : i == 1
                ? texture(${U_LIGHT_TEXTURES}[1], deltan)
                : i == 2
                    ? texture(${U_LIGHT_TEXTURES}[2], deltan)
                    : texture(${U_LIGHT_TEXTURES}[3], deltan);
        // vec4 tex = texture(${U_LIGHT_TEXTURES}[0], deltan);
    
        float d = 2. * ${CUBE_MAP_PERPSECTIVE_Z_NEAR} * ${CUBE_MAP_PERPSECTIVE_Z_FAR}.
            / ((${CUBE_MAP_PERPSECTIVE_Z_FAR}. + ${CUBE_MAP_PERPSECTIVE_Z_NEAR} - (2. * tex.x - 1.)
                * (${CUBE_MAP_PERPSECTIVE_Z_FAR}. - ${CUBE_MAP_PERPSECTIVE_Z_NEAR})
            ) * dot(deltan, pn))
            // ensure bumps are not in shadow
            + depth * 2. * textureScale / dot(normalize(${V_NORMAL}), deltan);
        // TODO distance in bias seems wrong
        float bias = pow(d, 2.) * (2. - pow(n, 6.))/${CUBE_MAP_PERPSECTIVE_Z_FAR}.;
        float light = mix(
            max(0., -n),
            1.,
            pow(max(0., (${MIN_LIGHT_THROW_C} - length(delta))*${U_LIGHT_POSITIONS}[i].w), 2.)
        )
        * ${U_LIGHT_POSITIONS}[i].w
        * (1. - pow(1. - max(0., ${MAX_LIGHT_THROW_C}*${U_LIGHT_POSITIONS}[i].w - length(delta))/${MAX_LIGHT_THROW_C}, 2.));
        // * pow(max(0., ${MAX_LIGHT_THROW_C}*${U_LIGHT_POSITIONS}[i].w - length(delta))/${MAX_LIGHT_THROW_C}, 2.);
        if (length(delta) < d + bias && n < 0. || length(delta) < d) {
          lightColor += light * (i == 0 ? vec3(.3, 1., .5) : mix(vec3(1., .4, .1), vec3(1., 1., .8), light));
        } else if (i == 0){
          lightColor = vec3(0.);
        }
        //l = depth;z
      }
    }
    ${OUT_RESULT} = vec4(pow(color.xyz * lightColor, vec3(.45)), 1.);
  }
`;

const gl = Z.getContext('webgl2'/* , {antialias: false}*/);
if (FLAG_SHOW_GL_ERRORS && gl == null) {
  throw new Error('no webgl2');
}
const vertexShader = loadShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

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
  attributeTexturePosition,
] = ATTRIBUTES.map(attribute => gl.getAttribLocation(program, attribute));

const [
  uniformModelViewMatrix,
  uniformModelViewMatrixInverse,
  uniformModelAttributes,
  uniformProjectionMatrix,
  uniformCameraPosition,
  uniformLightPositions,
  uniformLightTexures,
  uniformTextureColors,
  uniformTextureNormals,
] = UNIFORMS.map(uniform => gl.getUniformLocation(program, uniform));

gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.clearColor(0, 0, 0, 1);

// create the color/normal textures
const textureData = texture3D.flat(2);
const [colorTexture, normalTexture] = [uniformTextureColors, uniformTextureNormals].map((uniform, i) => {
  const data = textureData.flatMap(v => v[i]);
  const texture = gl.createTexture();
  const textureIndex = TEXTURE_COLOR_INDEX + i;
  gl.activeTexture(gl.TEXTURE0 + textureIndex);
  gl.bindTexture(gl.TEXTURE_3D, texture);
  // TODO how much of this can we get away without?
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0);
  // TODO hard code log2 result
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, Math.log2(TEXTURE_SIZE));
  // defaults
  // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  if (FLAG_TEXTURE_SCALE_NEAREST) {
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);  
  }

  if (FLAG_TEXTURE_CLAMP_TO_EDGE) {
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);  
  }

  gl.texImage3D(
      gl.TEXTURE_3D,
      0,
      gl.RGBA,
      TEXTURE_SIZE_PLUS_2 * TEXTURE_FACTORIES.length,
      TEXTURE_SIZE,
      TEXTURE_SIZE,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array(data),
  )
  gl.generateMipmap(gl.TEXTURE_3D);

  gl.uniform1i(uniform, textureIndex);
});

// create the lighting textures
const cubeTextures = new Array(MAX_LIGHTS+1).fill(0).map((_, i) => {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + i);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  CUBE_MAP_ROTATION_TRANSFORMS.forEach((_, j) => {
    gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + j,
        0,
        gl.DEPTH_COMPONENT16,
        CUBE_MAP_DIMENSION,
        CUBE_MAP_DIMENSION,
        0,
        gl.DEPTH_COMPONENT,
        gl.UNSIGNED_SHORT,
        null,
    );
    // gl.texImage2D(
    //     gl.TEXTURE_CUBE_MAP_POSITIVE_X + j,
    //     0,
    //     gl.RGBA,
    //     CUBE_MAP_DIMENSION,
    //     CUBE_MAP_DIMENSION,
    //     0,
    //     gl.RGBA,
    //     gl.UNSIGNED_BYTE,
    //     null,
    // );
    // const canvas = document.createElement('canvas');
    // canvas.width = CUBE_MAP_DIMENSION;
    // canvas.height = CUBE_MAP_DIMENSION;
    // const ctx = canvas.getContext('2d');
    // ctx.fillStyle = ['red', 'green', 'blue', 'yellow', 'cyan', 'purple'][j];
    // ctx.fillRect(0, 0, CUBE_MAP_DIMENSION, CUBE_MAP_DIMENSION);
    // gl.texImage2D(
    //     gl.TEXTURE_CUBE_MAP_POSITIVE_X+j,
    //     0,
    //     gl.RGBA,
    //     gl.RGBA,
    //     gl.UNSIGNED_BYTE,
    //     canvas,
    // );
  });
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  return texture;
});

const visionFramebuffer = gl.createFramebuffer();

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
  SHAPE_SKELETON_HAND,
  SHAPE_SKELETON_FOOT,
  ...SHAPES_CLUBS,
  SHAPE_TORCH_HANDLE,
  SHAPE_TORCH_HEAD,
];
// VAO, index count, radius
const models: readonly [WebGLVertexArrayObject, number, number][] = shapes.map((shape, shapeId) => {
  const vertexPositionsToSmoothNormals: Record<string, Vector3[]> = {};
  const rounded = shapeId > 5;
  const [positions, hardNormals, texturePositions, indices, radius] = shape.reduce<[Vector3[], Vector3[], Vector3[], number[], number]>(
      ([positions, normals, texturePositions, indices, maxRadius], face) => {
        const points = face.perimeter.map(({ firstOutgoingIntersection }) => firstOutgoingIntersection);
        const surfaceIndices = face.perimeter.slice(2).flatMap(
            (_, i) => [positions.length, positions.length + i + 1, positions.length + i + 2]
        );
        indices.push(...surfaceIndices);
        const vertexPositions = points.map(p =>
            vectorNToPrecision(
                vector3TransformMatrix4(face.transformFromCoordinateSpace, ...p, 0),
            ),
        );
        positions.push(...vertexPositions);
        maxRadius = vertexPositions.reduce((acc, v) => Math.max(acc, vectorNLength(v)), maxRadius);
        //texturePositions.push(...vertexPositions);
        texturePositions.push(...vertexPositions.map(p => {
          if (FLAG_SMOOTH_NORMALS) {
            const key = JSON.stringify(p);
            const normals = vertexPositionsToSmoothNormals[key] || (vertexPositionsToSmoothNormals[key] = []);
            normals.push(face.plane.normal);  
          }
          const divisor = Math.abs(p[0]) > Math.abs(p[1]) && Math.abs(p[0]) > Math.abs(p[2])
              ? p[0]
              : Math.abs(p[1]) > Math.abs(p[2])
                  ? p[1]
                  : p[2] || 1;
            return p.map(v => rounded ? v * .5/Math.abs(divisor) : v*.5/Math.abs(v)) as Vector3;
          }));
        
        normals.push(
            ...new Array<Vector3>(points.length).fill(face.plane.normal),
        )
        return [positions, normals, texturePositions, indices, maxRadius];
      },
      [[], [], [], [], 0],
  );
  const normals = FLAG_SMOOTH_NORMALS && rounded
      ? positions.map(p => {
        const key = JSON.stringify(p);
        const normals = vertexPositionsToSmoothNormals[key];
        return vectorNNormalize(
            normals.reduce((acc, n) => vectorNAdd(acc, n), [0, 0, 0] as Vector3,
        ));
      })
      : hardNormals;
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  ([
    [attributeVertexPosition, positions],
    [attributeVertexNormal, normals],
    [attributeTexturePosition, texturePositions],
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

  return [vao, indices.length, radius];
});

const startX = 4;
const startY = 4;
const level = levelCreate(9, 9);
levelAppendLayers(level, 3, startX, startY);

// TODO enemy pathing
//levelPopulateGraph(level);

// torch
// for (let i=0; i<MAX_LIGHTS; i++) {
//   const t = matrix4Translate(Math.random() * 9, Math.random() * 9, 5);
//   const [position, dimensions] = shapeBounds(shapes[MODEL_TORCH_HANDLE], t, 1);
//   const torch: Entity<TorchPartId> = entityCreate({
//     body: PART_TORCH,
//     position,
//     dimensions,
//     collisionGroup: COLLISION_GROUP_ITEM,
//     collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_ITEM,
//     rotation: [0, 0, 0],
//     velocity: [0, 0, 0],
//     joints: [{
//       rotation: [0, 0, 0],
//     }, {
//       rotation: [0, 0, 0],
//       light: .3,
//     }]
//   });
//   levelAddEntity(level, torch);  
// }

// and a player
const player: Entity<SkeletonPartId> = entityCreate({
  position: [startX + .5 - SKELETON_DIMENSION/2, startY + .5 - SKELETON_DIMENSION/2, 1.1],
  dimensions: [SKELETON_DIMENSION, SKELETON_DIMENSION, SKELETON_DEPTH],
  orientation: ORIENTATION_EAST,
  body: PART_SKELETON_BODY,
  entityType: ENTITY_TYPE_PLAYER,
  acc: .005,
  velocity: [0, 0, 0],
  rotation: [0, 0, 0],
  health: 30,
  collisionGroup: COLLISION_GROUP_MONSTER,
  collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_MONSTER,
});
player.joints[SKELETON_PART_ID_HEAD].light = .2;
levelAddEntity(level, player);

// for (let i=0; i<3; i++ ) {
//   const enemy: Entity<SkeletonPartId> = entityCreate({
//     position: [Math.random() * level.dimensions[0], Math.random() * level.dimensions[1], 4],
//     dimensions: [SKELETON_DIMENSION, SKELETON_DIMENSION, SKELETON_DEPTH],
//     orientation: ORIENTATION_EAST,
//     body: PART_SKELETON_BODY,
//     entityType: ENTITY_TYPE_HOSTILE,
//     acc: .005,
//     velocity: [0, 0, 0],
//     rotation: [0, 0, 0],
//     health: 3,
//     collisionGroup: COLLISION_GROUP_MONSTER,
//     collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_MONSTER,
//     activeTarget: player,
//   });
//   enemy.joints[SKELETON_PART_ID_HEAD].light = .12;
//   levelAddEntity(level, enemy);
// }

const baseCameraRotation = matrix4Rotate(-Math.PI/2.5, 1, 0, 0);
let cameraOffset = FLAG_ALLOW_ZOOM ? 4 : 2;
let cameraOffsetTransform: Matrix4;
let projection: Matrix4;
const resizeCanvas = () => {
  const aspectRatio = innerWidth / innerHeight;
  if (!TARGET_HORIZONTAL_RESOLUTION || !TARGET_VERTICAL_RESOLUTION) {
    Z.width = innerWidth;
    Z.height = innerHeight;  
  } else {
    Z.width = Math.max(TARGET_HORIZONTAL_RESOLUTION, TARGET_VERTICAL_RESOLUTION * aspectRatio)
    Z.height = Math.max(TARGET_VERTICAL_RESOLUTION, TARGET_HORIZONTAL_RESOLUTION / aspectRatio);
  }
  //projection = matrix4Multiply(matrix4InfinitePerspective(.8, Z.width/Z.height, .1), baseCameraRotation);
  projection = matrix4Multiply(matrix4Perspective(.8, aspectRatio, .1, 99), baseCameraRotation);
}
resizeCanvas();
onresize = resizeCanvas;
if (FLAG_ALLOW_ZOOM) {
  const zoom = (e?: WheelEvent) => {
    cameraOffset = Math.min(6, Math.max(1, cameraOffset + (e?.deltaY || 0)/99));
    cameraOffsetTransform = matrix4Translate(0, Math.pow(2, cameraOffset)/8, -cameraOffset/8);
  };
  onwheel = zoom;
  zoom();  
} else {
  cameraOffsetTransform = matrix4Translate(0, cameraOffset, -.5);
}

if (FLAG_SPAWN_WEAPONS_ON_CLICK) {
  onclick = () => {
    // club
    const clubBody = PARTS_CLUBS[Math.random() * PARTS_CLUBS.length | 0];
    //const clubBody = PARTS_CLUBS[0];
    const clubShape = shapes[clubBody.modelId];
    const t = matrix4Multiply(
        matrix4Translate(
            player.position[0] + Math.random() - .5,
            player.position[1] + Math.random() - .5,
            player.position[2] + 1,
        ),
    );
    const [position, dimensions] = shapeBounds(clubShape, t, 1);
    const club: Entity<ClubPartId> = entityCreate({
      body: clubBody,
      dimensions,
      position,
      rotation: [0, 0, Math.PI * 2 * Math.random()],
      velocity: [0, 0, 0],
      health: 3,
      collisionGroup: COLLISION_GROUP_ITEM,
      collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_ITEM,
    });
    levelAddEntity(level, club);
  };
}
// NOTE that camera orientation is not exactly the same as camera rotation
// the relationship (I think) is camera rotation = (1 - cameraOrientation) * Math.PI/2
let targetCameraOrientation: Orientation = player.orientation;
let cameraZRotation = 0;

let then = 0;
let worldTime = 0;
let updateCount = 0;
let previousLights: Light[] = [];
let previousPreviousLights: Light[] = [];
const getLightAppeal = (light: Light, playerMidPoint: Vector3): number => {
  // always have player light first
  // prioritise brighter lights
  // prioritise already visible lights to avoid flicker
  return light.entityId == player.id
      ? 0
      : vectorNLength(vectorNSubtract(playerMidPoint, light.pos))
          / (light.luminosity * Math.min(previousPreviousLights.findIndex(l => l.entityId == light.entityId))+2, 2)
}

const lightRenders: Record<EntityId, [number, number, Vector3]> = {};

const update = (now: number) => {
  const delta = Math.min(now - then, MAX_MILLISECONDS_PER_FRAME);
  worldTime += delta;
  then = now;
  updateCount++;

  if (FLAG_SHOW_FPS && fps) {
    fps.innerText = `${Math.floor(updateCount*1000/worldTime)} FPS`;
  }

  const playerMidPoint = player.position.map((v, i) => v + player.dimensions[i]/2) as Vector3;
  const targetCameraZRotation = (-targetCameraOrientation) * Math.PI/2;
  const cameraZDelta = mathAngleDiff(cameraZRotation, targetCameraZRotation);
  // TODO can we tween this?
  cameraZRotation += cameraZDelta * delta / 100;
  const cameraRotation = matrix4Rotate(cameraZRotation, 0, 0, 1);
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
  const cameraProjectionMatrix = matrix4Multiply(projection, cameraPositionMatrix);

  // sort from closest to furthest, with player at 0
  previousLights
      .sort((l1, l2) => {
        const d1 = getLightAppeal(l1, playerMidPoint);
        const d2 = getLightAppeal(l2, playerMidPoint);
        return d1 - d2;
      });
  // find the oldest texture
  let light: Light | undefined;
  const lightRender: [number, number, number, Vector3] | 0 = previousLights.length > 0
      && (
          !FLAG_THROTTLE_LIGHT_RENDERING
              || !(updateCount % Math.max(1, MAX_LIGHTS - Math.min(previousLights.length, MAX_LIGHTS)))
      )
      && previousLights.slice(0, MAX_LIGHTS).reduce<[number, number, number, Vector3] | 0>((acc, l, i) => {
        const lightRender = lightRenders[l.entityId];
        // find an unused texture
        let availableTextureIndex = 0;
        // there is no accumulator or the accumulator age is > 0
        const needsNewLightRender = !lightRender && (!acc || acc[2]);
        if (needsNewLightRender) {
          const availableTextureIndices = new Set(CUBE_MAP_LIGHTS_TEXTURE_INDICES);
          let oldestEntityId: string | undefined;
          for (let entityId in lightRenders) {
            const lightRender = lightRenders[entityId];
            availableTextureIndices.delete(lightRender[0]);
            if (!oldestEntityId || lightRender[1] < lightRenders[oldestEntityId][1]) {
              // TODO we may also want to verify that this isn't one of the first lights, although
              // I think being the oldest will functionally do that in 99% of cases
              oldestEntityId = entityId;
            }
          }
          if (availableTextureIndices.size) {
            availableTextureIndex = [...availableTextureIndices][0];
          } else {
            availableTextureIndex = lightRenders[oldestEntityId][0];
            delete lightRenders[oldestEntityId];
          }
        }
        return needsNewLightRender
            ? [i, availableTextureIndex, 0, l.pos]
            : !lightRender || acc && lightRender[1] > acc[2]
                ? acc
                : [i, ...lightRender];
      }, 0);
  
  if (lightRender) {
    const [lightIndex, targetLightTextureIndex] = lightRender;
    light = previousLights[lightIndex];
    lightRenders[light.entityId] = [targetLightTextureIndex, worldTime, light.pos];
    // generate light cube map
    gl.activeTexture(gl.TEXTURE0 + targetLightTextureIndex);
    gl.bindFramebuffer(gl.FRAMEBUFFER, visionFramebuffer);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTextures[targetLightTextureIndex]);
    gl.viewport(0, 0, CUBE_MAP_DIMENSION, CUBE_MAP_DIMENSION);
    // set lights to empty texture to avoid output being an input texture
    gl.uniform1iv(uniformLightTexures, CUBE_MAP_LIGHT_TEXTURE_FAKE_INDICES);
    gl.uniform4fv(uniformLightPositions, CUBE_MAP_LIGHTS_FAKE);

    CUBE_MAP_ROTATION_TRANSFORMS.forEach((rotationTransform, i) => {
      // write to the cube map
      gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.DEPTH_ATTACHMENT,
          gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
          cubeTextures[targetLightTextureIndex],
          0,
      );
  
      // gl.framebufferTexture2D(
      //     gl.FRAMEBUFFER,
      //     gl.COLOR_ATTACHMENT0,
      //     gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
      //     visionTexture,
      //     0,
      // );
  
      const faceCameraTransform = matrix4Multiply(
          CUBE_MAP_PERPSECTIVE_TRANSFORM,
          rotationTransform,
          matrix4Translate(...vectorNScale(light.pos, -1)),
      );
      const [lightBoundsPosition, lightBoundsDimensions] = lightIndex
          ? [
            light.pos.map(v => v - light.luminosity * MAX_LIGHT_THROW) as Vector3,
            new Array(3).fill(light.luminosity * 2 * MAX_LIGHT_THROW) as Vector3,
          ]
          : [[0, 0, 0] as Vector3, level.dimensions];
      updateAndRenderLevel(
          faceCameraTransform,
          light.pos,
          lightBoundsPosition,
          lightBoundsDimensions,
          [],
          // first index is the player line of sight, so it's a special case
          // for everything else, just exclude the actual lit object
          e => e.velocity && !lightIndex
              || e.id == light.entityId
              || FLAG_EXCLUDE_UNLIT_FROM_RENDER
                  && lightIndex
                  && vectorNLength(vectorNSubtract(entityMidpoint(e), light.pos)) > light.luminosity * MAX_LIGHT_THROW,
      );
    });
  }


  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, Z.width, Z.height);

//   const faceCameraTransform = matrix4Multiply(
//     CUBE_MAP_PERPSECTIVE_TRANSFORM,
//     CUBE_MAP_ROTATION_TRANSFORMS[0],
//     // TODO probably should position this a bit above player so the raised camera doesn't see hidden bits
//     matrix4Translate(...vectorNScale(playerCenter, -1)),
// );
  previousLights = previousLights
      .filter(l => lightRenders[l.entityId])
      .slice(0, MAX_LIGHTS);
  gl.uniform1iv(
      uniformLightTexures,
      previousLights.map<number>(l => {
        return lightRenders[l.entityId][0];
      }).concat(
          ...new Array(MAX_LIGHTS - previousLights.length).fill(MAX_LIGHTS),
      ),
  );

  previousPreviousLights = previousLights;
  previousLights = updateAndRenderLevel(
      cameraProjectionMatrix,
      cameraPosition,
      [0, 0, 0],
      level.dimensions,
      previousLights,
      (entity: Entity, carrier?: Entity) => {
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

        if (entity.velocity && !carrier) {
          let action: ActionId | 0 = 0;
          const availableActions = entityAvailableActions(entity);
          const definitelyOnGround = entity.lastZCollision >= worldTime - delta;
          const probablyOnGround = entity.lastZCollision > worldTime - MAX_JUMP_DELAY;
          let targetVelocity: Vector3 = definitelyOnGround ? [0, 0, entity.velocity[2]] : [...entity.velocity];
          let targetOrientation = entity.orientation;
          let interact = 0;
          const entityCenter = entityMidpoint(entity);

          levelRemoveEntity(level, entity);

          if (entity == player) {
            const canIdle = availableActions & ACTION_ID_IDLE;
            const canWalk = availableActions & ACTION_ID_WALK;
            const canRun = availableActions & ACTION_ID_RUN;
            const canJump = availableActions & ACTION_ID_JUMP;
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
            let moving = 0;
            // running and interact share keys, so we want to avoid collisions
            if (down) {
              interact = inputRead(INPUT_INTERACT, now);
            }
            if (canRun) {
              running = inputRead(INPUT_RUN, now, 1);
            }

            if (rotateCameraLeft) {
              targetCameraOrientation = mathSafeMod(targetCameraOrientation - 1, 4) as Orientation;
            }
            if (rotateCameraRight) {
              targetCameraOrientation = ((targetCameraOrientation + 1) % 4) as Orientation;
            }

            const cameraDelta = entity.orientation % 2 - targetCameraOrientation % 2
            const canTurn = availableActions & ACTION_ID_TURN && (cameraDelta || running);

            const walkingBackward = entity.orientation == targetCameraOrientation && left
                || entity.orientation != targetCameraOrientation && right;

            const targetPlayerVelocity = canWalk
                ? (right - left) * (1 + (canRun ? running : 0)) * SKELETON_WALK_SPEED / (walkingBackward ? 2 : 1)
                : 0;
            if (canIdle) {
              action = ACTION_ID_IDLE;
            }
            if (canWalk && (left || right) && probablyOnGround) {
              action = walkingBackward ? ACTION_ID_WALK_BACKWARD : ACTION_ID_WALK;
              moving = 1;
            }
            if (canRun && running && (left || right) && probablyOnGround) {
              action = ACTION_ID_RUN;
            }  

            if (canJump && up && probablyOnGround) {
              action = ACTION_ID_JUMP;
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

            if (definitelyOnGround) {
              targetVelocity = vector3TransformMatrix4(
                  matrix4Rotate(-targetCameraZRotation, 0, 0, 1),
                  targetPlayerVelocity,
                  0,
                  entity.velocity[2],
              );
            }
            if (action == ACTION_ID_JUMP) {
              targetVelocity[2] = .003;
            }

            if ((
                cameraDelta
                    || entity.orientation == targetCameraOrientation && left
                    || (entity.orientation + 2) % 4 == targetCameraOrientation && right
                )
                && canTurn
                && moving
            ) {
              targetOrientation = left
                      ? (targetCameraOrientation + 2) % 4 as Orientation
                      : targetCameraOrientation;
            }
          } else {
            action = ACTION_ID_IDLE;
            if (entity.entityType == ENTITY_TYPE_HOSTILE) {
              // AI
              
              if (!entity.activePathTime || entity.activePathTime < worldTime - AI_RECALCULATION_TIME){
                // look around
                let bestTarget: Entity;
                let bestTargetValue = 0;
                levelIterateEntitiesInBounds(
                    level,
                    // TODO adjust look radius to account for orientation (i.e don't look
                    // behind)
                    entityCenter.map(v => v - AI_LOOK_RADIUS) as Vector3,
                    new Array(3).fill(AI_LOOK_RADIUS*2) as Vector3,
                    target => {
                      let targetValue = 0;
                      if (target.entityType == ENTITY_TYPE_PLAYER) {
                        // TODO aggro
                        targetValue = 2;
                      }
                      if (
                          target.body.jointAttachmentHolderPartId
                              && !entity.joints[target.body.jointAttachmentHolderPartId].attachedEntity
                      ) {
                        targetValue = 1;
                      }
                      if (target == entity.activeTarget) {
                        targetValue++;
                      }
                      if (targetValue) {
                        // account for proximity (closer items are more attractive)
                        targetValue -= vectorNLength(vectorNSubtract(entityCenter, entityMidpoint(target)))*2/AI_LOOK_RADIUS;
                      }
                      if (targetValue > bestTargetValue) {
                        bestTarget = target;
                        bestTargetValue = targetValue;
                      }
                    }
                );
                // TODO recalculate activePath
                entity.activeTarget = bestTarget;
                entity.activePathTime = worldTime;
              }
              if (entity.activeTarget) {
                // are we close enough to move directly to and/or interact with the target?
                const delta = vectorNSubtract(entityMidpoint(entity.activeTarget), entityCenter);
                const distance = vectorNLength(
                    delta.map((v, i) => Math.max(0, Math.abs(v) - (entity.dimensions[i] + entity.activeTarget.dimensions[i])/2))
                );
                if (distance < AI_DIRECT_MOVE_RADIUS) {
                  // look at target
                  const validOrientations: Orientation[] = [];
                  if (Math.abs(delta[0]) > .1) {
                    validOrientations.push(delta[0] > 0 ? ORIENTATION_EAST : ORIENTATION_WEST);
                  }
                  if (Math.abs(delta[1]) > .1) {
                    validOrientations.push(delta[1] > 0 ? ORIENTATION_NORTH : ORIENTATION_SOUTH);
                  }

                  if (validOrientations.indexOf(targetOrientation) < 0 && validOrientations.length) {
                    // array can be empty
                    targetOrientation = validOrientations[0];
                  }
                  
                  // walk in that direction
                  // TODO account for target size and weapon range
                  let targetAction: ActionId | undefined;
                  if (entity.activeTarget.entityType == ENTITY_TYPE_PLAYER) {
                    // TODO find best attack for range
                    targetAction = ACTION_ID_ATTACK_LIGHT;
                  } else {
                    targetAction = ACTION_ID_DUCK;
                  }
                  const targetActionAvailable = !targetAction || (availableActions & targetAction);
                  const animations = entityGetActionAnims(entity, targetAction);
                  const actionRange = animations.range || 0;
                  const inRange = distance < actionRange + .05 && distance > actionRange - .05;
                  if (animations && targetAction && targetActionAvailable && inRange) {
                    action = targetAction;
                    if (targetAction == ACTION_ID_DUCK) {
                      interact = 1;
                    }
                  } else if ((availableActions & ACTION_ID_WALK)
                      && definitelyOnGround
                      && (!inRange || !targetActionAvailable)
                  ){
                    // stay back a bit if the desired action isn't available
                    const direction = targetActionAvailable
                        ? (distance - actionRange)/Math.abs(distance - actionRange)
                        : -1;
                    action = ACTION_ID_WALK;
                    targetVelocity = vector3TransformMatrix4(
                        matrix4Rotate(targetOrientation * direction * Math.PI/2, 0, 0, 1),
                        direction > 0 ? SKELETON_WALK_SPEED : SKELETON_WALK_SPEED/2,
                        0,
                        entity.velocity[2],
                    );
                  }
                }
              }
            }
          }

          if (targetOrientation != entity.orientation) {
            entity.orientation = targetOrientation;
            const targetAngle = targetOrientation * Math.PI/2;
            const to: Vector3 = [0, 0, targetAngle];
            entity.anim = animLerp(
                worldTime,
                entity.rotation,
                to,
                299,
                EASE_IN_OUT_QUAD,
                1,
            );
            // action = ACTION_ID_TURN;
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

          const movable = entity as Moveable;
          
          // limit velocity
          arrayMapAndSet(movable.velocity, (c, i) => {
            const v = targetVelocity[i];
            let velocity = v;
            if (i < 2 && entity.acc) {
              const diff = v - c;
              velocity = c + diff * entity.acc * delta;
            }
            return Math.min(
                MAX_VELOCITY,
                Math.max(
                    -MAX_VELOCITY,
                    velocity,
                )
            );
          });

          // move toward centerline of cross-orientation
          if (entity.orientation != null && delta) {
            const crossAxis = (entity.orientation + 1) % 2;
            
            const center = entityCenter[crossAxis]; 
            const rail = (center | 0) + .5;
            const diff = rail - center;
            entity.velocity[crossAxis] = Math.max(
                -Math.abs(diff/delta), 
                Math.min(
                    Math.abs(diff/delta),
                    diff * RAIL_ALIGNMENT_VELOCITY,
                ),
            );
          }
          // add in gravity
          movable.velocity[2] -= delta * GRAVITY;

          // check attacking
          const attacking = entity.joints.some((joint, jointId) => {
            return joint.animAction && entityGetActionAnims(entity, joint.animAction)
                ?.sequences[joint.animActionIndex]
                ?.[jointId]
                ?.[ENTITY_CHILD_PART_ANIMATION_DAMAGE_INDEX]
          });
          if (attacking) {
            // get a big area (we don't know how large the animations are)
            const position = entity.position.map(v => v - MAX_ATTACK_RADIUS) as Vector3;
            const dimensions = entity.dimensions.map(v => v + MAX_ATTACK_RADIUS * 2) as Vector3;
            levelIterateEntitiesInBounds(level, position, dimensions, victim => {
              // work out the most appropriate action for each victim
              if (!victim.lastDamaged || victim.lastDamaged < worldTime - DAMAGE_INVULNERABILITY_DURATION) {
                let maxDamage = 0;
                let blocked: Booleanish;
                  entityIterateParts((e, entityPart, entityTransform, entityJoint, entityPartDamage) => {
                  if (entityPartDamage) {
                    const entityPartShape = shapes[entityPart.modelId];
                    const entityPartRadius = models[entityPart.modelId][2];
                    const entityPartPosition = vector3TransformMatrix4(entityTransform, 0, 0, 0);
                    const entityPartPlanes = entityPartShape.map(f => planeTransform(f.plane, entityTransform));
                    // could split this out, but there should only be a very small number (ideally 1) of
                    // damaging body parts for a given entity
                    entityIterateParts((v, victimPart, victimTransform, victimJoint, victimDamageMultiplier) => {
                      // do the shapes overlap?
                      const victimPartShape = shapes[victimPart.modelId];
                      const victimPartRadius = models[victimPart.modelId][2];
                      const victimPartPosition = vector3TransformMatrix4(victimTransform, 0, 0, 0);
                      // shapeFromPlanes is very expensive, so check the bounds first
                      if (
                          (victimDamageMultiplier || victimPart.incomingDamageMultiplier) 
                          && victimPartRadius + entityPartRadius > vectorNLength(vectorNSubtract(victimPartPosition, entityPartPosition))
                      ) {
                        let overlap: Booleanish;
                        if (FLAG_FAST_COLLISIONS) {
                          // are any points contained in the shapes
                          overlap = shapeContainsPointsFromShape(victimPartShape, victimTransform, entityPartShape, entityTransform)
                              || shapeContainsPointsFromShape(entityPartShape, entityTransform, victimPartShape, victimTransform);
                        } else {
                          const victimPartPlanes = victimPartShape.map(f => planeTransform(f.plane, victimTransform));
                          overlap = shapeFromPlanes([...entityPartPlanes, ...victimPartPlanes]).length > 3;
                        }
                        if (overlap) {
                          maxDamage = Math.max(maxDamage, entityPartDamage * (victimPart.incomingDamageMultiplier || 0));
                          blocked = blocked || !!victimDamageMultiplier || victimPart.incomingDamageMultiplier < 0;
                        }
                      }
                    }, victim, victim.body);
                  }
                }, entity, entity.body);
  
                const victimVelocity = vectorNAdd<Vector3>(
                    victim.velocity || [0, 0, 0],
                    vectorNScale(
                        vectorNNormalize(
                          vectorNSubtract(
                              entityMidpoint(victim),
                              entityMidpoint(entity),
                          )
                        ),
                        .001 * (maxDamage || 1),
                    )
                );
                if (blocked) {
                  // start the attack cancel animation
                  action = ACTION_ID_CANCEL;
                } else if (maxDamage) {
                  // start the damage received animation
                  victim.health -= maxDamage;
                  victim.lastDamaged = worldTime;
                  if (victim.health > 0) {
                    entityStartAnimation(victim, ACTION_ID_TAKE_DAMAGE);
                  } else {
                    // collapse
                    levelRemoveEntity(level, victim);
                    entityIterateParts((e, part, transform, joint) => {
                      const position = vector3TransformMatrix4(transform, 0, 0, 0);
                      let partEntity: Entity;
                      if (e == victim) {
                        // turn their body parts into items
                        const [position, dimensions] = shapeBounds(shapes[part.modelId], transform, 1);
                        partEntity = entityCreate({
                          // create generic self-contained entity for each body part
                          body: {
                            ...part,
                            id: 0,
                            preRotationTransform: 0,
                            children: [],
                          },
                          joints: [{ 
                            ...joint,
                            animAction: 0,
                            attachedEntity: 0,
                            rotation: [0, 0, 0],
                          }],
                          collisionGroup: COLLISION_GROUP_ITEM,
                          // some stuff just fall through
                          collisionMask: Math.random() < .5 ? COLLISION_GROUP_WALL : 0,
                          dimensions,
                          position,
                          // TODO use current rotation 
                          rotation: [0, 0, Math.random() * Math.PI * 2],
                        });
                      } else {
                        // drop whatever they're holding
                        partEntity = e;
                        partEntity.position = position;
                      }
                      if (partEntity) {
                        partEntity.velocity = victimVelocity
                            .map(v => v + (Math.random() - .5) * .001) as Vector3;
                        levelAddEntity(level, partEntity);
                      }
                    }, victim, victim.body);
                  }
                }
                if (victim.velocity && (blocked || maxDamage)) {
                  victim.velocity = victimVelocity;
                }
              }
            });
          }

          // check collisions
          let iterations = 0;
          let maxOverlapIndex: number;
          let remainingDelta = delta;
          let maxIntersectionArea = 0;
          let verticalIntersectionCount = 0;
          do {
            const targetPosition = entity.position.map((v, i) => v + entity.velocity[i] * remainingDelta) as Vector3;
            const maximalPosition = entity.position.map((v, i) => Math.min(v, targetPosition[i]) - EPSILON) as Vector3;
            const maximalDimensions = entity.dimensions.map(
                (v, i) => v + Math.abs(targetPosition[i] - entity.position[i]) + EPSILON * 2,
            ) as Vector3;

            let maxOverlapDelta = 0;
            // TODO might need initialisers for CC
            let maxCollisionEntity: Entity | Falsey;
            let hadSoftBodyCollision: Booleanish;
            
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
              if (FLAG_DEBUG_COLLISIONS && startingIntersection.every(v => v > 0)) {
                  console.log('collions', iterations);
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
                  console.log('previous maximalPosition', entity['previousMaximalPosition']);
                  console.log('previous maximalDimensions', entity['previousMaximalDimensions']);
                  console.log('previous targetPosition', entity['previousTargetPosition']);
              }

              // do we overlap?
              const intersection = rect3Intersection(
                  maximalPosition,
                  maximalDimensions,
                  collisionEntity.position,
                  collisionEntity.dimensions,
              );
              if (FLAG_DEBUG_COLLISIONS) {
                if (!entity['previousIntersection']) {
                  entity['previousIntersection'] = {};
                }
                entity['previousIntersection'][collisionEntity.id] = intersection;
              }

              if (intersection.every(v => v >= 0)) {
                if (collisionEntity.velocity) {
                  // only do soft collisions in first iteration
                  if (!iterations) {
                    // soft collisions with other movable objects
                    const entityCenter = entityMidpoint(entity);
                    const collisionEntityCenter = entityMidpoint(collisionEntity);
                    const diffs = vectorNSubtract(entityCenter, collisionEntityCenter);
                    diffs.forEach((diff, i) => {
                      const maxDiff = (entity.dimensions[i] + collisionEntity.dimensions[i])/2;
                      const dv = (1 - diff/maxDiff)/4999;
                      entity.velocity[i] -= dv;
                      // TODO why does the collision entity not apply this to itself when it
                      // detects a collision?
                      collisionEntity.velocity[i] += dv;
                    });
                    // because the velocity has changed, we need to redo all the collisions here
                    hadSoftBodyCollision = 1;
                  }
                } else {
                  // scale by velocity to get collision time
                  const overlap = intersection.reduce<[number, number, number] | Falsey>((acc, intersectionDimension, i) => {
                    const velocity = entity.velocity[i];
                    if (velocity) {
                      const overlapDelta = intersectionDimension/Math.abs(velocity);

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
                    if (overlapDelta < remainingDelta && 
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
            if (maxCollisionEntity && maxOverlapIndex != 2 && FLAG_DEBUG_COLLISIONS) {
              console.log('questionable intersection');
            }
            iterations ++;
            if (!hadSoftBodyCollision) {
              const moveDelta = Math.max(0, remainingDelta - maxOverlapDelta) - EPSILON;
              remainingDelta = maxOverlapDelta;
              if (FLAG_DEBUG_COLLISIONS) {
                entity['previousPosition'] = [...entity.position];
                entity['previousVelocity'] = [...entity.velocity];
                entity['previousMoveDelta'] = moveDelta;
                entity['previousCollisions'] = iterations;
                entity['previousMaximalPosition'] = maximalPosition;
                entity['previousMaximalDimensions'] = maximalDimensions;  
                entity['previousTargetPosition'] = targetPosition;
              }
              arrayMapAndSet(entity.position, (v, i) => v + entity.velocity[i] * moveDelta);
              if (maxCollisionEntity) {
                if (FLAG_DEBUG_COLLISIONS) {
                  entity.previousCollision = {
                    maxCollisionEntity,
                    maxIntersectionArea,
                    maxOverlapIndex,
                    worldTime,
                  };  
                }
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
              }
            }
          } while ((remainingDelta > EPSILON) && iterations < MAX_COLLISIONS);

          if (FLAG_DEBUG_COLLISIONS && iterations >= MAX_COLLISIONS) {
            console.log('too many collisions');
          }

          // start new animations
          entityStartAnimation(entity, action);
          levelAddEntity(level, entity);
        }

        const entityCenter = entityMidpoint(carrier || entity);
        const [cx, cy, cz] = vector3TransformMatrix4(cameraRenderCutoffTransform, ...entityCenter);
        return cy < 0 && (cz > 0 && !entity.velocity || cz > 1);
      },
      light,
  );

  requestAnimationFrame(update);
};
update(0);

function updateAndRenderLevel(
    cameraProjectionMatrix: Matrix4,
    cameraPosition: Vector3,
    position: Vector3,
    dimensions: Vector3,
    previousLights: Light[],
    // return false if want to render
    updateEntity: (e: Entity, carrier?: Entity) => Booleanish,
    // the light we just rendered that we want to store the offsets for
    light?: Light,
): Light[] {
  const lights = [];
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(
      uniformProjectionMatrix,
      false,
      cameraProjectionMatrix,
  );
  gl.uniform3fv(
      uniformCameraPosition,
      cameraPosition,
  );

  const instancedRenders: Partial<Record<ModelId, [Matrix4, Matrix4, TextureId][]>> = {};

  levelIterateEntitiesInBounds(
      level,
      position,
      dimensions,
      entity => {
        // do we need to render?
        const ignoreRendering = updateEntity(entity);
        const renderEntities: Record<EntityId, Booleanish> = {[entity.id]: !ignoreRendering};
        const predicate = (j: Joint) =>
                (j.attachedEntity
                    && ((renderEntities[j.attachedEntity.id] = !updateEntity(j.attachedEntity, entity))
                        || j.attachedEntity.joints.map(predicate).some(l => l)
                    )
                ) || j.light;
        
        const shouldIterateJoints = entity.joints.map(predicate);
        const shouldIterateParts = !ignoreRendering || shouldIterateJoints.some(l => l); 

        if (shouldIterateParts) {
          entityIterateParts(
            (entity, part, transform, joint) => {
              const partPosition = vector3TransformMatrix4(transform, 0, 0, 0);
              if (light) {
                joint.entityLightTransforms = joint.entityLightTransforms || {};
                // joint.entityLightTransforms[light.entityId] = matrix4Multiply(
                //     matrix4Translate(...vectorNScale(light.pos, -1)),
                //     transform,
                // );
                joint.entityLightTransforms[light.entityId] = partPosition;
              }
      
              if (joint.light) {
                const pos = [...partPosition];
                pos[2] += LIGHT_Z_FUTZ;
                lights.push({
                  pos,
                  entityId: entity.id,
                  luminosity: joint.light,
                });
              }
              if (renderEntities[entity.id]) {
                // sometimes the inverse isn't available. The shadows are going to be screwed up for this thing
                const invertedTransform = matrix4Invert(transform);
                if (!invertedTransform) {
                  throw new Error(JSON.stringify(transform));
                }
                const textureId = part.textureId || TEXTURE_ID_WHITE;
                if (FLAG_INSTANCED_RENDERING && !entity.velocity) {
                  const modelInstancedRenders = instancedRenders[part.modelId]
                      || (instancedRenders[part.modelId] = []);
                  modelInstancedRenders.push([transform, invertedTransform, textureId])
                } else {
                  const lightPositions = previousLights.map(l => {
                    const partPositionAtLightRenderTime = joint.entityLightTransforms?.[l.entityId];
                    const render = lightRenders[l.entityId];
                    const position = partPositionAtLightRenderTime
                        ? vectorNSubtract(render[2], vectorNSubtract(partPositionAtLightRenderTime, partPosition))
                        : render[2];
                    return [...position, l.luminosity];
                  });
                  gl.uniform4fv(
                      uniformLightPositions,
                      lightPositions.flat(2).concat(...new Array((MAX_LIGHTS - previousLights.length) * 4).fill(0)),
                  );
  
                  gl.uniformMatrix4fv(uniformModelViewMatrix, false, transform);
                  gl.uniformMatrix4fv(uniformModelViewMatrixInverse, false, invertedTransform);
                  // x = nothing
                  // y = texture id of part
                  gl.uniform2i(uniformModelAttributes, 0, textureId);
              
                  const [vao, count] = models[part.modelId];
                  gl.bindVertexArray(vao);
                  gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);  
                }
              }
            },
            entity,
            entity.body,
          );
        }        
      },
  );
  if (FLAG_INSTANCED_RENDERING) {
    // these things don't move, so we don't need to check the light deltas
    gl.uniform4fv(
        uniformLightPositions,
        previousLights
            .map(l => {
              const render = lightRenders[l.entityId];
              return [...render[2], l.luminosity];
            })
            .flat(2)
            .concat(...new Array((MAX_LIGHTS - previousLights.length) * 4).fill(0))
    );

    for (let modelId in instancedRenders) {
      const modelInstancedRenders: [Matrix4, Matrix4, TextureId][] = instancedRenders[modelId];
      const [vao, count] = models[modelId];
      gl.bindVertexArray(vao);
      modelInstancedRenders.forEach(([transform, invertedTransform, textureId]) => {
        gl.uniformMatrix4fv(uniformModelViewMatrix, false, transform);
        gl.uniformMatrix4fv(uniformModelViewMatrixInverse, false, invertedTransform);
        gl.uniform2i(uniformModelAttributes, 0, textureId);
    
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
      });
    }
  }
  return lights;
}
