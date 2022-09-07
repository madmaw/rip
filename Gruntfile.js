module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      ts: {
          default: {
              tsconfig: './tsconfig.json'
          }
      },
      watch: {
          default: {
              files: ["src/ts/**/*", "src/d.ts/**/*", "index.html", "index.css", "i.bmp"],
              tasks: ['ts:default'],
              options: {
                  livereload: true
              }
          }
      },
      connect: {
          server: {
              options: {
                  livereload: true
              }
          }
      },
      clean: {
          all: ["build", "dist", "dist.zip", "js13k.zip"]
      },
      'closure-compiler': {
          es2020: {
              closurePath: 'libbuild/closure-compiler-v20220719',
              js: 'build/out.js',
              jsOutputFile: 'dist/out.min.js',
              maxBuffer: 500,
              reportFile: 'closure.txt',
              options: {
                  compilation_level: 'ADVANCED_OPTIMIZATIONS',
                  language_in: 'ECMASCRIPT_2020',
                  language_out: 'ECMASCRIPT_2020',
                  externs: 'src/externs/externs.js',
                  create_source_map: "true",
              }
          },
          es5: {
              closurePath: 'libbuild/closure-compiler-v20220719',
              js: 'build/out.js',
              jsOutputFile: 'dist/out.min.js',
              maxBuffer: 500,
              reportFile: 'closure.txt',
              options: {
                  compilation_level: 'ADVANCED_OPTIMIZATIONS',
                  language_in: 'ECMASCRIPT_2020',
                  language_out: 'ECMASCRIPT5',
                  externs: 'src/externs/externs.js'
              }
          }
      },
      cssmin: {
        options: {
        },
        target: {
            files: {
            'dist/index.css': ['dist/index.css']
            }
        }
      },
      htmlmin: {
        dist: {
          options: {
            removeComments: true,
            collapseWhitespace: true
          },
          files: {
            'dist/index.html': 'dist/index.html'
          }
        }
      },
      inline: {
          dist: {
              src: 'dist/index.html',
              dest: 'dist/index.html'
          }
      },
      replace: {
          hax: {
            src: ['build/out.js'],
            overwrite: true,
            replacements: [
              // turn on production mode
              {
                from: /ENVIRONMENT = '\w+';/g,
                to: "ENVIRONMENT = 'ultra';"
              },
              // remove all consts so CC can aggregate consecutive declarations
              { 
                from: /(\s)const(\s)/g, 
                to: "$1let$2"
              },
              // webgl constants
              { from: "gl.RENDERBUFFER", to: "0x8D41" },
              { from: "gl.FRAMEBUFFER", to: "0x8D40" },
              { from: "gl.DEPTH_COMPONENT16", to: "0x81A5" },
              { from: "gl.DEPTH_ATTACHMENT", to: "0x8D00" },
              { from: "gl.FRAGMENT_SHADER", to: "0x8B30" },
              { from: "gl.ELEMENT_ARRAY_BUFFER", to: "0x8893" },
              { from: "gl.COLOR_ATTACHMENT0", to: "0x8CE0" },
              { from: "gl.DEPTH_TEST", to: "0x0B71" },
              { from: "gl.CULL_FACE", to: "0x0B44" },
              { from: "gl.BLEND", to: "0x0BE2" },
              { from: "gl.LESS", to: "0x0201" },
              { from: "gl.LEQUAL", to: "0x0203" },
              { from: "gl.FRONT", to: "0x0404" },
              { from: "gl.BACK", to: "0x0405" },
              { from: "gl.COLOR_BUFFER_BIT", to: "0x4000" },
              { from: "gl.DEPTH_BUFFER_BIT", to: "0x100" },
              { from: "gl.TEXTURE_2D", to: "0x0DE1" },
              { from: "gl.RGBA", to: "0x1908" },
              { from: "gl.UNSIGNED_SHORT", to: "0x1403" },
              { from: "gl.TRIANGLES", to: "0x0004" },
              { from: "gl.TEXTURE0", to: "0x84C0" },
              { from: "gl.TEXTURE1", to: "0x84C1" },
              { from: "gl.TEXTURE2", to: "0x84C2" },
              { from: "gl.ARRAY_BUFFER", to: "0x8892" },
              { from: "gl.TEXTURE_MAG_FILTER", to: "10240" },
              { from: "gl.NEAREST", to: "9728" },
              { from: "gl.TEXTURE_MIN_FILTER", to: "10241" },
              { from: "gl.SRC_ALPHA", to: "770" },
              { from: "gl.ONE_MINUS_SRC_ALPHA", to: "771" },
              { from: "gl.FLOAT", to: "5126" },
              { from: "gl.STATIC_DRAW", to: "0x88E4" },
              { from: "gl.VERTEX_SHADER", to: "0x8B31" },
              { from: "gl.LINK_STATUS", to: "0x8B82" },
              { from: "gl.CLAMP_TO_EDGE", to: "33071" }, { from: "gl.DEPTH_COMPONENT", to: "6402" }, { from: "gl.TEXTURE_3D", to: "32879" }, { from: "gl.TEXTURE_BASE_LEVEL", to: "33084" }, { from: "gl.TEXTURE_CUBE_MAP_POSITIVE_X", to: "34069" }, { from: "gl.TEXTURE_CUBE_MAP", to: "34067" }, { from: "gl.TEXTURE_MAX_LEVEL", to: "33085" }, { from: "gl.TEXTURE_WRAP_R", to: "32882" }, { from: "gl.TEXTURE_WRAP_S", to: "10242" }, { from: "gl.TEXTURE_WRAP_T", to: "10243" }, { from: "gl.UNSIGNED_BYTE", to: "5121" }, 

              // webgl
              { from: "gl.canvas(", to: "gl['cas'](" }, { from: "gl.drawingBufferWidth(", to: "gl['drBWh'](" }, { from: "gl.drawingBufferHeight(", to: "gl['drBHt'](" }, { from: "gl.activeTexture(", to: "gl['acTe'](" }, { from: "gl.attachShader(", to: "gl['atSr'](" }, { from: "gl.beginQuery(", to: "gl['beQy'](" }, { from: "gl.beginTransformFeedback(", to: "gl['beTFk'](" }, { from: "gl.bindAttribLocation(", to: "gl['biALn'](" }, { from: "gl.bindBufferBase(", to: "gl['biBBe'](" }, { from: "gl.bindBufferRange(", to: "gl['biBRe'](" }, { from: "gl.bindRenderbuffer(", to: "gl['biRr'](" }, { from: "gl.bindSampler(", to: "gl['biSr'](" }, { from: "gl.bindTransformFeedback(", to: "gl['biTFk'](" }, { from: "gl.bindVertexArray(", to: "gl['biVAy'](" }, { from: "gl.blendColor(", to: "gl['blCr'](" }, { from: "gl.blendEquation(", to: "gl['blEn'](" }, { from: "gl.blendEquationSeparate(", to: "gl['blESe'](" }, { from: "gl.blendFunc(", to: "gl['blFc'](" }, { from: "gl.blendFuncSeparate(", to: "gl['blFSe'](" }, { from: "gl.blitFramebuffer(", to: "gl['blFr'](" }, { from: "gl.bufferData(", to: "gl['buDa'](" }, { from: "gl.bufferSubData(", to: "gl['buSDa'](" }, { from: "gl.checkFramebufferStatus(", to: "gl['chFSs'](" }, { from: "gl.clientWaitSync(", to: "gl['clWSc'](" }, { from: "gl.compileShader(", to: "gl['coSr'](" }, { from: "gl.compressedTexImage2D(", to: "gl['coTI2D'](" }, { from: "gl.compressedTexImage3D(", to: "gl['coTI3D'](" }, { from: "gl.compressedTexSubImage2D(", to: "gl['coTSI2D'](" }, { from: "gl.compressedTexSubImage3D(", to: "gl['coTSI3D'](" }, { from: "gl.copyBufferSubData(", to: "gl['coBSDa'](" }, { from: "gl.createBuffer(", to: "gl['crBr'](" }, { from: "gl.createFramebuffer(", to: "gl['crFr'](" }, { from: "gl.createProgram(", to: "gl['crPm'](" }, { from: "gl.createQuery(", to: "gl['crQy'](" }, { from: "gl.createRenderbuffer(", to: "gl['crRr'](" }, { from: "gl.createSampler(", to: "gl['crSr'](" }, { from: "gl.createTexture(", to: "gl['crTe'](" }, { from: "gl.createTransformFeedback(", to: "gl['crTFk'](" }, { from: "gl.createVertexArray(", to: "gl['crVAy'](" }, { from: "gl.cullFace(", to: "gl['cuFe'](" }, { from: "gl.deleteBuffer(", to: "gl['deBr'](" }, { from: "gl.deleteFramebuffer(", to: "gl['deFr'](" }, { from: "gl.deleteProgram(", to: "gl['dePm'](" }, { from: "gl.deleteQuery(", to: "gl['deQy'](" }, { from: "gl.deleteRenderbuffer(", to: "gl['deRr'](" }, { from: "gl.deleteSampler(", to: "gl['deSr'](" }, { from: "gl.deleteSync(", to: "gl['deSc'](" }, { from: "gl.deleteTexture(", to: "gl['deTe'](" }, { from: "gl.deleteTransformFeedback(", to: "gl['deTFk'](" }, { from: "gl.deleteVertexArray(", to: "gl['deVAy'](" }, { from: "gl.depthFunc(", to: "gl['deFc'](" }, { from: "gl.depthMask(", to: "gl['deMk'](" }, { from: "gl.depthRange(", to: "gl['deRe'](" }, { from: "gl.disable(", to: "gl['die'](" }, { from: "gl.drawArraysInstanced(", to: "gl['drAId'](" }, { from: "gl.drawElementsInstanced(", to: "gl['drEId'](" }, { from: "gl.drawRangeElements(", to: "gl['drREs'](" }, { from: "gl.enable(", to: "gl['ene'](" }, { from: "gl.endQuery(", to: "gl['enQy'](" }, { from: "gl.endTransformFeedback(", to: "gl['enTFk'](" }, { from: "gl.fenceSync(", to: "gl['feSc'](" }, { from: "gl.finish(", to: "gl['fih'](" }, { from: "gl.flush(", to: "gl['flh'](" }, { from: "gl.framebufferRenderbuffer(", to: "gl['frRr'](" }, { from: "gl.framebufferTexture2D(", to: "gl['frT2D'](" }, { from: "gl.framebufferTextureLayer(", to: "gl['frTLr'](" }, { from: "gl.frontFace(", to: "gl['frFe'](" }, { from: "gl.generateMipmap(", to: "gl['geMp'](" }, { from: "gl.getActiveAttrib(", to: "gl['geAAb'](" }, { from: "gl.getActiveUniform(", to: "gl['geAUm'](" }, { from: "gl.getActiveUniformBlockName(", to: "gl['geAUBName'](" }, { from: "gl.getActiveUniformBlockParameter(", to: "gl['geAUBParameter'](" }, { from: "gl.getActiveUniforms(", to: "gl['geAUs'](" }, { from: "gl.getAttachedShaders(", to: "gl['geASs'](" }, { from: "gl.getAttribLocation(", to: "gl['geALn'](" }, { from: "gl.getBufferParameter(", to: "gl['geBPr'](" }, { from: "gl.getBufferSubData(", to: "gl['geBSDa'](" }, { from: "gl.getContextAttributes(", to: "gl['geCAs'](" }, { from: "gl.getError(", to: "gl['geEr'](" }, { from: "gl.getExtension(", to: "gl['geEn'](" }, { from: "gl.getFragDataLocation(", to: "gl['geFDLn'](" }, { from: "gl.getFramebufferAttachmentParameter(", to: "gl['geFAPr'](" }, { from: "gl.getIndexedParameter(", to: "gl['geIPr'](" }, { from: "gl.getParameter(", to: "gl['gePr'](" }, { from: "gl.getProgramInfoLog(", to: "gl['gePILg'](" }, { from: "gl.getProgramParameter(", to: "gl['gePPr'](" }, { from: "gl.getQuery(", to: "gl['geQy'](" }, { from: "gl.getQueryParameter(", to: "gl['geQPr'](" }, { from: "gl.getRenderbufferParameter(", to: "gl['geRPr'](" }, { from: "gl.getSamplerParameter(", to: "gl['geSPr'](" }, { from: "gl.getShaderInfoLog(", to: "gl['geSILg'](" }, { from: "gl.getShaderPrecisionFormat(", to: "gl['geSPFt'](" }, { from: "gl.getShaderSource(", to: "gl['geSSe'](" }, { from: "gl.getSupportedExtensions(", to: "gl['geSEs'](" }, { from: "gl.getTexParameter(", to: "gl['geTPr'](" }, { from: "gl.getTransformFeedbackVarying(", to: "gl['geTFVg'](" }, { from: "gl.getUniform(", to: "gl['geUm'](" }, { from: "gl.getUniformBlockIndex(", to: "gl['geUBIx'](" }, { from: "gl.getUniformIndices(", to: "gl['geUIs'](" }, { from: "gl.getUniformLocation(", to: "gl['geULn'](" }, 

              { from: "gl.getVertexAttrib(", to: "gl['geVAb'](" }, { from: "gl.getVertexAttribOffset(", to: "gl['geVAOt'](" }, { from: "gl.hint(", to: "gl['hit'](" }, { from: "gl.invalidateFramebuffer(", to: "gl['inFr'](" }, { from: "gl.invalidateSubFramebuffer(", to: "gl['inSFr'](" }, { from: "gl.isBuffer(", to: "gl['isBr'](" }, { from: "gl.isContextLost(", to: "gl['isCLt'](" }, { from: "gl.isEnabled(", to: "gl['isEd'](" }, { from: "gl.isFramebuffer(", to: "gl['isFr'](" }, { from: "gl.isProgram(", to: "gl['isPm'](" }, { from: "gl.isQuery(", to: "gl['isQy'](" }, { from: "gl.isRenderbuffer(", to: "gl['isRr'](" }, { from: "gl.isSampler(", to: "gl['isSr'](" }, { from: "gl.isSync(", to: "gl['isSc'](" }, { from: "gl.isTexture(", to: "gl['isTe'](" }, { from: "gl.isTransformFeedback(", to: "gl['isTFk'](" }, { from: "gl.isVertexArray(", to: "gl['isVAy'](" }, { from: "gl.lineWidth(", to: "gl['liWh'](" }, { from: "gl.linkProgram(", to: "gl['liPm'](" }, { from: "gl.pauseTransformFeedback(", to: "gl['paTFk'](" }, { from: "gl.pixelStorei(", to: "gl['piSi'](" }, { from: "gl.polygonOffset(", to: "gl['poOt'](" }, { from: "gl.readBuffer(", to: "gl['reBr'](" }, { from: "gl.readPixels(", to: "gl['rePs'](" }, { from: "gl.renderbufferStorage(", to: "gl['reSe'](" }, { from: "gl.renderbufferStorageMultisample(", to: "gl['reSMe'](" }, { from: "gl.resumeTransformFeedback(", to: "gl['reTFk'](" }, { from: "gl.sampleCoverage(", to: "gl['saCe'](" }, { from: "gl.samplerParameterf(", to: "gl['saPf'](" }, { from: "gl.samplerParameteri(", to: "gl['saPi'](" }, { from: "gl.shaderSource(", to: "gl['shSe'](" }, { from: "gl.stencilFunc(", to: "gl['stFc'](" }, { from: "gl.stencilFuncSeparate(", to: "gl['stFSe'](" }, { from: "gl.stencilMask(", to: "gl['stMk'](" }, { from: "gl.stencilMaskSeparate(", to: "gl['stMSe'](" }, { from: "gl.stencilOp(", to: "gl['stOp'](" }, { from: "gl.stencilOpSeparate(", to: "gl['stOSe'](" }, { from: "gl.texImage2D(", to: "gl['teI2D'](" }, { from: "gl.texImage3D(", to: "gl['teI3D'](" }, { from: "gl.texParameterf(", to: "gl['tePf'](" }, { from: "gl.texParameteri(", to: "gl['tePi'](" }, { from: "gl.texStorage2D(", to: "gl['teS2D'](" }, { from: "gl.texStorage3D(", to: "gl['teS3D'](" }, { from: "gl.texSubImage2D(", to: "gl['teSI2D'](" }, { from: "gl.texSubImage3D(", to: "gl['teSI3D'](" }, { from: "gl.transformFeedbackVaryings(", to: "gl['trFVs'](" }, { from: "gl.uniform1ui(", to: "gl['un1ui'](" }, { from: "gl.uniform2ui(", to: "gl['un2ui'](" }, { from: "gl.uniform3ui(", to: "gl['un3ui'](" }, { from: "gl.uniform4ui(", to: "gl['un4ui'](" }, { from: "gl.uniformBlockBinding(", to: "gl['unBBg'](" }, { from: "gl.useProgram(", to: "gl['usPm'](" }, { from: "gl.validateProgram(", to: "gl['vaPm'](" }, { from: "gl.vertexAttribDivisor(", to: "gl['veADr'](" }, { from: "gl.vertexAttribI4i(", to: "gl['veAI4i'](" }, { from: "gl.vertexAttribI4ui(", to: "gl['veAI4ui'](" }, { from: "gl.vertexAttribIPointer(", to: "gl['veAIPr'](" }, { from: "gl.waitSync(", to: "gl['waSc'](" }, { from: "gl.bindBuffer(", to: "gl['biBr'](" }, { from: "gl.bindFramebuffer(", to: "gl['biFr'](" }, { from: "gl.bindTexture(", to: "gl['biTe'](" }, { from: "gl.clear(", to: "gl['clr'](" }, { from: "gl.clearBufferfi(", to: "gl['clBi'](" }, { from: "gl.clearBufferfv(", to: "gl['clBv'](" }, { from: "gl.clearColor(", to: "gl['clCr'](" }, { from: "gl.clearDepth(", to: "gl['clDh'](" }, { from: "gl.clearStencil(", to: "gl['clSl'](" }, { from: "gl.colorMask(", to: "gl['coMk'](" }, { from: "gl.disableVertexAttribArray(", to: "gl['diVAAy'](" }, { from: "gl.drawArrays(", to: "gl['drAs'](" }, { from: "gl.drawBuffers(", to: "gl['drBs'](" }, { from: "gl.drawElements(", to: "gl['drEs'](" }, { from: "gl.enableVertexAttribArray(", to: "gl['enVAAy'](" }, { from: "gl.scissor(", to: "gl['scr'](" }, { from: "gl.uniform1f(", to: "gl['un1f'](" }, { from: "gl.uniform1fv(", to: "gl['un1fv'](" }, { from: "gl.uniform1i(", to: "gl['un1i'](" }, { from: "gl.uniform1iv(", to: "gl['un1iv'](" }, { from: "gl.uniform1uiv(", to: "gl['un1uiv'](" }, { from: "gl.uniform2f(", to: "gl['un2f'](" }, { from: "gl.uniform2fv(", to: "gl['un2fv'](" }, { from: "gl.uniform2i(", to: "gl['un2i'](" }, { from: "gl.uniform2iv(", to: "gl['un2iv'](" }, { from: "gl.uniform2uiv(", to: "gl['un2uiv'](" }, { from: "gl.uniform3f(", to: "gl['un3f'](" }, { from: "gl.uniform3fv(", to: "gl['un3fv'](" }, { from: "gl.uniform3i(", to: "gl['un3i'](" }, { from: "gl.uniform3iv(", to: "gl['un3iv'](" }, { from: "gl.uniform3uiv(", to: "gl['un3uiv'](" }, { from: "gl.uniform4f(", to: "gl['un4f'](" }, { from: "gl.uniform4fv(", to: "gl['un4fv'](" }, { from: "gl.uniform4i(", to: "gl['un4i'](" }, { from: "gl.uniform4iv(", to: "gl['un4iv'](" }, { from: "gl.uniform4uiv(", to: "gl['un4uiv'](" }, { from: "gl.uniformMatrix2fv(", to: "gl['unM2fv'](" }, { from: "gl.uniformMatrix2x3fv(", to: "gl['unM2x3fv'](" }, { from: "gl.uniformMatrix2x4fv(", to: "gl['unM2x4fv'](" }, { from: "gl.uniformMatrix3fv(", to: "gl['unM3fv'](" }, { from: "gl.uniformMatrix3x2fv(", to: "gl['unM3x2fv'](" }, { from: "gl.uniformMatrix3x4fv(", to: "gl['unM3x4fv'](" }, 

              { from: "gl.uniformMatrix4fv(", to: "gl['unM4fv'](" }, { from: "gl.uniformMatrix4x2fv(", to: "gl['unM4x2fv'](" }, { from: "gl.uniformMatrix4x3fv(", to: "gl['unM4x3fv'](" }, { from: "gl.vertexAttrib1f(", to: "gl['veA1f'](" }, { from: "gl.vertexAttrib1fv(", to: "gl['veA1fv'](" }, { from: "gl.vertexAttrib2f(", to: "gl['veA2f'](" }, { from: "gl.vertexAttrib2fv(", to: "gl['veA2fv'](" }, { from: "gl.vertexAttrib3f(", to: "gl['veA3f'](" }, { from: "gl.vertexAttrib3fv(", to: "gl['veA3fv'](" }, { from: "gl.vertexAttrib4f(", to: "gl['veA4f'](" }, { from: "gl.vertexAttrib4fv(", to: "gl['veA4fv'](" }, { from: "gl.vertexAttribI4iv(", to: "gl['veAI4iv'](" }, { from: "gl.vertexAttribI4uiv(", to: "gl['veAI4uiv'](" }, { from: "gl.vertexAttribPointer(", to: "gl['veAPr'](" }, { from: "gl.viewport(", to: "gl['vit'](" }, { from: "gl.drawingBufferColorSpace(", to: "gl['drBCSe'](" }, { from: "gl.unpackColorSpace(", to: "gl['unCSe'](" }, { from: "gl.makeXRCompatible(", to: "gl['maXRCe'](" }, 

              // window
              { from: "window.window(", to: "window['wiw'](" }, { from: "window.self(", to: "window['sef'](" }, { from: "window.document(", to: "window['dot'](" }, { from: "window.name(", to: "window['nae'](" }, { from: "window.location(", to: "window['lon'](" }, { from: "window.customElements(", to: "window['cuEs'](" }, { from: "window.history(", to: "window['hiy'](" }, { from: "window.locationbar(", to: "window['lor'](" }, { from: "window.menubar(", to: "window['mer'](" }, { from: "window.personalbar(", to: "window['per'](" }, { from: "window.scrollbars(", to: "window['scs'](" }, { from: "window.statusbar(", to: "window['str'](" }, { from: "window.toolbar(", to: "window['tor'](" }, { from: "window.status(", to: "window['sts'](" }, { from: "window.closed(", to: "window['cld'](" }, { from: "window.frames(", to: "window['frs'](" }, { from: "window.length(", to: "window['leh'](" }, { from: "window.opener(", to: "window['opr'](" }, { from: "window.parent(", to: "window['pat'](" }, { from: "window.frameElement(", to: "window['frEt'](" }, { from: "window.navigator(", to: "window['nar'](" }, { from: "window.origin(", to: "window['orn'](" }, { from: "window.external(", to: "window['exl'](" }, { from: "window.screen(", to: "window['scn'](" }, { from: "window.innerWidth(", to: "window['inWh'](" }, { from: "window.innerHeight(", to: "window['inHt'](" }, { from: "window.screenX(", to: "window['scX'](" }, { from: "window.pageXOffset(", to: "window['paXOt'](" }, { from: "window.screenY(", to: "window['scY'](" }, { from: "window.pageYOffset(", to: "window['paYOt'](" }, { from: "window.visualViewport(", to: "window['viVt'](" }, { from: "window.outerWidth(", to: "window['ouWh'](" }, { from: "window.outerHeight(", to: "window['ouHt'](" }, { from: "window.devicePixelRatio(", to: "window['dePRo'](" }, { from: "window.clientInformation(", to: "window['clIn'](" }, { from: "window.screenLeft(", to: "window['scLt'](" }, { from: "window.screenTop(", to: "window['scTp'](" }, { from: "window.defaultStatus(", to: "window['deSs'](" }, { from: "window.defaultstatus(", to: "window['des'](" }, { from: "window.styleMedia(", to: "window['stMa'](" }, { from: "window.onbeforematch(", to: "window['onh'](" }, { from: "window.isSecureContext(", to: "window['isSCt'](" }, { from: "window.trustedTypes(", to: "window['trTs'](" }, { from: "window.performance(", to: "window['pee'](" }, { from: "window.onunload(", to: "window['ond'](" }, { from: "window.onbeforeprint(", to: "window['ont'](" }, { from: "window.crypto(", to: "window['cro'](" }, { from: "window.indexedDB(", to: "window['inDB'](" }, { from: "window.webkitStorageInfo(", to: "window['weSIo'](" }, { from: "window.sessionStorage(", to: "window['seSe'](" }, { from: "window.localStorage(", to: "window['loSe'](" }, { from: "window.onmessageerror(", to: "window['onr'](" }, { from: "window.ontransitioncancel(", to: "window['onl'](" }, { from: "window.onplay(", to: "window['ony'](" }, { from: "window.ondeviceorientationabsolute(", to: "window['one'](" }, { from: "window.onauxclick(", to: "window['onk'](" }, { from: "window.oncontextmenu(", to: "window['onu'](" }, { from: "window.onwaiting(", to: "window['ong'](" }, { from: "window.onpointerup(", to: "window['onp'](" }, { from: "window.onprogress(", to: "window['ons'](" }, { from: "window.onloadedmetadata(", to: "window['ona'](" }, { from: "window.ondeviceorientation(", to: "window['onn'](" }, { from: "window.onpageshow(", to: "window['onw'](" }, { from: "window.crossOriginIsolated(", to: "window['crOId'](" }, { from: "window.scheduler(", to: "window['scr'](" }, { from: "window.alert(", to: "window['alt'](" }, { from: "window.atob(", to: "window['atb'](" }, { from: "window.blur(", to: "window['blr'](" }, { from: "window.btoa(", to: "window['bta'](" }, { from: "window.cancelAnimationFrame(", to: "window['caAFe'](" }, { from: "window.cancelIdleCallback(", to: "window['caICk'](" }, { from: "window.captureEvents(", to: "window['caEs'](" }, { from: "window.clearInterval(", to: "window['clIl'](" }, { from: "window.clearTimeout(", to: "window['clTt'](" }, { from: "window.close(", to: "window['cle'](" }, { from: "window.confirm(", to: "window['com'](" }, { from: "window.createImageBitmap(", to: "window['crIBp'](" }, { from: "window.fetch(", to: "window['feh'](" }, { from: "window.find(", to: "window['fid'](" }, { from: "window.focus(", to: "window['fos'](" }, { from: "window.getComputedStyle(", to: "window['geCSe'](" }, { from: "window.getSelection(", to: "window['geSn'](" }, { from: "window.matchMedia(", to: "window['maMa'](" }, { from: "window.moveBy(", to: "window['moBy'](" }, { from: "window.moveTo(", to: "window['moTo'](" }, { from: "window.open(", to: "window['opn'](" }, { from: "window.postMessage(", to: "window['poMe'](" }, { from: "window.print(", to: "window['prt'](" }, { from: "window.queueMicrotask(", to: "window['quMk'](" }, { from: "window.releaseEvents(", to: "window['reEs'](" }, { from: "window.reportError(", to: "window['reEr'](" }, { from: "window.requestAnimationFrame(", to: "window['reAFe'](" }, { from: "window.requestIdleCallback(", to: "window['reICk'](" }, { from: "window.resizeBy(", to: "window['reBy'](" }, { from: "window.resizeTo(", to: "window['reTo'](" }, { from: "window.scroll(", to: "window['scl'](" }, { from: "window.scrollBy(", to: "window['scBy'](" }, { from: "window.scrollTo(", to: "window['scTo'](" }, { from: "window.setInterval(", to: "window['seIl'](" }, { from: "window.setTimeout(", to: "window['seTt'](" }, 

              { from: "window.stop(", to: "window['stp'](" }, { from: "window.structuredClone(", to: "window['stCe'](" }, { from: "window.webkitCancelAnimationFrame(", to: "window['weCAFe'](" }, { from: "window.webkitRequestAnimationFrame(", to: "window['weRAFe'](" }, { from: "window.chrome(", to: "window['che'](" }, { from: "window.caches(", to: "window['cas'](" }, { from: "window.cookieStore(", to: "window['coSe'](" }, { from: "window.launchQueue(", to: "window['laQe'](" }, { from: "window.getScreenDetails(", to: "window['geSDs'](" }, { from: "window.queryLocalFonts(", to: "window['quLFs'](" }, { from: "window.showDirectoryPicker(", to: "window['shDPr'](" }, { from: "window.showOpenFilePicker(", to: "window['shOFPr'](" }, { from: "window.showSaveFilePicker(", to: "window['shSFPr'](" }, { from: "window.originAgentCluster(", to: "window['orACr'](" }, { from: "window.navigation(", to: "window['nan'](" }, { from: "window.speechSynthesis(", to: "window['spSs'](" }, { from: "window.openDatabase(", to: "window['opDe'](" }, { from: "window.webkitRequestFileSystem(", to: "window['weRFSm'](" }, { from: "window.webkitResolveLocalFileSystemURL(", to: "window['weRLFSystemURL'](" }, { from: "window.rect3Intersection(", to: "window['re3Intersection'](" }, { from: "window.addEventListener(", to: "window['adELr'](" }, { from: "window.dispatchEvent(", to: "window['diEt'](" }, { from: "window.removeEventListener(", to: "window['reELr'](" }
            ]
          },
          html: {
            src: ['dist/index.html'],
            overwrite: true,
            replacements: [{
              from: /build\/out\.js/g,
              to:"out.min.rr.js"
            }, { // gut the HTML entirely!
              from: "</body></html>",
              to: ""
            }, {
              from: "<html>",
              to: ""
            }, {
              from: "<body>",
              to: ""
            }]
          },
          html2: {
            src: ['dist/index.html'],
            overwrite: true,
            replacements: [{
              from: /id=\"(\w+)\"/g,
              to: "id=$1"
            }, {
              from: /class=\"(\w+)\"/g,
              to: "class=$1"
            }, {
              from: /name=\"(\w+)\"/g,
              to: "name=$1"
            }]
          },          
          js: {
              src: ['dist/out.min.js'],
              overwrite: true,
              replacements: [{
                from: "'use strict';",
                to:""
              }, {
                from: "window.",
                to:""
              }, /* GLSL comments */ {
                from: /\/\/([^\n])*\n/g,
                to:""
              }, /*{
                from: /\/\*(.|\\n)*\*\//g,
                to:""
              }, */{
                from: /\$\{\"((\w|\d|\.)*)\"\}/g,
                to: "$1"
              }, {
                from: /\$\{(\-?(\d|\.)*)\}/g,
                to: "$1"
              }, {
                from: "void 0",
                to: "null"
              }, {
                from: "const ",
                to: "var "
              }, {
                from: "const[",
                to: "var["
              }, {
                from: "const{",
                to: "var{"
              }, {
                from: "let ",
                to: "var "
              }, {
                from: "let{",
                to: "var{"
              }, {
                from: "let[",
                to: "var["
              }, {
                from: /(\,|\{)\["(\w+)"\]:/g,
                to: "$1$2:"
              }, {
                from: "${Math.random()/999}",
                to: "0.",
              }, {
                from: "forEach",
                to: "map"
              }, {
                from: /var ([a-zA-Z_$]+=[^;\{]+);var/g,
                to: "var $1,",
              }]
          },
          js2: { // second pass for the bits that we changed above
            src: ['dist/out.min.js'],
            overwrite: true,
            replacements: [{
              from: /(\s)+/g,
              to:" "
            }, {
              from: /((\\n)\s*)+/g,
              to:" "
            }, {
              from: /([^a-zA-Z0-9$])\s(\w)/g,
              to: "$1$2"
            }, {
              from: /(\w)\s([^a-zA-Z0-9$])/g,
              to: "$1$2"
            }, {
              from: /([^a-zA-Z0-9$])\s([^a-zA-Z0-9$])/g,
              to: "$1$2"
            }, {
              from: ",null)",
              to: ")",
            }]
        },
      },
      copy: {
          html: {
              files: [
                  {expand: true, src: ['i.bmp'], dest: 'dist/'},
                  {expand: true, src: ['index.html'], dest: 'dist/'},
                  {expand: true, src: ['index.css'], dest: 'dist/'}
              ]
          }
      },
      devUpdate: {
          main: {
              options: {
                  //task options go here
                  updateType: 'force',
                  reportUpdated: true
              }
          }
      },
      run: {
        options: {
          // ...
        },
        roadroller: {
          cmd: 'npx',
          args: [
            'roadroller',
            'dist/out.min.js',
            '-o',
            'dist/out.min.rr.js'
          ]
        },
        zip: {
          cmd: 'advzip',
          args: [
            '-4',
            '-a',
            'index.zip',
            'dist/index.html'
          ]
        },
        ls: {
          cmd: 'stat',
          args: [
            '-f',
            '%N %z',
            'index.zip'
          ]
        }
      },      
  });

  // clean
  grunt.loadNpmTasks('grunt-contrib-clean');
  // load the plugin that provides the closure compiler
  grunt.loadNpmTasks('grunt-closure-compiler');
  // Load the plugin that provides the "TS" task.
  grunt.loadNpmTasks('grunt-ts');
  // copy
  grunt.loadNpmTasks('grunt-contrib-copy');
  // replace text in file
  grunt.loadNpmTasks('grunt-text-replace');
  // update version
  grunt.loadNpmTasks('grunt-dev-update');
  // inline js
  grunt.loadNpmTasks('grunt-inline');
  // live reload
  grunt.loadNpmTasks('grunt-contrib-watch');
  // server for live reload
  grunt.loadNpmTasks('grunt-contrib-connect');
  // copying html
  grunt.loadNpmTasks('grunt-contrib-copy');
  // minifying css
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  // minifying html
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  // run command line
  grunt.loadNpmTasks('grunt-run');

  // Default task(s).
  grunt.registerTask('reset', ['clean:all']);
  grunt.registerTask('prod', ['ts']);
  grunt.registerTask('dist', [
    'prod', 
    'replace:hax',
    'closure-compiler:es2020', 
    'run:roadroller',
    'copy',
    'cssmin', 
    'replace:html', 
    'replace:js', 'replace:js2', 'replace:js2', 
    'inline', 
    'htmlmin',
    /* 'replace:html2',*/
    'run:zip',
    'run:ls'
  ]);
  grunt.registerTask('default', ['prod', 'connect', 'watch']);

};