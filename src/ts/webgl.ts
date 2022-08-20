
//
// creates a shader of the given type, uploads the source and
// compiles it.
//
const loadShader = (gl: WebGL2RenderingContext, type: number, source: string) => {

  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (FLAG_SHOW_GL_ERRORS && !gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ', gl.getShaderInfoLog(shader));
    source.split('\n').map((line, lineNumber) => {
      console.log(lineNumber+1, line);
    });

    gl.deleteShader(shader);
    return;
  }

  return shader;
}