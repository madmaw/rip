///<reference path="bodies/bottle.ts"/>
///<reference path="bodies/club.ts"/>
///<reference path="bodies/steps.ts"/>
///<reference path="bodies/skeleton.ts"/>
///<reference path="bodies/spear.ts"/>
///<reference path="bodies/torch.ts"/>
///<reference path="bodies/wall.ts"/>
///<reference path="level/entity.ts"/>
///<reference path="level/level.ts"/>
///<reference path="math/math.ts"/>
///<reference path="math/matrix.ts"/>
///<reference path="math/shape.ts"/>
///<reference path="textures/textures.ts"/>
///<reference path="util/arrays.ts"/>
///<reference path="util/hax.ts"/>
///<reference path="constants.ts"/>
///<reference path="flags.ts"/>
///<reference path="inputs.ts"/>
///<reference path="webgl.ts"/>


const A_VERTEX_POSIITON = FLAG_LONG_GL_VARIABLE_NAMES ? 'aVertexPosition' : 'Z';
const A_VERTEX_NORMAL = FLAG_LONG_GL_VARIABLE_NAMES ? 'aVertexNormal' : 'Y';
const A_TEXTURE_POSITION = FLAG_LONG_GL_VARIABLE_NAMES ? 'aTexturePosition' : 'X';

const ATTRIBUTES = FLAG_LONG_GL_VARIABLE_NAMES ? [
  A_VERTEX_POSIITON,
  A_VERTEX_NORMAL,
  A_TEXTURE_POSITION,
] : [...'ZYX'];

const U_MODEL_VIEW_MATRIX = FLAG_LONG_GL_VARIABLE_NAMES ? 'uModelViewMatrix' : 'A';
// inverting in the shader has performance issues
const U_MODEL_VIEW_MATRIX_INVERSE = FLAG_LONG_GL_VARIABLE_NAMES ? 'uModelViewMatrixInverse' : 'B';
const U_MODEL_ATTRIBUTES = FLAG_LONG_GL_VARIABLE_NAMES ? 'uModelAttributes' : 'C';
const U_PROJECTION_MATRIX = FLAG_LONG_GL_VARIABLE_NAMES ? 'uProjectionMatrix' : 'D';
const U_CAMERA_POSITION = FLAG_LONG_GL_VARIABLE_NAMES ? 'uCameraPosition' : 'E';
const U_LIGHT_POSITIONS = FLAG_LONG_GL_VARIABLE_NAMES ? 'uLightPositions' : 'F';
const U_LIGHT_TEXTURES = FLAG_LONG_GL_VARIABLE_NAMES ? 'uLightTextures' : 'G';
const U_TEXTURE_COLORS = FLAG_LONG_GL_VARIABLE_NAMES ? 'uTextureColors' : 'H';
const U_TEXTURE_NORMALS = FLAG_LONG_GL_VARIABLE_NAMES ? 'uTextureNormals' : 'I';

const UNIFORMS = FLAG_LONG_GL_VARIABLE_NAMES ? [
  U_MODEL_VIEW_MATRIX,
  U_MODEL_VIEW_MATRIX_INVERSE,
  U_MODEL_ATTRIBUTES,
  U_PROJECTION_MATRIX,
  U_CAMERA_POSITION,
  U_LIGHT_POSITIONS,
  U_LIGHT_TEXTURES,
  U_TEXTURE_COLORS,
  U_TEXTURE_NORMALS,
] : [...'ABCDEFGHI'];

const V_POSITION = FLAG_LONG_GL_VARIABLE_NAMES ? 'vPosition' : 'z';
const V_NORMAL = FLAG_LONG_GL_VARIABLE_NAMES ? 'vNormal' : 'y';
const V_MODEL_POSITION = FLAG_LONG_GL_VARIABLE_NAMES ? 'vModelPosition' : 'x';
const V_MODEL_NORMAL = FLAG_LONG_GL_VARIABLE_NAMES ? 'vModelNormal' : 'w';
const V_TEXTURE_POSITION = FLAG_LONG_GL_VARIABLE_NAMES ? 'vTextureCoords' : 'v';

const VERTEX_SHADER = `#version 300 es
  precision ${WEBGL_PRECISION} float;

  uniform mat4 ${U_MODEL_VIEW_MATRIX};
  uniform mat4 ${U_PROJECTION_MATRIX};

  in vec4 ${A_VERTEX_POSIITON};
  in vec3 ${A_VERTEX_NORMAL};
  in vec3 ${A_TEXTURE_POSITION};

  out vec4 ${V_POSITION};
  out vec3 ${V_MODEL_POSITION};
  out vec3 ${V_NORMAL};
  out vec3 ${V_MODEL_NORMAL};
  out vec3 ${V_TEXTURE_POSITION};

  void main() {
    ${V_MODEL_POSITION} = ${A_VERTEX_POSIITON}.xyz;
    ${V_TEXTURE_POSITION} = ${A_TEXTURE_POSITION};
    ${V_POSITION} = ${U_MODEL_VIEW_MATRIX} * ${A_VERTEX_POSIITON};
    ${V_NORMAL} = normalize(
        ${U_MODEL_VIEW_MATRIX} * vec4(${A_VERTEX_NORMAL}, 1.)
        - ${U_MODEL_VIEW_MATRIX} * vec4(vec3(0.), 1.)
    ).xyz;
    ${V_MODEL_NORMAL} = ${A_VERTEX_NORMAL};
    gl_Position = ${U_PROJECTION_MATRIX} * ${V_POSITION};
  }
`;

const OUT_RESULT = FLAG_LONG_GL_VARIABLE_NAMES ? 'result' : '_';

const L_CAMERA_AND_LIGHT_DELTA = FLAG_LONG_GL_VARIABLE_NAMES ? 'lCameraDelta' : 'a';
//const L_TEXTURE_SCALE = FLAG_LONG_GL_VARIABLE_NAMES ? 'lTextureScale' : 'b';
const L_MODEL_CAMERA_AND_LIGHT_NORMAL = FLAG_LONG_GL_VARIABLE_NAMES ? 'lModelCameraNormal' : 'c';
const L_TEXTURE_DELTA_AND_LIGHT = FLAG_LONG_GL_VARIABLE_NAMES ? 'lTextureDelta' : 'd';
const L_TEXTURE_POSITION_AND_LIGHT_COLOR = FLAG_LONG_GL_VARIABLE_NAMES ? 'lTexturePosition' : 'e';
const L_TEXTURE_NORMAL_AND_COLOR = FLAG_LONG_GL_VARIABLE_NAMES ? 'lTextureNormal' : 'f';
const L_POSITION = FLAG_LONG_GL_VARIABLE_NAMES ? 'lPosition' : 'g';
const L_NORMAL = FLAG_LONG_GL_VARIABLE_NAMES ? 'lNormal' : 'h';
// intentionally left i
const L_FOUND_TEXTURE = FLAG_LONG_GL_VARIABLE_NAMES ? 'lFoundTexture' : 'j';
const L_MINIMUM_TEXTURE_AND_COS_LIGHT_ANGLE_DELTAS = FLAG_LONG_GL_VARIABLE_NAMES ? 'lMinTextureDelta' : 'k';
const L_TEST = FLAG_LONG_GL_VARIABLE_NAMES ? 'lTest' : 'l';
// const L_MODEL_POSITION = FLAG_LONG_GL_VARIABLE_NAMES ? 'lModelPosition' : 'm';
const L_DEPTH = FLAG_LONG_GL_VARIABLE_NAMES ? 'lDepth' : 'n';
//const L_COLOR = FLAG_LONG_GL_VARIABLE_NAMES ? 'lColor' : 'o';
//const L_LIGHT_COLOR = FLAG_LONG_GL_VARIABLE_NAMES ? 'lLightColor' : 'p';
//const L_LIGHT = FLAG_LONG_GL_VARIABLE_NAMES ? 'lLight' : 'q';
//const L_COS_LIGHT_ANGLE_DELTA = FLAG_LONG_GL_VARIABLE_NAMES ? 'lCosLightAngleDelta' : 'r';
const L_LIGHT_TEXEL = FLAG_LONG_GL_VARIABLE_NAMES ? 'lLightTexel' : 's';
//const L_LIGHT_DELTA = FLAG_LONG_GL_VARIABLE_NAMES ? 'lLightDelta' : 't'; // unused
//const L_LIGHT_NORMAL = FLAG_LONG_GL_VARIABLE_NAMES ? 'lLightNormal' : 'u';
const L_LIGHT_TEXTURE_NORMAL = FLAG_LONG_GL_VARIABLE_NAMES ? 'lLightTextureNormal' : 'U';
const L_LIGHT_DISTANCE = FLAG_LONG_GL_VARIABLE_NAMES ? 'lLightDistance' : 'T';
//const L_BIAS = FLAG_LONG_GL_VARIABLE_NAMES ? 'lBias' : 'S';

const FRAGMENT_SHADER = `#version 300 es
  precision ${WEBGL_PRECISION} float;
  precision ${WEBGL_PRECISION} sampler3D;

  uniform mat4 ${U_MODEL_VIEW_MATRIX};
  uniform mat4 ${U_MODEL_VIEW_MATRIX_INVERSE};
  uniform vec3 ${U_CAMERA_POSITION};
  uniform vec4 ${U_LIGHT_POSITIONS}[${MAX_LIGHTS}];
  uniform vec3 ${U_MODEL_ATTRIBUTES};
  uniform samplerCube ${U_LIGHT_TEXTURES}[${MAX_LIGHTS}];
  uniform sampler3D ${U_TEXTURE_COLORS};
  uniform sampler3D ${U_TEXTURE_NORMALS};

  in vec4 ${V_POSITION};
  in vec3 ${V_MODEL_POSITION};
  in vec3 ${V_NORMAL};
  in vec3 ${V_MODEL_NORMAL};
  in vec3 ${V_TEXTURE_POSITION};
  out vec4 ${OUT_RESULT};

  vec3 tn(vec3 p) {
    return (vec3(${U_MODEL_ATTRIBUTES}.y, 0., 0.) + clamp(p, vec3(-${TEXTURE_EXTENT}), vec3(${TEXTURE_EXTENT})) + .5)
        / vec3(${NORMAL_TEXTURE_FACTORIES.length}., 1., 1.);
  }

  void main() {
    vec3 ${L_CAMERA_AND_LIGHT_DELTA} = ${V_POSITION}.xyz - ${U_CAMERA_POSITION};
    vec3 ${L_MODEL_CAMERA_AND_LIGHT_NORMAL} = normalize(
        ${U_MODEL_VIEW_MATRIX_INVERSE} * vec4(${L_CAMERA_AND_LIGHT_DELTA}, 1.) -
        ${U_MODEL_VIEW_MATRIX_INVERSE} * vec4(vec3(0.), 1.)
    ).xyz;
    
    float ${L_TEXTURE_DELTA_AND_LIGHT} = 0.;
    vec3 ${L_TEXTURE_POSITION_AND_LIGHT_COLOR} = ${V_TEXTURE_POSITION};
    vec4 ${L_TEXTURE_NORMAL_AND_COLOR} = texture(${U_TEXTURE_NORMALS}, tn(${L_TEXTURE_POSITION_AND_LIGHT_COLOR}));
    vec3 ${L_POSITION} = ${V_POSITION}.xyz;
    float ${L_MINIMUM_TEXTURE_AND_COS_LIGHT_ANGLE_DELTAS} = 0.;

    if (${L_TEXTURE_NORMAL_AND_COLOR}.w < ${TEXTURE_ALPHA_THRESHOLD}) {
      int ${L_FOUND_TEXTURE} = 0;
      // maximum extent should be 1,1,1, which gives a max len of sqrt(3)
      for (int i=0; i<${TEXTURE_LOOP_STEPS}; i++) {
        float ${L_TEST} = ${L_FOUND_TEXTURE} > 0
            ? (${L_TEXTURE_DELTA_AND_LIGHT} + ${L_MINIMUM_TEXTURE_AND_COS_LIGHT_ANGLE_DELTAS})/2.
            : ${L_TEXTURE_DELTA_AND_LIGHT} + ${TEXTURE_LOOP_STEP_SIZE};
        ${L_TEXTURE_NORMAL_AND_COLOR} = texture(
            ${U_TEXTURE_NORMALS},
            tn(${V_TEXTURE_POSITION} + ${L_MODEL_CAMERA_AND_LIGHT_NORMAL} * ${L_TEST})
        );
        if (
          ${L_TEXTURE_NORMAL_AND_COLOR}.w > ${TEXTURE_ALPHA_THRESHOLD}
        ) {
          ${L_FOUND_TEXTURE} = 1;
          ${L_TEXTURE_DELTA_AND_LIGHT} = ${L_TEST};
        } else {
          if (${L_FOUND_TEXTURE} > 0) {
            ${L_MINIMUM_TEXTURE_AND_COS_LIGHT_ANGLE_DELTAS} = ${L_TEST};
          } else {
            ${L_MINIMUM_TEXTURE_AND_COS_LIGHT_ANGLE_DELTAS} = ${L_TEXTURE_DELTA_AND_LIGHT};
            ${L_TEXTURE_DELTA_AND_LIGHT} = ${L_TEST};
          }
        }  
      }
      if (${L_FOUND_TEXTURE} < 1) {
        discard;
      }
      // texture position
      ${L_TEXTURE_POSITION_AND_LIGHT_COLOR} = ${V_TEXTURE_POSITION} + ${L_MODEL_CAMERA_AND_LIGHT_NORMAL} * ${L_TEXTURE_DELTA_AND_LIGHT};  
      // texture normal
      ${L_TEXTURE_NORMAL_AND_COLOR} = texture(${U_TEXTURE_NORMALS}, tn(${L_TEXTURE_POSITION_AND_LIGHT_COLOR}));
      // virtual fragment position
      ${L_POSITION} = (
          ${U_MODEL_VIEW_MATRIX}
              * vec4(
                  ${V_MODEL_POSITION} + ${L_MODEL_CAMERA_AND_LIGHT_NORMAL} * ${L_TEXTURE_DELTA_AND_LIGHT},
                  1.
              )
      ).xyz;
    }

    vec3 ${L_NORMAL} = normalize(
        abs(${L_TEXTURE_POSITION_AND_LIGHT_COLOR}.x) < .5 && abs(${L_TEXTURE_POSITION_AND_LIGHT_COLOR}.y) < .5 && abs(${L_TEXTURE_POSITION_AND_LIGHT_COLOR}.z) < .5
            ? (
                ${U_MODEL_VIEW_MATRIX} * vec4(${L_TEXTURE_NORMAL_AND_COLOR}.xyz * 2. - 1., 1.)
                - ${U_MODEL_VIEW_MATRIX} * vec4(vec3(0.), 1.)
            ).xyz
            : ${V_NORMAL}
    );

    float ${L_DEPTH} = ${L_TEXTURE_DELTA_AND_LIGHT} * dot(normalize(${V_NORMAL}), normalize(${L_CAMERA_AND_LIGHT_DELTA}));
    // texture color
    ${L_TEXTURE_NORMAL_AND_COLOR} = texture(
        ${U_TEXTURE_COLORS},
        (vec3(${U_MODEL_ATTRIBUTES}.x, 0., 0.) + clamp(${L_TEXTURE_POSITION_AND_LIGHT_COLOR}, vec3(-${TEXTURE_EXTENT}), vec3(${TEXTURE_EXTENT})) + .5)
            / vec3(${COLOR_TEXTURE_FACTORIES.length}., 1., 1.)
    );

    ${L_TEXTURE_POSITION_AND_LIGHT_COLOR} = vec3(max(0., (${L_TEXTURE_NORMAL_AND_COLOR}.w -.5) * 2.));
    for (int i = ${MAX_LIGHTS}; i > 0;) {
      i--;
      if (${U_LIGHT_POSITIONS}[i].w > 0. || i == 0) {
        ${L_CAMERA_AND_LIGHT_DELTA} = ${L_POSITION} - ${U_LIGHT_POSITIONS}[i].xyz;
        ${L_MODEL_CAMERA_AND_LIGHT_NORMAL} = normalize(${L_CAMERA_AND_LIGHT_DELTA});
        ${L_MINIMUM_TEXTURE_AND_COS_LIGHT_ANGLE_DELTAS} = dot(${L_NORMAL}, ${L_MODEL_CAMERA_AND_LIGHT_NORMAL});
        // cannot index into samplers!
        vec4 ${L_LIGHT_TEXEL} = i == 0
            ? texture(${U_LIGHT_TEXTURES}[0], ${L_MODEL_CAMERA_AND_LIGHT_NORMAL})
            : i == 1
                ? texture(${U_LIGHT_TEXTURES}[1], ${L_MODEL_CAMERA_AND_LIGHT_NORMAL})
                : i == 2
                    ? texture(${U_LIGHT_TEXTURES}[2], ${L_MODEL_CAMERA_AND_LIGHT_NORMAL})
                    : texture(${U_LIGHT_TEXTURES}[3], ${L_MODEL_CAMERA_AND_LIGHT_NORMAL});
    
        float ${L_LIGHT_DISTANCE} = 2. * ${CUBE_MAP_PERPSECTIVE_Z_NEAR} * ${CUBE_MAP_PERPSECTIVE_Z_FAR}.
            / (
                (${CUBE_MAP_PERPSECTIVE_Z_FAR}.
                    + ${CUBE_MAP_PERPSECTIVE_Z_NEAR}
                    - (2. * ${L_LIGHT_TEXEL}.x - 1.) * (${CUBE_MAP_PERPSECTIVE_Z_FAR}. - ${CUBE_MAP_PERPSECTIVE_Z_NEAR})
                ) * dot(
                    ${L_MODEL_CAMERA_AND_LIGHT_NORMAL},
                    normalize(
                        abs(${L_MODEL_CAMERA_AND_LIGHT_NORMAL}.x) > abs(${L_MODEL_CAMERA_AND_LIGHT_NORMAL}.y) && abs(${L_MODEL_CAMERA_AND_LIGHT_NORMAL}.x) > abs(${L_MODEL_CAMERA_AND_LIGHT_NORMAL}.z)
                            ? vec3(${L_MODEL_CAMERA_AND_LIGHT_NORMAL}.x, 0, 0)
                            : abs(${L_MODEL_CAMERA_AND_LIGHT_NORMAL}.y) > abs(${L_MODEL_CAMERA_AND_LIGHT_NORMAL}.z)
                                ? vec3(0, ${L_MODEL_CAMERA_AND_LIGHT_NORMAL}.y, 0)
                                : vec3(0, 0, ${L_MODEL_CAMERA_AND_LIGHT_NORMAL}.z)
                    )
                )
            )
            // ensure bumps are not in shadow
            + ${L_DEPTH}
                * 2.
                * length(${V_MODEL_POSITION})
                // texture scale
                * dot(normalize(${V_NORMAL}), ${L_MODEL_CAMERA_AND_LIGHT_NORMAL})
                    / length(${V_TEXTURE_POSITION});
        ${L_TEXTURE_DELTA_AND_LIGHT} = mix(
                max(0., -${L_MINIMUM_TEXTURE_AND_COS_LIGHT_ANGLE_DELTAS}),
                1.,
                pow(max(0., (${MIN_LIGHT_THROW_C} - length(${L_CAMERA_AND_LIGHT_DELTA}))*${U_LIGHT_POSITIONS}[i].w), 2.)
            )
            * ${U_LIGHT_POSITIONS}[i].w
            * (1. - pow(1. - max(0., ${MAX_LIGHT_THROW_C}*${U_LIGHT_POSITIONS}[i].w - length(${L_CAMERA_AND_LIGHT_DELTA}))/${MAX_LIGHT_THROW_C}, 2.));
        if (
            // don't (add/remove) light things facing away from us
            ${L_MINIMUM_TEXTURE_AND_COS_LIGHT_ANGLE_DELTAS} < 0.
            && length(${L_CAMERA_AND_LIGHT_DELTA}) < ${L_LIGHT_DISTANCE}
                // bias
                // TODO distance in bias seems wrong
                + pow(${L_LIGHT_DISTANCE}, 2.) * (2. - pow(${L_MINIMUM_TEXTURE_AND_COS_LIGHT_ANGLE_DELTAS}, 6.))/${CUBE_MAP_PERPSECTIVE_Z_FAR}.
            || length(${L_CAMERA_AND_LIGHT_DELTA}) < ${L_LIGHT_DISTANCE}
        ) {
          ${L_TEXTURE_POSITION_AND_LIGHT_COLOR} += ${L_TEXTURE_DELTA_AND_LIGHT}
              * (i == 0 ? vec3(.1, 1., .7) : mix(vec3(1., .4, .1), vec3(1., 1., .8), ${L_TEXTURE_DELTA_AND_LIGHT}))
              + (i == 0 ? max(${U_MODEL_ATTRIBUTES}.z, 0.) : 0.);
        } else if (i == 0) {
          ${L_TEXTURE_POSITION_AND_LIGHT_COLOR} = vec3(0.);
        }
      }
      ${L_TEXTURE_POSITION_AND_LIGHT_COLOR} *= 1. + min(${U_MODEL_ATTRIBUTES}.z, 0.) * vec3(.5, 1., 1.);
    }

    ${OUT_RESULT} = vec4(pow(${L_TEXTURE_NORMAL_AND_COLOR}.xyz * ${L_TEXTURE_POSITION_AND_LIGHT_COLOR}, vec3(.45)), 1.);
  }
`;

const gl = Z.getContext('webgl2'/* , {antialias: false}*/);
if (FLAG_SHOW_GL_ERRORS && gl == null) {
  throw new Error('no webgl2');
}

if (FLAG_SHORTEN_METHODS) {
  haxShortenMethods(gl, 'gl');
  haxShortenMethods(window, 'window');
}
if (FLAG_PRINT_GL_CONSTANTS) {
  const constants: (keyof WebGL2RenderingContext)[] = [
    'CLAMP_TO_EDGE',
    'DEPTH_COMPONENT',
    'TEXTURE_3D',
    'TEXTURE_BASE_LEVEL',
    'TEXTURE_CUBE_MAP_POSITIVE_X', 
    'TEXTURE_CUBE_MAP',
    'TEXTURE_MAX_LEVEL',
    'TEXTURE_WRAP_R',
    'TEXTURE_WRAP_S',
    'TEXTURE_WRAP_T',
    'UNSIGNED_BYTE',
  ];
  console.log(constants.map(c => `{ from: "gl.${c}", to: "${gl[c]}" }, `).join(''));
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
  SHAPE_CLUB,
  SHAPE_TORCH_HANDLE,
  SHAPE_TORCH_HEAD,
  SHAPE_SPEAR_BODY,
  BOTTLE_SHAPE,
];


// create the color/normal textures

const texturesData = TEXTURE_FACTORIES.map(f => {
  return array3New(
      TEXTURE_SIZE,
      TEXTURE_SIZE,
      f.length * TEXTURE_SIZE, 
      (z, y, x) => {
        const i = x / TEXTURE_SIZE | 0;
        const internalPoint: Vector3 = [
          (z + .5)/TEXTURE_SIZE - .5,
          (y + .5)/TEXTURE_SIZE - .5, 
          ((x % TEXTURE_SIZE) + .5)/TEXTURE_SIZE - .5
        ];
        return f[i](...internalPoint);
      },
  );
});

[uniformTextureColors, uniformTextureNormals].forEach((uniform, i) => {
  const textureData = texturesData[i];
  const data = textureData.flat(3);
  const texture = gl.createTexture();
  const textureIndex = TEXTURE_COLOR_INDEX + i;
  gl.activeTexture(gl.TEXTURE0 + textureIndex);
  gl.bindTexture(gl.TEXTURE_3D, texture);
  // TODO how much of this can we get away without?
  //gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0);
  // TODO hard code log2 result
  //gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, Math.log2(TEXTURE_SIZE));
  //gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, 5);
  // defaults
  // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  // gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  if (FLAG_TEXTURE_CLAMP_TO_EDGE) {
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);  
  }

  if (FLAG_TEXTURE_SCALE_NEAREST) {
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);  
  }

  gl.texImage3D(
      gl.TEXTURE_3D,
      0,
      gl.RGBA,
      TEXTURE_SIZE * TEXTURE_FACTORIES[i].length,
      TEXTURE_SIZE,
      TEXTURE_SIZE,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array(data),
  )

  gl.uniform1i(uniform, textureIndex);
});

// create the lighting textures
const cubeTextures = new Array(MAX_LIGHTS+1).fill(0).map((_, i) => {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + i);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

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
  // gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

  return texture;
});    
// VAO, index count, radius
const models: readonly [WebGLVertexArrayObject, number, number][] = shapes.map((shape, shapeId) => {
  const vertexPositionsToSmoothNormals: Record<string, Vector3[]> = {};
  const rounded = shapeId > 5;
  const [positions, hardNormals, texturePositions, indices, radius] = shape.reduce<[Vector3[], Vector3[], Vector3[], number[], number]>(
      ([positions, normals, texturePositions, indices, maxRadius], face) => {
        const points = face.perimeter.map(({ firstOutgoingIntersection }) => firstOutgoingIntersection);
        const surfaceIndices = face.perimeter.slice(2).map(
            (_, i) => [positions.length, positions.length + i + 1, positions.length + i + 2]
        ).flat();
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

let animationFrame: number = 0;
let player: Entity<SkeletonPartId>;

window.onload = window.onclick = () => {

  if (player?.health > 0) {
    return;
  }
  window.cancelAnimationFrame(animationFrame);
  const level = levelCreate(9, 9);
  levelAppendLayers(level, LEVEL_LAYER_CHUNK_SIZE, startX, startY);
  
  // TODO enemy pathing
  //levelPopulateGraph(level);
  
  // and a player
  player = entityCreate({
    ['p']: [startX + .5 - SKELETON_DIMENSION/2, startY + .5 - SKELETON_DIMENSION/2, 1.1],
    dimensions: [SKELETON_DIMENSION, SKELETON_DIMENSION, SKELETON_DEPTH],
    oriented: ORIENTATION_EAST,
    entityBody: PART_SKELETON_BODY,
    entityType: ENTITY_TYPE_PLAYER,
    acc: .005,
    velocity: [0, 0, 0],
    ['r']: [0, 0, 0],
    maxHealth: 9,
    health: 9,
    variantIndex: 1,
    collisionGroup: COLLISION_GROUP_MONSTER,
    collisionMask: COLLISION_GROUP_WALL | COLLISION_GROUP_MONSTER,
  });
  player.joints[SKELETON_PART_ID_HEAD].light = SKELETON_GLOW;
  levelAddEntity(level, player);
  
  const baseCameraRotation = matrix4Rotate(-CONST_PI_ON_2_5_1DP, 1, 0, 0);
  let cameraOffset = FLAG_ALLOW_ZOOM ? 4 : 2.5;
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
    window.onwheel = zoom;
    zoom();  
  } else {
    cameraOffsetTransform = matrix4Translate(0, cameraOffset, -.5);
  }
  window.onkeydown = (e: KeyboardEvent) => {
    keySet(e.keyCode as KeyCode, then, 1);
    if (FLAG_PREVENT_EVENT_DEFAULT) {
      e.preventDefault();
    }
  };  
  window.onkeyup = (e: KeyboardEvent) => keySet(e.keyCode as KeyCode, then, 0);
  
  // NOTE that camera orientation is not exactly the same as camera rotation
  // the relationship (I think) is camera rotation = (1 - cameraOrientation) * Math.PI/2
  let targetCameraOrientation: Orientation = player.oriented;
  let cameraZRotation = 0;
  
  let previouslyPickedUpEntities: Entity[] = []
  let worldTime = 0;
  let then = 0;

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

  const updateAndRenderLevel = (
      cameraProjectionMatrix: Matrix4,
      cameraPosition: Vector3,
      position: Vector3,
      dimensions: Vector3,
      previousLights: Light[],
      // return false if want to render
      updateEntity: (e: Entity, carrier?: Entity) => Booleanish,
      // the light we just rendered that we want to store the offsets for
      light?: Light,
  ): Light[] => {
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

    const instancedRenders: Partial<Record<ModelId, [Matrix4, Matrix4, ColorTextureId, NormalTextureId, number][]>> = {};

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

                // if the attached entity is dead, drop it
                const attachedEntity = joint.attachedEntity;
                if (attachedEntity && attachedEntity.maxHealth && attachedEntity.health <= 0) {
                  attachedEntity['p'] = partPosition;
                  attachedEntity.velocity = [0, 0, 0];
                  joint.attachedEntity = 0;
                  // it will disintegrate on the next tick
                  levelAddEntity(level, attachedEntity);
                }

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
                    luminosity: FLAG_FADE_IN
                        ? Math.min(joint.light, worldTime/5e3)
                        : joint.light,
                  });
                }
                if (renderEntities[entity.id]) {
                  // sometimes the inverse isn't available. The shadows are going to be screwed up for this thing
                  const invertedTransform = matrix4Invert(transform);
                  if (FLAG_DETECT_BROKEN_TRANSFORM && !invertedTransform) {
                    throw new Error(JSON.stringify(transform));
                  }
                  const luma = entity.maxHealth && entity.health < Math.min(entity.maxHealth, HEALTH_FLASH)
                      // flash indicating health
                      ? (
                          Math.sqrt(1 - (entity.health - 1) / HEALTH_FLASH) // should be zero when health is high, 1 when low
                          * (Math.abs(Math.sin(worldTime / 99)) - 1) // oscilates -1 to 0, always -1 when health is 0
                      )
                      // items with no velocity have never been picked up
                      : !entity.velocity && entity.entityType == ENTITY_TYPE_ITEM
                          ? (Math.abs(Math.sin(worldTime / 1e3 + entity.id)))/9
                          : 0;
                  const colorTextureIds = part.colorTextureIds;
                  const normalTextureIds = part.normalTextureIds || [0];
                  const colorTextureId = colorTextureIds[(entity.variantIndex || 0) % colorTextureIds.length];
                  const normalTextureId = normalTextureIds[(entity.variantIndex || 0) % normalTextureIds.length];
                  if (FLAG_INSTANCED_RENDERING && !entity.velocity) {
                    const modelInstancedRenders = instancedRenders[part.modelId]
                        || (instancedRenders[part.modelId] = []);
                    modelInstancedRenders.push([transform, invertedTransform, colorTextureId, normalTextureId, luma])
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
                        [
                          ...lightPositions.flat(2),
                          ...new Array((MAX_LIGHTS - previousLights.length) * 4).fill(0),
                        ],
                    );
    
                    gl.uniformMatrix4fv(uniformModelViewMatrix, false, transform);
                    gl.uniformMatrix4fv(uniformModelViewMatrixInverse, false, invertedTransform);
                    // x = intrinsic lightness multiplier
                    // y = texture id of part
                    gl.uniform3f(
                        uniformModelAttributes,
                        colorTextureId,
                        normalTextureId,
                        luma,
                    );
                
                    const [vao, count] = models[part.modelId];
                    gl.bindVertexArray(vao);
                    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);  
                  }
                }
              },
              entity,
              entity.entityBody,
            );
          }        
        },
    );
    if (FLAG_INSTANCED_RENDERING) {
      // these things don't move, so we don't need to check the light deltas
      gl.uniform4fv(
          uniformLightPositions,
          [
            ...previousLights
                .map(l => {
                  const render = lightRenders[l.entityId];
                  return [...render[2], l.luminosity];
                })
                .flat(2),
            ...new Array((MAX_LIGHTS - previousLights.length) * 4).fill(0)
          ],
      );

      for (let modelId in instancedRenders) {
        const modelInstancedRenders: [Matrix4, Matrix4, ColorTextureId, NormalTextureId, number][] = instancedRenders[modelId];
        const [vao, count] = models[modelId];
        gl.bindVertexArray(vao);
        modelInstancedRenders.forEach(([transform, invertedTransform, ...modelAttributes]) => {
          gl.uniformMatrix4fv(uniformModelViewMatrix, false, transform);
          gl.uniformMatrix4fv(uniformModelViewMatrixInverse, false, invertedTransform);
          
          gl.uniform3fv(uniformModelAttributes, modelAttributes);
      
          gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
        });
      }
    }
    return lights;
  }
  
  const update = (now: number) => {
    const deltaTime = Math.min(now - then, MAX_MILLISECONDS_PER_FRAME);
    worldTime += deltaTime;
    then = now;
    updateCount++;
  
    if (FLAG_SHOW_FPS && fps) {
      fps.innerText = `${Math.floor(updateCount*1000/worldTime)} FPS`;
    }
  
    const playerCenter = entityMidpoint(player);
    const targetCameraZRotation = (-targetCameraOrientation) * CONST_PI_ON_2_2DP;
    const cameraZDelta = mathAngleDiff(cameraZRotation, targetCameraZRotation);
    // TODO can we tween this?
    cameraZRotation += cameraZDelta * deltaTime / 100;
    const cameraRotation = matrix4Rotate(cameraZRotation, 0, 0, 1);
    const negatedPlayerCenter = vectorNScale(playerCenter, -1);
    const cameraPositionMatrix = matrix4Multiply(
        cameraOffsetTransform,
        cameraRotation,
        matrix4Translate(...negatedPlayerCenter),
    );
    const cameraPosition = vector3TransformMatrix4(matrix4Invert(cameraPositionMatrix), 0, 0, 0);
    const cameraRenderCutoffTransform = matrix4Multiply(
      matrix4Translate(0, .5, .2),
      matrix4Rotate(cameraZRotation, 0, 0, 1),
      matrix4Translate(...negatedPlayerCenter),
    );
    const cameraProjectionMatrix = matrix4Multiply(projection, cameraPositionMatrix);
  
    // sort from closest to furthest, with player at 0
    previousLights
        .sort((l1, l2) => {
          const d1 = getLightAppeal(l1, playerCenter);
          const d2 = getLightAppeal(l2, playerCenter);
          return d1 - d2;
        });
    const previousLightsCopy = previousLights;

    // find the oldest texture
    let light: Light | undefined;
    const lightRender: [number, number, number, Vector3] | 0 = previousLights.length > 0
        && (
            !FLAG_THROTTLE_LIGHT_RENDERING
                || !(updateCount % Math.max(1, MAX_LIGHTS - Math.min(previousLights.length, MAX_LIGHTS)))
        )
        && previousLights.slice(0, MAX_LIGHTS).reduce<[number, number, number, Vector3] | 0>((acc, l, i, arr) => {
          const lightRender = lightRenders[l.entityId];
          // find an unused texture
          let availableTextureIndex = 0;
          // there is no accumulator or the accumulator age is > 0
          const needsNewLightRender = !lightRender && (!acc || acc[2]);
          if (needsNewLightRender) {
            const availableTextureIndices = [...CUBE_MAP_LIGHTS_TEXTURE_INDICES];
            let leastAppealingEntityId: string | undefined;
            for (let entityId in lightRenders) {
              const lightRender = lightRenders[entityId];
              availableTextureIndices.splice(availableTextureIndices.indexOf(lightRender[0]), 1);
              // ensure we aren't stealing another active light's texture
              if (!arr.some(light => light.entityId == entityId as any)
                    && (!leastAppealingEntityId
                        || lightRender[1] < lightRenders[leastAppealingEntityId][1])) {
                leastAppealingEntityId = entityId;
              }
            }
            if (availableTextureIndices.length) {
              availableTextureIndex = availableTextureIndices[0];
            } else {
              availableTextureIndex = lightRenders[leastAppealingEntityId][0];
              delete lightRenders[leastAppealingEntityId];
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
        const lightBoundsDimensions = lightIndex
            ? RENDER_DIMENSIONS.map(v => Math.min(v, light.luminosity * 2 * MAX_LIGHT_THROW)) as Vector3
            : RENDER_DIMENSIONS;
        const lightBoundsPosition = light.pos.map(
            (v, i) => v - lightBoundsDimensions[i]/2,
        ) as Vector3;
        updateAndRenderLevel(
            faceCameraTransform,
            light.pos,
            lightBoundsPosition,
            lightBoundsDimensions,
            [],
            // first index is the player line of sight, so it's a special case
            // for everything else, just exclude the actual lit object
            e => e.collisionGroup != COLLISION_GROUP_WALL && !lightIndex
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
        [
          ...previousLights.map<number>(l => {
            return lightRenders[l.entityId][0];
          }),
          ...new Array(MAX_LIGHTS - previousLights.length).fill(MAX_LIGHTS),
        ],
    );
  
    const renderPosition = RENDER_DIMENSIONS.map((v, i) => playerCenter[i] - v/2) as Vector3;
    if (renderPosition[2] + RENDER_DIMENSIONS[2] > level.dimensions[2]) {
      // time to generate some more layers
      levelAppendLayers(level, LEVEL_LAYER_CHUNK_SIZE);

      if (FLAG_CLEAR_PREVIOUSLY_PICKED_UP_ARRAY) {
        // clear it out for performance reasons
        previouslyPickedUpEntities = [];
      }
    }

    previousPreviousLights = previousLights;
    previousLights = updateAndRenderLevel(
        cameraProjectionMatrix,
        cameraPosition,
        renderPosition,
        RENDER_DIMENSIONS,
        previousLights,
        (entity: Entity, carrier?: Entity) => {
          // update animations
          if (!entity.joints && entity.entityBody.defaultJointRotations) {
            entity.joints = entity.entityBody.defaultJointRotations.map(rotation => ({
              ['r']: [...rotation],
            }));
          }
          [...(entity.joints || []), entity].forEach((joint: Joint) => {
            if (joint.anim && joint.anim?.(worldTime)) {
              joint.anim = 0;
              joint.animAction = 0;
            }
            const attachedEntity = joint.attachedEntity;
            if (attachedEntity) {
              // update attached entity
              if (attachedEntity.entityType == ENTITY_TYPE_TORCH) {
                attachedEntity.health = Math.max(0, attachedEntity.health - deltaTime / TORCH_MS_PER_HEALTH);
                attachedEntity.joints[TORCH_PART_ID_HEAD].light = 
                    (1 - Math.pow(1 - attachedEntity.health/attachedEntity.maxHealth, 9)) * TORCH_BRIGHTNESS;
              }
            }
          });
          if (entity.offsetAnim && entity.offsetAnim(worldTime)) {
            entity.offsetAnim = 0;
          }
  
          if (entity.velocity && !carrier) {
            let action: ActionId | 0 = 0;
            const availableActions = entityAvailableActions(entity);
            const definitelyOnGround = entity.lastZCollision >= worldTime - deltaTime;
            const probablyOnGround = entity.lastZCollision > worldTime - MAX_JUMP_DELAY;
            let targetVelocity: Vector3 = definitelyOnGround ? [0, 0, entity.velocity[2]] : [...entity.velocity];
            let ignoreLateralAcceleration: Booleanish;
            let targetOrientation = entity.oriented;
            let pickUpOrDrop = 0;
            let useSecondary = 0;
            const entityCenter = entityMidpoint(entity);
  
            levelRemoveEntity(level, entity);
  
            if (entity == player) {
              const canIdle = availableActions & ACTION_ID_IDLE;
              const canWalk = availableActions & ACTION_ID_WALK;
              const canRun = availableActions & ACTION_ID_RUN;
              const canJump = availableActions & ACTION_ID_JUMP;
              const canDuck = availableActions & ACTION_ID_DUCK;
              const canLightAttack = availableActions & ACTION_ID_ATTACK_LIGHT;
              const canHeavyAttack = availableActions & ACTION_ID_ATTACK_HEAVY;
              const canUseSecondary = availableActions & ACTION_ID_USE_SECONDARY;
      
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
                pickUpOrDrop = inputRead(INPUT_INTERACT, now);
              } else {
                useSecondary = inputRead(INPUT_INTERACT, now);
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
  
              const cameraDelta = entity.oriented % 2 - targetCameraOrientation % 2
              const canTurn = availableActions & ACTION_ID_TURN && (cameraDelta || running);
  
              const walkingBackward = entity.oriented == targetCameraOrientation && left
                  || entity.oriented != targetCameraOrientation && right;
  
              let targetLateralSpeed = canWalk
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
              if (canLightAttack && lightAttack) {
                action = ACTION_ID_ATTACK_LIGHT;
              }
              if (canHeavyAttack && heavyAttack) {
                action = ACTION_ID_ATTACK_HEAVY;
              }
              if (canUseSecondary && useSecondary) {
                action = ACTION_ID_USE_SECONDARY;
              }
  
              if (action == ACTION_ID_JUMP) {
                if (walkingBackward) {
                  targetLateralSpeed = (right - left) * SKELETON_WALK_SPEED * 2;
                  ignoreLateralAcceleration = 1;
                  targetVelocity[2] = .001;
                } else {
                  targetVelocity[2] = .003;
                }
              }
  
              if (definitelyOnGround) {
                targetVelocity = vector3TransformMatrix4(
                    matrix4Rotate(-targetCameraZRotation, 0, 0, 1),
                    targetLateralSpeed,
                    0,
                    targetVelocity[2],
                );
              }
              if ((
                  cameraDelta
                      || entity.oriented == targetCameraOrientation && left
                      || (entity.oriented + 2) % 4 == targetCameraOrientation && right
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
              if (entity.entityType == ENTITY_TYPE_MONSTER) {
                entity.aggro = Math.max(0, (entity.aggro || 0) - deltaTime);
                // AI
                if ((!entity.activePathTime
                    || entity.activePathTime < worldTime - AI_RECALCULATION_TIME) && !entity.aggro
                    // they've been hit
                    || FLAG_AGGRO_ON_HIT && !entity.activeTarget && !entity.aggro
                ){
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
                          targetValue = 2;
                        }
                        if (
                            target.entityBody.jointAttachmentHolderPartId
                                && !entity.joints[target.entityBody.jointAttachmentHolderPartId].attachedEntity
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
                const activeTarget = entity.activeTarget;
                if (activeTarget) {
                  // are we close enough to move directly to and/or interact with the target?
                  const delta = vectorNSubtract(entityMidpoint(activeTarget), entityCenter);
                  const distances = delta.map(
                      (v, i) => Math.max(0, Math.abs(v) - (entity.dimensions[i] + activeTarget.dimensions[i])/2),
                  );
                  const distance = vectorNLength(distances);
                  if (distance < AI_DIRECT_MOVE_RADIUS + Math.sqrt(entity.aggro/99)) {
                    if (activeTarget.lastZCollision > worldTime - deltaTime*2) {
                      // aggro will fade if distance > 1
                      entity.aggro += deltaTime / distance; 
                    } else {
                      // if the target is jumping/falling we probably don't want to follow them
                      entity.aggro /= deltaTime; 
                    }
                    // walk in that direction
                    // account for target size and weapon range
                    let targetAction: ActionId | 0 = 0;
  
                    let minActionRangeMultiplier = 0;
                    if (activeTarget.entityType == ENTITY_TYPE_PLAYER) {
                      // find best attack for range
                      if (FLAG_AI_USE_HEAVY_ATTACKS) {
                        const attackActions: ActionId[] = [ACTION_ID_ATTACK_LIGHT, ACTION_ID_ATTACK_HEAVY, ACTION_ID_USE_SECONDARY];
                        targetAction = attackActions
                            .map<[ActionId, number]>(action => {
                              const actionAnimations = entityGetActionAnims(entity, action);
                              const delta = entity.joints.some(v => v.animAction == action)
                                  // strongly prefer the existing action
                                  ? 0
                                  // if the action specifies no range, we assume it's not an attack and want the
                                  // target to actually be as far away as possible
                                  : Math.abs(distance - ((actionAnimations.range * (entity.scaled || 1)) || AI_DIRECT_MOVE_RADIUS));
                                  
                              return [action, delta];
                            })
                            .sort((d1, d2) => d1[1] - d2[1])[0][0];
                      } else {
                        targetAction = ACTION_ID_ATTACK_LIGHT;
                      }
                      minActionRangeMultiplier = .8;
                    } else {
                      targetAction = ACTION_ID_DUCK;
                    }
                    const animations = entityGetActionAnims(entity, targetAction);
                    const maxActionRange = (animations.range * (entity.scaled || 1)) || 0;
                    const minActionRange = maxActionRange * minActionRangeMultiplier;
                    const targetActionAvailable = !targetAction || (availableActions & targetAction);
                    const doingTargetAction = entity.joints.some(joint => joint.animAction == targetAction);
                    const inRange = distance <= maxActionRange && distance >= minActionRange;
  
                    // look at target
                    const validOrientations: Orientation[] = new Array(2).fill(0).map<Orientation[]>((_, i) => {
                      if (distances[i] > maxActionRange || distances[i] > 0 && distances[(i+1)%2] > maxActionRange) {
                        return [i + (delta[i] > 0 ? ORIENTATION_EAST : ORIENTATION_WEST)] as Orientation[];
                      }
                      return [];
                    }).flat();
                    
                    if (validOrientations.indexOf(targetOrientation) < 0 && validOrientations.length) {
                      // array can be empty
                      targetOrientation = validOrientations[0];
                    }
  
                    if (animations && targetAction && targetActionAvailable && inRange) {
                      action = targetAction;
                      if (targetAction == ACTION_ID_DUCK) {
                        pickUpOrDrop = 1;
                      }
                    } else if ((availableActions & ACTION_ID_WALK)
                        && definitelyOnGround
                        && (!inRange || !targetActionAvailable)
                    ){
                      // stay back a bit if the desired action isn't available
                      const direction = targetActionAvailable || doingTargetAction
                          ? (distance - minActionRange)/Math.abs(distance - minActionRange)
                          : -1;
                      action = direction > 0 ? ACTION_ID_WALK : ACTION_ID_WALK_BACKWARD;
                      targetVelocity = vector3TransformMatrix4(
                          matrix4Rotate(targetOrientation * CONST_PI_ON_2_2DP, 0, 0, 1),
                          direction * (direction > 0 ? SKELETON_WALK_SPEED : SKELETON_WALK_SPEED/2),
                          0,
                          entity.velocity[2],
                      );
                    }
                  }
                }
              }
            }
  
            if (targetOrientation != entity.oriented) {
              entity.oriented = targetOrientation;
              const targetAngle = targetOrientation * CONST_PI_ON_2_2DP;
              const to: Vector3 = [0, 0, targetAngle];
              entity.anim = animLerp(
                  worldTime,
                  entity,
                  'r',
                  to,
                  299,
                  EASINGS[EASE_IN_OUT_QUAD],
                  1,
              );
              // action = ACTION_ID_TURN;
            }
  
            if (pickUpOrDrop) {
              // find any entities we might be able to pick up
              let pickedUp: Entity | undefined;
              const pickUpDimensions = entity.dimensions.map((v, i) => v + (i != 2 ? PICK_UP_ITEM_RADIUS * 2 : 0)) as Vector3;
              const pickUpPosition = entityCenter.map((v, i) => v - pickUpDimensions[i]/2) as Vector3;
              levelIterateEntitiesInBounds(level, pickUpPosition, pickUpDimensions, found => {
                // NOTE: while 0 is a valid part id, we assume it's not used for extremities
                if (found.entityBody.jointAttachmentHolderPartId
                      // prever to pick up things we have either not picked up before, or picked up a long time ago
                      && (!pickedUp || previouslyPickedUpEntities.indexOf(found) < previouslyPickedUpEntities.indexOf(pickedUp))
                ) {
                  pickedUp = found;
                }
              });

              // drop whatever we are carrying
              const joint = entity.joints.find(
                  (joint, partId) => joint.attachedEntity && (!pickedUp || partId == pickedUp.entityBody.jointAttachmentHolderPartId),
              );
              if (joint) {
                // add the attached entity back into the world
                const held = joint.attachedEntity as Entity;
                if (FLAG_DROP_ITEMS_FORWARD) {
                  const delta = ORIENTATION_OFFSETS[entity.oriented];
                  held['p'] = entityCenter.map(
                      (v, i) => v + ((entity.dimensions[i] - held.dimensions[i]) * (delta[i] || 0) - held.dimensions[i])/2,
                  ) as Vector3;
                  held.velocity = entity.velocity.map(((v, i) => v + (delta[i] || .5) * .001)) as Vector3;
                } else {
                  held['p'] = entityCenter.map(
                      (v, i) => v + (entity.dimensions[i] - held.dimensions[i])/2,
                  ) as Vector3;
                  // should already have 0 speed
                  //held.velocity = [0, 0, 0];
                }
                held['r'] = entity['r'];
                levelAddEntity(level, held);
                joint.attachedEntity = 0;
              }
              if (pickedUp) {
                const index = previouslyPickedUpEntities.indexOf(pickedUp);
                if (index >= 0) {
                  previouslyPickedUpEntities.splice(index, 1);
                }
                previouslyPickedUpEntities.push(pickedUp);
                levelRemoveEntity(level, pickedUp);
                pickedUp.velocity = [0, 0, 0];
                entity.joints[pickedUp.entityBody.jointAttachmentHolderPartId].attachedEntity = pickedUp;
                entity.activeTarget = 0;
              }
            }
  
            const movable = entity as Moveable;
            
            // limit velocity
            movable.velocity = movable.velocity.map((c, i) => {
              const v = targetVelocity[i];
              let velocity = v;
              if (i < 2 && entity.acc && !ignoreLateralAcceleration) {
                const diff = v - c;
                velocity = c + diff * entity.acc * deltaTime;
              }
              return Math.min(
                  MAX_VELOCITY,
                  Math.max(
                      -MAX_VELOCITY,
                      velocity,
                  )
              );
            }) as Vector3;
  
            // move toward centerline of cross-orientation
            if (entity.oriented != null && deltaTime) {
              const crossAxis = (entity.oriented + 1) % 2;
              
              const center = entityCenter[crossAxis]; 
              const rail = (center | 0) + .5;
              const diff = rail - center;
              entity.velocity[crossAxis] = Math.max(
                  -Math.abs(diff/deltaTime), 
                  Math.min(
                      Math.abs(diff/deltaTime),
                      diff * RAIL_ALIGNMENT_VELOCITY,
                  ),
              );
            }
            // add in gravity
            movable.velocity[2] -= deltaTime * GRAVITY;
  
            // check attacking
            const attacking = entity.joints.some((joint, jointId) => {
              return joint.animAction && entityGetActionAnims(entity, joint.animAction)
                  ?.sequences[joint.animActionIndex]
                  ?.[jointId]
                  ?.[ENTITY_CHILD_PART_ANIMATION_DAMAGE_INDEX]
            });
            if (attacking) {
              // get a big area (we don't know how large the animations are)
              const position = entity.p.map(v => v - MAX_ATTACK_RADIUS) as Vector3;
              const dimensions = entity.dimensions.map(v => v + MAX_ATTACK_RADIUS * 2) as Vector3;
              levelIterateEntitiesInBounds(level, position, dimensions, victim => {
                // work out the most appropriate action for each victim
                if (!(victim.invulnerableUntil > worldTime)) {
                  let maxDamage = 0;
                  let maxWeapon: Entity | undefined;
                  let blocked: Booleanish;
                    entityIterateParts((weaponEntity, entityPart, entityTransform, entityJoint, entityPartDamage) => {
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
                            const damage = (entityPartDamage + (weaponEntity?.variantIndex || 0))
                                * (weaponEntity.scaled || 1)
                                * (victimPart.incomingDamageMultiplier || 0);
                            if (damage > maxDamage) {
                              maxDamage = damage;
                              maxWeapon = weaponEntity;
                            }
                            if (!blocked) {
                              blocked = !!victimDamageMultiplier || victimPart.incomingDamageMultiplier < 0;
                              if (blocked) {
                                maxWeapon = weaponEntity;
                              } 
                            }
                          }
                        }
                      }, victim, victim.entityBody);
                    }
                  }, entity, entity.entityBody);
    
                  const victimVelocity = vectorNAdd<Vector3>(
                      victim.velocity || [0, 0, 0],
                      vectorNScale(
                          vectorNNormalize(
                            vectorNSubtract(
                                entityMidpoint(victim),
                                entityMidpoint(entity),
                            )
                          ),
                          .001
                              * Math.max(maxWeapon?.entityBody.pushback || 1) 
                              * (maxWeapon?.scaled || 1) / (victim.scaled || 1),
                      ),
                  );
                  if (blocked) {
                    // start the attack cancel animation
                    action = ACTION_ID_CANCEL;
                  } else if (maxDamage) {
                    // start the damage received animation
                    victim.health -= maxDamage;
                    if (FLAG_AGGRO_ON_HIT) {
                      victim.aggro += 1e3;
                    }
                    victim.invulnerableUntil = worldTime + DAMAGE_INVULNERABILITY_DURATION;
                    entityStartAnimation(worldTime, victim, ACTION_ID_TAKE_DAMAGE);
                  }
                  if (blocked || maxDamage) {
                    if (victim.velocity) {
                      victim.velocity = victimVelocity;
                    }
                    if (maxWeapon && maxWeapon != entity && maxWeapon.maxHealth) {
                      // damage the weapon
                      maxWeapon.health--;
                    }
                  }
                }
              });
            }
  
            // check collisions
            let iterations = 0;
            let maxOverlapIndex: number;
            let remainingDelta = deltaTime;
            let maxIntersectionArea = 0;
            let verticalIntersectionCount = 0;
  
            do {
              const targetPosition = entity['p'].map((v, i) => v + entity.velocity[i] * remainingDelta) as Vector3;
              const maximalPosition = entity['p'].map((v, i) => Math.min(v, targetPosition[i]) - EPSILON) as Vector3;
              const maximalDimensions = entity.dimensions.map(
                  (v, i) => v + Math.abs(targetPosition[i] - entity['p'][i]) + EPSILON * 2,
              ) as Vector3;
  
              let maxOverlapDelta = 0;
              // TODO might need initialisers for CC
              let maxCollisionEntity: Entity | Falsey = 0 as any;
              let hadSoftBodyCollision: Booleanish = 0;
  
              maxOverlapIndex = -1;
              levelIterateEntitiesInBounds(level, maximalPosition, maximalDimensions, collisionEntity => {
                // no need to check for ourselves since we have been removed from the level at this point
                if (!(collisionEntity.collisionGroup & entity.collisionMask)) {
                  return;
                }
                const startingIntersection = rect3Intersection(
                  entity['p'],
                  entity.dimensions,
                  collisionEntity['p'],
                  collisionEntity.dimensions,
                );
                if (FLAG_DEBUG_COLLISIONS && startingIntersection.every(v => v > 0)) {
                    console.log('collions', iterations);
                    console.log('started inside');
                    console.log('position', entity['p']);
                    console.log('dimensions', entity.dimensions);
                    console.log('velocity', entity.velocity);
                    console.log('collision position', collisionEntity['p']);
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
                    collisionEntity['p'],
                    collisionEntity.dimensions,
                );
                if (FLAG_DEBUG_COLLISIONS) {
                  if (!entity['previousIntersection']) {
                    entity['previousIntersection'] = {};
                  }
                  entity['previousIntersection'][collisionEntity.id] = intersection;
                }
  
                if (!intersection.some(v => v < 0)) {
                  if (collisionEntity.entityType == ENTITY_TYPE_SPIKE) {
                    const spikeInverse = matrix4Invert(matrix4RotateInOrder(...collisionEntity['r']));
                    const inverseVelocity = vector3TransformMatrix4(spikeInverse, ...entity.velocity);
                    // only get hurt if we hit it front on
                    if (inverseVelocity[0] < -SKELETON_WALK_SPEED*2 && !(entity.invulnerableUntil > worldTime)) {
                      action = ACTION_ID_TAKE_DAMAGE;
                      entity.health--;
                      entity.invulnerableUntil = worldTime + DAMAGE_INVULNERABILITY_DURATION;
                    }
                  } else if (collisionEntity.velocity) {
                    // only do soft collisions in first iteration
                    if (!iterations && entity.entityType != ENTITY_TYPE_SPIKE) {
                      // soft collisions with other movable objects
                      const entityCenter = entityMidpoint(entity);
                      const collisionEntityCenter = entityMidpoint(collisionEntity);
                      const diffs = vectorNSubtract(entityCenter, collisionEntityCenter);
                      diffs.forEach((diff, i) => {
                        const maxDiff = (entity.dimensions[i] + collisionEntity.dimensions[i])/2;
                        const dv = (1 - diff/maxDiff)/5e3;
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
              iterations ++;
              if (!hadSoftBodyCollision) {
                const moveDelta = Math.max(0, remainingDelta - maxOverlapDelta) - EPSILON;
                remainingDelta = maxOverlapDelta;
                if (FLAG_DEBUG_COLLISIONS) {
                  entity['previousPosition'] = [...entity['p']];
                  entity['previousVelocity'] = [...entity.velocity];
                  entity['previousMoveDelta'] = moveDelta;
                  entity['previousCollisions'] = iterations;
                  entity['previousMaximalPosition'] = maximalPosition;
                  entity['previousMaximalDimensions'] = maximalDimensions;  
                  entity['previousTargetPosition'] = targetPosition;
                }
                entity['p'] = entity['p'].map((v, i) => v + entity.velocity[i] * moveDelta) as Vector3;
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
                  if (maxOverlapIndex != 2
                      && (entity.entityType == ENTITY_TYPE_MONSTER || entity.entityType == ENTITY_TYPE_PLAYER)
                      && entity['p'][2] > maxCollisionEntity['p'][2] + maxCollisionEntity.dimensions[2] - STEP_DEPTH - EPSILON
                  ) {
                    verticalIntersectionCount++;
                  }
                  entity.velocity[maxOverlapIndex] = 0;
                  if (maxOverlapIndex == 2) {
                    entity.lastZCollision = worldTime;
                  }
                }
              }
            } while ((remainingDelta > EPSILON) && iterations < MAX_COLLISIONS);
  
            if (verticalIntersectionCount == 1) {
              entity.velocity[2] = Math.max(.0012, entity.velocity[2]);
              // steps count as a z collision
              entity.lastZCollision = worldTime;
            }
  
            if (FLAG_DEBUG_COLLISIONS && iterations >= MAX_COLLISIONS) {
              console.log('too many collisions');
            }
  
            if (!entity.maxHealth || entity.health > 0) {
              // start new animations
              entityStartAnimation(worldTime, entity, action);
              levelAddEntity(level, entity);
            } else {
              // collapse
              entityIterateParts((e, part, transform, joint) => {
                const position = vector3TransformMatrix4(transform, 0, 0, 0);
                let partEntity: Entity;
                if (e == entity) {
                  // turn their body parts into items
                  partEntity = entityCreate({
                    // create generic self-contained entity for each body part
                    entityBody: {
                      ...part,
                      id: 0,
                      preRotationTransform: 0,
                      childs: [],
                    },
                    joints: [{ 
                      ...joint,
                      animAction: 0,
                      attachedEntity: 0,
                      ['r']: [0, 0, 0],
                    }],
                    variantIndex: entity.variantIndex,
                    scaled: entity.scaled,
                    // inherit your parent health
                    health: entity.maxHealth,
                    maxHealth: entity.maxHealth,
                    collisionGroup: COLLISION_GROUP_ITEM,
                    // turn anything that can be held into an item (maybe)
                    collisionMask: Math.random() < .5
                        // only create objects that have bounds defined
                        && part.dimensions
                        ? COLLISION_GROUP_WALL
                        : 0,
                    dimensions: (part.dimensions || [0, 0, 0]).map(v => v * (entity.scaled || 1)) as Vector3,
                    // TODO center on position will be more accurate
                    ['p']: position,
                    // TODO use current rotation 
                    ['r']: [0, 0, Math.random() * CONST_2_PI_0DP],
                  });
                } else {
                  // drop whatever they're holding
                  partEntity = e;
                  partEntity['p'] = position;
                }
                if (partEntity) {
                  partEntity.velocity = entity.velocity
                      .map(v => v + (Math.random() - .5) * .001) as Vector3;
                  levelAddEntity(level, partEntity);
                }
              }, entity, entity.entityBody);            
            }
          }
  
          const entityCenter = entityMidpoint(carrier || entity);
          const [cx, cy, cz] = vector3TransformMatrix4(cameraRenderCutoffTransform, ...entityCenter);
          return cy < 0
              && (cz > 0 && !entity.velocity || cz > 1)
              // flicker if we have been damaged
              || (entity.invulnerableUntil > worldTime)
                  && ((worldTime/MAX_MILLISECONDS_PER_FRAME | 0) % 2) as Booleanish;
        },
        light,
    );
  
    animationFrame = window.requestAnimationFrame(update);
  };
  update(0);
};

