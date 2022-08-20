type Matrix4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
];

const FLAG_INLINE_IDENTITY_MATRIX = false;

const MATRIX4_IDENTITY: Matrix4 = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
];

const matrix4Identity = (): Matrix4 => {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

const matrix4Invert = (a: Matrix4): Matrix4 => {

  // TODO there's got to be a couple of loops that can achieve this effectively (and smaller)
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;

  // Calculate the determinant
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (det) {
    det = 1 / det;
    return [
      (a11 * b11 - a12 * b10 + a13 * b09) * det, (a02 * b10 - a01 * b11 - a03 * b09) * det, (a31 * b05 - a32 * b04 + a33 * b03) * det, (a22 * b04 - a21 * b05 - a23 * b03) * det,
      (a12 * b08 - a10 * b11 - a13 * b07) * det, (a00 * b11 - a02 * b08 + a03 * b07) * det, (a32 * b02 - a30 * b05 - a33 * b01) * det, (a20 * b05 - a22 * b02 + a23 * b01) * det,
      (a10 * b10 - a11 * b08 + a13 * b06) * det, (a01 * b08 - a00 * b10 - a03 * b06) * det, (a30 * b04 - a31 * b02 + a33 * b00) * det, (a21 * b02 - a20 * b04 - a23 * b00) * det,
      (a11 * b07 - a10 * b09 - a12 * b06) * det, (a00 * b09 - a01 * b07 + a02 * b06) * det, (a31 * b01 - a30 * b03 - a32 * b00) * det, (a20 * b03 - a21 * b01 + a22 * b00) * det
    ]
  }
}

const matrix4Multiply = (baseMatrix: Matrix4 | Falsey, ...matrices: (Matrix4 | Falsey)[]): Matrix4 => {
  return matrices.reduce<Matrix4>(
      (a: Matrix4, b: Matrix4 | Falsey): Matrix4 => {
        if (b) {
          const out: Matrix4 = [] as any;
          for( let x=0; x<16; x++ ) {
            let i = x >> 2;
            let j = x % 4;
            let v = 0;
            for(let k=0; k<4; k++ ) {
              v += a[i + k * 4] * b[k + j * 4];
            }
            out[i + j * 4] = v;
          }
          return out as any;  
        }
        return a;
      },
      baseMatrix || matrix4Identity(),
  );
}

const matrix4Perspective = (tanFovyDiv2: number, aspect: number, znear: number, zfar: number): Matrix4 => {

  /*
  var top = znear * tan(fovy / 2);
  var bottom = -top;
  var left = bottom * aspect;
  var right = top * aspect;
  var X = 2 * znear / (right - left);
  var Y = 2 * znear / (top - bottom);
  var A = (right + left) / (right - left);
  var B = (top + bottom) / (top - bottom);
  var C = -(zfar + znear) / (zfar - znear);
  var D = -2 * zfar * znear / (zfar - znear);
  return [
      X, 0, 0, 0,
      0, Y, 0, 0,
      A, B, C, -1,
      0, 0, D, 0
  ];
  */
  let f = 1 / tanFovyDiv2;
  let nf = 1 / (znear - zfar);
  return [
    f/aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (zfar + znear) * nf, -1,
    0, 0, (2 * zfar * znear) * nf, 0
  ];
}

const matrix4InfinitePerspective = (tanFovyDiv2: number, aspect: number, znear: number): Matrix4 => {
  let f = 1 / tanFovyDiv2;
  return [
    f/aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, -1, -1, 
    0, 0, -2 * znear, 0
  ];
};

const matrix4PerspectiveFlippedY = (tanFovyDiv2: number, aspect: number, znear: number, zfar: number): Matrix4 => {
  let f = 1 / tanFovyDiv2;
  let nf = 1 / (znear - zfar);
  return [
    f/aspect, 0, 0, 0,
    0, -f, 0, 0,
    0, 0, (zfar + znear) * nf, -1,
    0, 0, 2 * zfar * znear * nf, 0
  ];
}

const matrix4RotateInOrder = (rx: number, ry: number, rz: number): Matrix4 => {
  return matrix4Multiply(
      matrix4Rotate(rx, 1, 0, 0),
      matrix4Rotate(ry, 0, 1, 0),
      matrix4Rotate(rz, 0, 0, 1),
  );
}

const matrix4Rotate = (rad: number, x: number, y: number, z: number): Matrix4 => {
  let s_, c_, t_;

  s_ = Math.sin(rad);
  c_ = Math.cos(rad);
  t_ = 1 - c_;
  // NOTE: xyz and zxy the 'depth' axis points in different directions
  // (toward the screen for z, away from the screen for y)
  return [
    // b00                b01                   b02
    x * x * t_ + c_,      y * x * t_ + z * s_,  z * x * t_ - y * s_,  0,
    // b10                b11                   b12
    x * y * t_ - z * s_,  y * y * t_ + c_,      z * y * t_ + x * s_,  0,
    // b20                b21                   b22
    x * z * t_ + y * s_,  y * z * t_ - x * s_,  z * z * t_ + c_,      0,
    0,                    0,                    0,                    1
  ];
}

const matrix4Scale = (x: number, y: number = x, z: number = y): Matrix4 => {
  return [
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1
  ];
}

const matrix4Translate = (x: number, y: number, z: number): Matrix4 => {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1
  ];
}

const matrix4Transpose = (m: Matrix4): Matrix4 => {
  return [
    m[0], m[4], m[8], m[12],
    m[1], m[5], m[9], m[13],
    m[2], m[6], m[10], m[14],
    m[3], m[7], m[11], m[15],
  ];
}