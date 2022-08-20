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
                from: 'FLAG_PRODUCTION = false;',
                to: 'FLAG_PRODUCTION = true;'
              },
              // remove all consts so CC can aggregate consecutive declarations
              { 
                from: /(\s)const(\s)/g, 
                to: "$1let$2"
              },
              // webgl
              { from: "gl.canvas(", to: "gl['cas'](" }, { from: "gl.drawingBufferWidth(", to: "gl['drBWh'](" }, { from: "gl.drawingBufferHeight(", to: "gl['drBHt'](" }, { from: "gl.activeTexture(", to: "gl['acTe'](" }, { from: "gl.attachShader(", to: "gl['atSr'](" }, { from: "gl.bindAttribLocation(", to: "gl['biALn'](" }, { from: "gl.bindFramebuffer(", to: "gl['biFr'](" }, { from: "gl.bindRenderbuffer(", to: "gl['biRr'](" }, { from: "gl.bindTexture(", to: "gl['biTe'](" }, { from: "gl.blendColor(", to: "gl['blCr'](" }, { from: "gl.blendEquation(", to: "gl['blEn'](" }, { from: "gl.blendEquationSeparate(", to: "gl['blESe'](" }, { from: "gl.blendFunc(", to: "gl['blFc'](" }, { from: "gl.blendFuncSeparate(", to: "gl['blFSe'](" }, { from: "gl.bufferData(", to: "gl['buDa'](" }, { from: "gl.bufferSubData(", to: "gl['buSDa'](" }, { from: "gl.checkFramebufferStatus(", to: "gl['chFSs'](" }, { from: "gl.clear(", to: "gl['clr'](" }, { from: "gl.clearColor(", to: "gl['clCr'](" }, { from: "gl.clearDepth(", to: "gl['clDh'](" }, { from: "gl.clearStencil(", to: "gl['clSl'](" }, { from: "gl.colorMask(", to: "gl['coMk'](" }, { from: "gl.compileShader(", to: "gl['coSr'](" }, { from: "gl.compressedTexImage2D(", to: "gl['coTI2D'](" }, { from: "gl.compressedTexSubImage2D(", to: "gl['coTSI2D'](" }, { from: "gl.createBuffer(", to: "gl['crBr'](" }, { from: "gl.createFramebuffer(", to: "gl['crFr'](" }, { from: "gl.createProgram(", to: "gl['crPm'](" }, { from: "gl.createRenderbuffer(", to: "gl['crRr'](" }, { from: "gl.createShader(", to: "gl['crSr'](" }, { from: "gl.createTexture(", to: "gl['crTe'](" }, { from: "gl.cullFace(", to: "gl['cuFe'](" }, { from: "gl.deleteBuffer(", to: "gl['deBr'](" }, { from: "gl.deleteFramebuffer(", to: "gl['deFr'](" }, { from: "gl.deleteProgram(", to: "gl['dePm'](" }, { from: "gl.deleteRenderbuffer(", to: "gl['deRr'](" }, { from: "gl.deleteShader(", to: "gl['deSr'](" }, { from: "gl.deleteTexture(", to: "gl['deTe'](" }, { from: "gl.depthFunc(", to: "gl['deFc'](" }, { from: "gl.depthMask(", to: "gl['deMk'](" }, { from: "gl.depthRange(", to: "gl['deRe'](" }, { from: "gl.disable(", to: "gl['die'](" }, { from: "gl.disableVertexAttribArray(", to: "gl['diVAAy'](" }, { from: "gl.enable(", to: "gl['ene'](" }, { from: "gl.enableVertexAttribArray(", to: "gl['enVAAy'](" }, { from: "gl.finish(", to: "gl['fih'](" }, { from: "gl.flush(", to: "gl['flh'](" }, { from: "gl.framebufferRenderbuffer(", to: "gl['frRr'](" }, { from: "gl.framebufferTexture2D(", to: "gl['frT2D'](" }, { from: "gl.frontFace(", to: "gl['frFe'](" }, { from: "gl.generateMipmap(", to: "gl['geMp'](" }, { from: "gl.getActiveAttrib(", to: "gl['geAAb'](" }, { from: "gl.getActiveUniform(", to: "gl['geAUm'](" }, { from: "gl.getAttachedShaders(", to: "gl['geASs'](" }, { from: "gl.getAttribLocation(", to: "gl['geALn'](" }, { from: "gl.getBufferParameter(", to: "gl['geBPr'](" }, { from: "gl.getContextAttributes(", to: "gl['geCAs'](" }, { from: "gl.getError(", to: "gl['geEr'](" }, { from: "gl.getExtension(", to: "gl['geEn'](" }, { from: "gl.getFramebufferAttachmentParameter(", to: "gl['geFAPr'](" }, { from: "gl.getParameter(", to: "gl['gePr'](" }, { from: "gl.getProgramInfoLog(", to: "gl['gePILg'](" }, { from: "gl.getProgramParameter(", to: "gl['gePPr'](" }, { from: "gl.getRenderbufferParameter(", to: "gl['geRPr'](" }, { from: "gl.getShaderInfoLog(", to: "gl['geSILg'](" }, { from: "gl.getShaderParameter(", to: "gl['geSPr'](" }, { from: "gl.getShaderPrecisionFormat(", to: "gl['geSPFt'](" }, { from: "gl.getShaderSource(", to: "gl['geSSe'](" }, { from: "gl.getSupportedExtensions(", to: "gl['geSEs'](" }, { from: "gl.getTexParameter(", to: "gl['geTPr'](" }, { from: "gl.getUniform(", to: "gl['geUm'](" }, { from: "gl.getUniformLocation(", to: "gl['geULn'](" }, { from: "gl.getVertexAttrib(", to: "gl['geVAb'](" }, { from: "gl.getVertexAttribOffset(", to: "gl['geVAOt'](" }, { from: "gl.hint(", to: "gl['hit'](" }, { from: "gl.isBuffer(", to: "gl['isBr'](" }, { from: "gl.isContextLost(", to: "gl['isCLt'](" }, { from: "gl.isEnabled(", to: "gl['isEd'](" }, { from: "gl.isFramebuffer(", to: "gl['isFr'](" }, { from: "gl.isProgram(", to: "gl['isPm'](" }, { from: "gl.isRenderbuffer(", to: "gl['isRr'](" }, { from: "gl.isShader(", to: "gl['isSr'](" }, { from: "gl.isTexture(", to: "gl['isTe'](" }, { from: "gl.lineWidth(", to: "gl['liWh'](" }, { from: "gl.linkProgram(", to: "gl['liPm'](" }, { from: "gl.pixelStorei(", to: "gl['piSi'](" }, { from: "gl.polygonOffset(", to: "gl['poOt'](" }, { from: "gl.readPixels(", to: "gl['rePs'](" }, { from: "gl.renderbufferStorage(", to: "gl['reSe'](" }, { from: "gl.sampleCoverage(", to: "gl['saCe'](" }, { from: "gl.scissor(", to: "gl['scr'](" }, { from: "gl.shaderSource(", to: "gl['shSe'](" }, { from: "gl.stencilFunc(", to: "gl['stFc'](" }, { from: "gl.stencilFuncSeparate(", to: "gl['stFSe'](" }, { from: "gl.stencilMask(", to: "gl['stMk'](" }, { from: "gl.stencilMaskSeparate(", to: "gl['stMSe'](" }, { from: "gl.stencilOp(", to: "gl['stOp'](" }, { from: "gl.stencilOpSeparate(", to: "gl['stOSe'](" }, { from: "gl.texImage2D(", to: "gl['teI2D'](" }, { from: "gl.texParameterf(", to: "gl['tePf'](" }, { from: "gl.texParameteri(", to: "gl['tePi'](" }, { from: "gl.texSubImage2D(", to: "gl['teSI2D'](" }, { from: "gl.uniform1f(", to: "gl['un1f'](" }, { from: "gl.uniform1fv(", to: "gl['un1fv'](" }, { from: "gl.uniform1i(", to: "gl['un1i'](" }, { from: "gl.uniform1iv(", to: "gl['un1iv'](" }, { from: "gl.uniform2f(", to: "gl['un2f'](" }, { from: "gl.uniform2fv(", to: "gl['un2fv'](" }, { from: "gl.uniform2i(", to: "gl['un2i'](" }, { from: "gl.uniform2iv(", to: "gl['un2iv'](" }, { from: "gl.uniform3f(", to: "gl['un3f'](" }, { from: "gl.uniform3fv(", to: "gl['un3fv'](" }, { from: "gl.uniform3i(", to: "gl['un3i'](" }, { from: "gl.uniform3iv(", to: "gl['un3iv'](" }, { from: "gl.uniform4f(", to: "gl['un4f'](" }, { from: "gl.uniform4fv(", to: "gl['un4fv'](" }, { from: "gl.uniform4i(", to: "gl['un4i'](" }, { from: "gl.uniform4iv(", to: "gl['un4iv'](" }, { from: "gl.uniformMatrix2fv(", to: "gl['unM2fv'](" }, { from: "gl.uniformMatrix3fv(", to: "gl['unM3fv'](" }, { from: "gl.uniformMatrix4fv(", to: "gl['unM4fv'](" }, { from: "gl.useProgram(", to: "gl['usPm'](" }, { from: "gl.validateProgram(", to: "gl['vaPm'](" }, { from: "gl.vertexAttrib1f(", to: "gl['veA1f'](" }, { from: "gl.vertexAttrib1fv(", to: "gl['veA1fv'](" }, { from: "gl.vertexAttrib2f(", to: "gl['veA2f'](" }, { from: "gl.vertexAttrib2fv(", to: "gl['veA2fv'](" }, { from: "gl.vertexAttrib3f(", to: "gl['veA3f'](" }, { from: "gl.vertexAttrib3fv(", to: "gl['veA3fv'](" }, { from: "gl.vertexAttrib4f(", to: "gl['veA4f'](" }, { from: "gl.vertexAttrib4fv(", to: "gl['veA4fv'](" }, { from: "gl.vertexAttribPointer(", to: "gl['veAPr'](" }, { from: "gl.viewport(", to: "gl['vit'](" }, { from: "gl.bindBuffer(", to: "gl['biBr'](" }, { from: "gl.drawArrays(", to: "gl['drAs'](" }, { from: "gl.drawElements(", to: "gl['drEs'](" }, { from: "gl.makeXRCompatible(", to: "gl['maXRCe'](" },
              // 2d
              { from: "stx.canvas(", to: "stx['cas'](" }, { from: "stx.globalAlpha(", to: "stx['glAa'](" }, { from: "stx.globalCompositeOperation(", to: "stx['glCOn'](" }, { from: "stx.filter(", to: "stx['fir'](" }, { from: "stx.imageSmoothingEnabled(", to: "stx['imSEd'](" }, { from: "stx.imageSmoothingQuality(", to: "stx['imSQy'](" }, { from: "stx.strokeStyle(", to: "stx['stSe'](" }, { from: "stx.fillStyle(", to: "stx['fiSe'](" }, { from: "stx.shadowOffsetX(", to: "stx['shOX'](" }, { from: "stx.shadowOffsetY(", to: "stx['shOY'](" }, { from: "stx.shadowBlur(", to: "stx['shBr'](" }, { from: "stx.shadowColor(", to: "stx['shCr'](" }, { from: "stx.lineWidth(", to: "stx['liWh'](" }, { from: "stx.lineCap(", to: "stx['liCp'](" }, { from: "stx.lineJoin(", to: "stx['liJn'](" }, { from: "stx.miterLimit(", to: "stx['miLt'](" }, { from: "stx.lineDashOffset(", to: "stx['liDOt'](" }, { from: "stx.font(", to: "stx['fot'](" }, { from: "stx.textAlign(", to: "stx['teAn'](" }, { from: "stx.textBaseline(", to: "stx['teBe'](" }, { from: "stx.direction(", to: "stx['din'](" }, { from: "stx.clip(", to: "stx['clp'](" }, { from: "stx.createImageData(", to: "stx['crIDa'](" }, { from: "stx.createLinearGradient(", to: "stx['crLGt'](" }, { from: "stx.createPattern(", to: "stx['crPn'](" }, { from: "stx.createRadialGradient(", to: "stx['crRGt'](" }, { from: "stx.drawFocusIfNeeded(", to: "stx['drFINd'](" }, { from: "stx.drawImage(", to: "stx['drIe'](" }, { from: "stx.fill(", to: "stx['fil'](" }, { from: "stx.fillText(", to: "stx['fiTt'](" }, { from: "stx.getContextAttributes(", to: "stx['geCAs'](" }, { from: "stx.getImageData(", to: "stx['geIDa'](" }, { from: "stx.getLineDash(", to: "stx['geLDh'](" }, { from: "stx.getTransform(", to: "stx['geTm'](" }, { from: "stx.isPointInPath(", to: "stx['isPIPh'](" }, { from: "stx.isPointInStroke(", to: "stx['isPISe'](" }, { from: "stx.measureText(", to: "stx['meTt'](" }, { from: "stx.putImageData(", to: "stx['puIDa'](" }, { from: "stx.save(", to: "stx['sae'](" }, { from: "stx.scale(", to: "stx['sce'](" }, { from: "stx.setLineDash(", to: "stx['seLDh'](" }, { from: "stx.setTransform(", to: "stx['seTm'](" }, { from: "stx.stroke(", to: "stx['ste'](" }, { from: "stx.strokeText(", to: "stx['stTt'](" }, { from: "stx.transform(", to: "stx['trm'](" }, { from: "stx.translate(", to: "stx['tre'](" }, { from: "stx.arcTo(", to: "stx['arTo'](" }, { from: "stx.beginPath(", to: "stx['bePh'](" }, { from: "stx.bezierCurveTo(", to: "stx['beCTo'](" }, { from: "stx.clearRect(", to: "stx['clRt'](" }, { from: "stx.closePath(", to: "stx['clPh'](" }, { from: "stx.ellipse(", to: "stx['ele'](" }, { from: "stx.fillRect(", to: "stx['fiRt'](" }, { from: "stx.lineTo(", to: "stx['liTo'](" }, { from: "stx.moveTo(", to: "stx['moTo'](" }, { from: "stx.quadraticCurveTo(", to: "stx['quCTo'](" }, { from: "stx.rect(", to: "stx['ret'](" }, { from: "stx.resetTransform(", to: "stx['reTm'](" }, { from: "stx.restore(", to: "stx['ree'](" }, { from: "stx.rotate(", to: "stx['roe'](" }, { from: "stx.strokeRect(", to: "stx['stRt'](" },
              // document
              // { from: "document.location(", to: "document['lon'](" }, { from: "document.implementation(", to: "document['imn'](" }, { from: "document.documentURI(", to: "document['doURI'](" }, { from: "document.compatMode(", to: "document['coMe'](" }, { from: "document.characterSet(", to: "document['chSt'](" }, { from: "document.charset(", to: "document['cht'](" }, { from: "document.inputEncoding(", to: "document['inEg'](" }, { from: "document.contentType(", to: "document['coTe'](" }, { from: "document.doctype(", to: "document['doe'](" }, { from: "document.documentElement(", to: "document['doEt'](" }, { from: "document.xmlEncoding(", to: "document['xmEg'](" }, { from: "document.xmlVersion(", to: "document['xmVn'](" }, { from: "document.xmlStandalone(", to: "document['xmSe'](" }, { from: "document.domain(", to: "document['don'](" }, { from: "document.referrer(", to: "document['rer'](" }, { from: "document.cookie(", to: "document['coe'](" }, { from: "document.lastModified(", to: "document['laMd'](" }, { from: "document.readyState(", to: "document['reSe'](" }, { from: "document.timeline(", to: "document['tie'](" }, { from: "document.body(", to: "document['boy'](" }, { from: "document.head(", to: "document['hed'](" }, { from: "document.images(", to: "document['ims'](" }, { from: "document.embeds(", to: "document['ems'](" }, { from: "document.plugins(", to: "document['pls'](" }, { from: "document.links(", to: "document['lis'](" }, { from: "document.forms(", to: "document['fos'](" }, { from: "document.scripts(", to: "document['scs'](" }, { from: "document.currentScript(", to: "document['cuSt'](" }, { from: "document.defaultView(", to: "document['deVw'](" }, { from: "document.designMode(", to: "document['deMe'](" }, { from: "document.onpointerrawupdate(", to: "document['one'](" }, { from: "document.anchors(", to: "document['ans'](" }, { from: "document.applets(", to: "document['aps'](" }, { from: "document.fgColor(", to: "document['fgCr'](" }, { from: "document.linkColor(", to: "document['liCr'](" }, { from: "document.vlinkColor(", to: "document['vlCr'](" }, { from: "document.alinkColor(", to: "document['alCr'](" }, { from: "document.bgColor(", to: "document['bgCr'](" }, { from: "document.scrollingElement(", to: "document['scEt'](" }, { from: "document.onpointerenter(", to: "document['onr'](" }, { from: "document.hidden(", to: "document['hin'](" }, { from: "document.visibilityState(", to: "document['viSe'](" }, { from: "document.wasDiscarded(", to: "document['waDd'](" }, { from: "document.featurePolicy(", to: "document['fePy'](" }, { from: "document.webkitVisibilityState(", to: "document['weVSe'](" }, { from: "document.webkitHidden(", to: "document['weHn'](" }, { from: "document.oncopy(", to: "document['ony'](" }, { from: "document.oncut(", to: "document['ont'](" }, { from: "document.oncanplaythrough(", to: "document['onh'](" }, { from: "document.ontransitionrun(", to: "document['onn'](" }, { from: "document.fullscreenEnabled(", to: "document['fuEd'](" }, { from: "document.fullscreen(", to: "document['fun'](" }, { from: "document.webkitIsFullScreen(", to: "document['weIFSn'](" }, { from: "document.webkitCurrentFullScreenElement(", to: "document['weCFSElement'](" }, { from: "document.webkitFullscreenEnabled(", to: "document['weFEd'](" }, { from: "document.webkitFullscreenElement(", to: "document['weFEt'](" }, { from: "document.rootElement(", to: "document['roEt'](" }, { from: "document.ontransitioncancel(", to: "document['onl'](" }, { from: "document.onauxclick(", to: "document['onk'](" }, { from: "document.oncontextmenu(", to: "document['onu'](" }, { from: "document.onwaiting(", to: "document['ong'](" }, { from: "document.ontransitionend(", to: "document['ond'](" }, { from: "document.onpointerup(", to: "document['onp'](" }, { from: "document.onprogress(", to: "document['ons'](" }, { from: "document.onloadedmetadata(", to: "document['ona'](" }, { from: "document.children(", to: "document['chn'](" }, { from: "document.firstElementChild(", to: "document['fiECd'](" }, { from: "document.lastElementChild(", to: "document['laECd'](" }, { from: "document.childElementCount(", to: "document['chECt'](" }, { from: "document.activeElement(", to: "document['acEt'](" }, { from: "document.styleSheets(", to: "document['stSs'](" }, { from: "document.pointerLockElement(", to: "document['poLEt'](" }, { from: "document.fullscreenElement(", to: "document['fuEt'](" }, { from: "document.adoptedStyleSheets(", to: "document['adSSs'](" }, { from: "document.adoptNode(", to: "document['adNe'](" }, { from: "document.append(", to: "document['apd'](" }, { from: "document.captureEvents(", to: "document['caEs'](" }, { from: "document.caretRangeFromPoint(", to: "document['caRFPt'](" }, { from: "document.clear(", to: "document['clr'](" }, { from: "document.close(", to: "document['cle'](" }, { from: "document.createAttribute(", to: "document['crAe'](" }, { from: "document.createAttributeNS(", to: "document['crANS'](" }, { from: "document.createCDATASection(", to: "document['crCDATASection'](" }, { from: "document.createComment(", to: "document['crCt'](" }, { from: "document.createDocumentFragment(", to: "document['crDFt'](" }, { from: "document.createElement(", to: "document['crEt'](" }, { from: "document.createElementNS(", to: "document['crENS'](" }, { from: "document.createExpression(", to: "document['crEn'](" }, { from: "document.createNSResolver(", to: "document['crNSRr'](" }, { from: "document.createNodeIterator(", to: "document['crNIr'](" }, { from: "document.createProcessingInstruction(", to: "document['crPIn'](" }, { from: "document.createRange(", to: "document['crRe'](" }, { from: "document.createTextNode(", to: "document['crTNe'](" }, { from: "document.createTreeWalker(", to: "document['crTWr'](" }, { from: "document.elementFromPoint(", to: "document['elFPt'](" }, { from: "document.evaluate(", to: "document['eve'](" }, { from: "document.execCommand(", to: "document['exCd'](" }, { from: "document.exitFullscreen(", to: "document['exFn'](" }, { from: "document.exitPointerLock(", to: "document['exPLk'](" }, { from: "document.getElementById(", to: "document['geEBId'](" }, { from: "document.getElementsByClassName(", to: "document['geEBCName'](" }, { from: "document.getElementsByName(", to: "document['geEBNe'](" }, { from: "document.getElementsByTagName(", to: "document['geEBTName'](" }, { from: "document.getElementsByTagNameNS(", to: "document['geEBTNameNS'](" }, { from: "document.getSelection(", to: "document['geSn'](" }, { from: "document.hasFocus(", to: "document['haFs'](" }, { from: "document.importNode(", to: "document['imNe'](" }, { from: "document.open(", to: "document['opn'](" }, { from: "document.prepend(", to: "document['prd'](" }, { from: "document.queryCommandEnabled(", to: "document['quCEd'](" }, { from: "document.queryCommandIndeterm(", to: "document['quCIm'](" }, { from: "document.queryCommandState(", to: "document['quCSe'](" }, { from: "document.queryCommandSupported(", to: "document['quCSd'](" }, { from: "document.queryCommandValue(", to: "document['quCVe'](" }, { from: "document.querySelector(", to: "document['quSr'](" }, { from: "document.querySelectorAll(", to: "document['quSAl'](" }, { from: "document.releaseEvents(", to: "document['reEs'](" }, { from: "document.replaceChildren(", to: "document['reCn'](" }, { from: "document.webkitCancelFullScreen(", to: "document['weCFSn'](" }, { from: "document.webkitExitFullscreen(", to: "document['weEFn'](" }, { from: "document.write(", to: "document['wre'](" }, { from: "document.writeln(", to: "document['wrn'](" }, { from: "document.fragmentDirective(", to: "document['frDe'](" }, { from: "document.pictureInPictureEnabled(", to: "document['piIPEd'](" }, { from: "document.pictureInPictureElement(", to: "document['piIPEt'](" }, { from: "document.exitPictureInPicture(", to: "document['exPIPe'](" }, { from: "document.getAnimations(", to: "document['geAs'](" }, { from: "document.nodeType(", to: "document['noTe'](" }, { from: "document.nodeName(", to: "document['noNe'](" }, { from: "document.baseURI(", to: "document['baURI'](" }, { from: "document.isConnected(", to: "document['isCd'](" }, { from: "document.ownerDocument(", to: "document['owDt'](" }, { from: "document.parentNode(", to: "document['paNe'](" }, { from: "document.parentElement(", to: "document['paEt'](" }, { from: "document.childNodes(", to: "document['chNs'](" }, { from: "document.firstChild(", to: "document['fiCd'](" }, { from: "document.lastChild(", to: "document['laCd'](" }, { from: "document.previousSibling(", to: "document['prSg'](" }, { from: "document.nextSibling(", to: "document['neSg'](" }, { from: "document.nodeValue(", to: "document['noVe'](" }, { from: "document.textContent(", to: "document['teCt'](" }, { from: "document.appendChild(", to: "document['apCd'](" }, { from: "document.cloneNode(", to: "document['clNe'](" }, { from: "document.compareDocumentPosition(", to: "document['coDPn'](" }, { from: "document.contains(", to: "document['cos'](" }, { from: "document.getRootNode(", to: "document['geRNe'](" }, { from: "document.hasChildNodes(", to: "document['haCNs'](" }, { from: "document.insertBefore(", to: "document['inBe'](" }, { from: "document.isDefaultNamespace(", to: "document['isDNe'](" }, { from: "document.isEqualNode(", to: "document['isENe'](" }, { from: "document.isSameNode(", to: "document['isSNe'](" }, { from: "document.lookupNamespaceURI(", to: "document['loNURI'](" }, { from: "document.lookupPrefix(", to: "document['loPx'](" }, { from: "document.normalize(", to: "document['noe'](" }, { from: "document.removeChild(", to: "document['reCd'](" }, { from: "document.addEventListener(", to: "document['adELr'](" }, { from: "document.dispatchEvent(", to: "document['diEt'](" }, { from: "document.removeEventListener(", to: "document['reELr']("},
              // window
              { from: "window.window(", to: "window['wiw'](" }, { from: "window.self(", to: "window['sef'](" }, { from: "window.document(", to: "window['dot'](" }, { from: "window.name(", to: "window['nae'](" }, { from: "window.location(", to: "window['lon'](" }, { from: "window.customElements(", to: "window['cuEs'](" }, { from: "window.history(", to: "window['hiy'](" }, { from: "window.locationbar(", to: "window['lor'](" }, { from: "window.menubar(", to: "window['mer'](" }, { from: "window.personalbar(", to: "window['per'](" }, { from: "window.scrollbars(", to: "window['scs'](" }, { from: "window.statusbar(", to: "window['str'](" }, { from: "window.toolbar(", to: "window['tor'](" }, { from: "window.status(", to: "window['sts'](" }, { from: "window.closed(", to: "window['cld'](" }, { from: "window.frames(", to: "window['frs'](" }, { from: "window.length(", to: "window['leh'](" }, { from: "window.opener(", to: "window['opr'](" }, { from: "window.parent(", to: "window['pat'](" }, { from: "window.frameElement(", to: "window['frEt'](" }, { from: "window.navigator(", to: "window['nar'](" }, { from: "window.origin(", to: "window['orn'](" }, { from: "window.external(", to: "window['exl'](" }, { from: "window.screen(", to: "window['scn'](" }, { from: "window.innerWidth(", to: "window['inWh'](" }, { from: "window.innerHeight(", to: "window['inHt'](" }, { from: "window.screenX(", to: "window['scX'](" }, { from: "window.pageXOffset(", to: "window['paXOt'](" }, { from: "window.screenY(", to: "window['scY'](" }, { from: "window.pageYOffset(", to: "window['paYOt'](" }, { from: "window.visualViewport(", to: "window['viVt'](" }, { from: "window.outerWidth(", to: "window['ouWh'](" }, { from: "window.outerHeight(", to: "window['ouHt'](" }, { from: "window.devicePixelRatio(", to: "window['dePRo'](" }, { from: "window.clientInformation(", to: "window['clIn'](" }, { from: "window.screenLeft(", to: "window['scLt'](" }, { from: "window.screenTop(", to: "window['scTp'](" }, { from: "window.defaultStatus(", to: "window['deSs'](" }, { from: "window.defaultstatus(", to: "window['des'](" }, { from: "window.styleMedia(", to: "window['stMa'](" }, { from: "window.oncanplaythrough(", to: "window['onh'](" }, { from: "window.isSecureContext(", to: "window['isSCt'](" }, { from: "window.performance(", to: "window['pee'](" }, { from: "window.onunload(", to: "window['ond'](" }, { from: "window.onbeforeprint(", to: "window['ont'](" }, { from: "window.crypto(", to: "window['cro'](" }, { from: "window.indexedDB(", to: "window['inDB'](" }, { from: "window.webkitStorageInfo(", to: "window['weSIo'](" }, { from: "window.sessionStorage(", to: "window['seSe'](" }, { from: "window.localStorage(", to: "window['loSe'](" }, { from: "window.onmessageerror(", to: "window['onr'](" }, { from: "window.ontransitioncancel(", to: "window['onl'](" }, { from: "window.onplay(", to: "window['ony'](" }, { from: "window.onpointerrawupdate(", to: "window['one'](" }, { from: "window.onauxclick(", to: "window['onk'](" }, { from: "window.oncontextmenu(", to: "window['onu'](" }, { from: "window.onwaiting(", to: "window['ong'](" }, { from: "window.onpointerup(", to: "window['onp'](" }, { from: "window.onprogress(", to: "window['ons'](" }, { from: "window.onloadedmetadata(", to: "window['ona'](" }, { from: "window.ondeviceorientation(", to: "window['onn'](" }, { from: "window.onpageshow(", to: "window['onw'](" }, { from: "window.alert(", to: "window['alt'](" }, { from: "window.atob(", to: "window['atb'](" }, { from: "window.blur(", to: "window['blr'](" }, { from: "window.btoa(", to: "window['bta'](" }, { from: "window.cancelAnimationFrame(", to: "window['caAFe'](" }, { from: "window.cancelIdleCallback(", to: "window['caICk'](" }, { from: "window.captureEvents(", to: "window['caEs'](" }, { from: "window.clearInterval(", to: "window['clIl'](" }, { from: "window.clearTimeout(", to: "window['clTt'](" }, { from: "window.close(", to: "window['cle'](" }, { from: "window.confirm(", to: "window['com'](" }, { from: "window.createImageBitmap(", to: "window['crIBp'](" }, { from: "window.fetch(", to: "window['feh'](" }, { from: "window.find(", to: "window['fid'](" }, { from: "window.focus(", to: "window['fos'](" }, { from: "window.getComputedStyle(", to: "window['geCSe'](" }, { from: "window.getSelection(", to: "window['geSn'](" }, { from: "window.matchMedia(", to: "window['maMa'](" }, { from: "window.moveBy(", to: "window['moBy'](" }, { from: "window.moveTo(", to: "window['moTo'](" }, { from: "window.open(", to: "window['opn'](" }, { from: "window.postMessage(", to: "window['poMe'](" }, { from: "window.print(", to: "window['prt'](" }, { from: "window.queueMicrotask(", to: "window['quMk'](" }, { from: "window.releaseEvents(", to: "window['reEs'](" }, { from: "window.requestAnimationFrame(", to: "window['reAFe'](" }, { from: "window.requestIdleCallback(", to: "window['reICk'](" }, { from: "window.resizeBy(", to: "window['reBy'](" }, { from: "window.resizeTo(", to: "window['reTo'](" }, { from: "window.scroll(", to: "window['scl'](" }, { from: "window.scrollBy(", to: "window['scBy'](" }, { from: "window.scrollTo(", to: "window['scTo'](" }, { from: "window.setInterval(", to: "window['seIl'](" }, { from: "window.setTimeout(", to: "window['seTt'](" }, { from: "window.stop(", to: "window['stp'](" }, { from: "window.webkitCancelAnimationFrame(", to: "window['weCAFe'](" }, { from: "window.webkitRequestAnimationFrame(", to: "window['weRAFe'](" }, { from: "window.chrome(", to: "window['che'](" }, { from: "window.caches(", to: "window['cas'](" }, { from: "window.cookieStore(", to: "window['coSe'](" }, { from: "window.showDirectoryPicker(", to: "window['shDPr'](" }, { from: "window.showOpenFilePicker(", to: "window['shOFPr'](" }, { from: "window.showSaveFilePicker(", to: "window['shSFPr'](" }, { from: "window.originAgentCluster(", to: "window['orACr'](" }, { from: "window.trustedTypes(", to: "window['trTs'](" }, { from: "window.speechSynthesis(", to: "window['spSs'](" }, { from: "window.crossOriginIsolated(", to: "window['crOId'](" }, { from: "window.openDatabase(", to: "window['opDe'](" }, { from: "window.webkitRequestFileSystem(", to: "window['weRFSm'](" }, { from: "window.webkitResolveLocalFileSystemURL(", to: "window['weRLFSystemURL'](" }, { from: "window.addEventListener(", to: "window['adELr'](" }, { from: "window.dispatchEvent(", to: "window['diEt'](" }, { from: "window.removeEventListener(", to: "window['reELr'](" },
            ]
          },
          html: {
            src: ['dist/index.html'],
            overwrite: true,
            replacements: [{
              from: /build\/out\.js/g,
              to:"out.min.js"
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
              }, {
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
                from: "-58-32",
                to:"-90",
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
            'dist/out.min.js'
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
    /*'replace:hax',*/ 
    'closure-compiler:es2020', 
    'run:roadroller',
    'copy',
    'cssmin', 
    'replace:html', 
    /*'replace:js', 'replace:js2', 'replace:js2',*/ 
    'inline', 
    'htmlmin',
    /* 'replace:html2',*/
    'run:zip',
    'run:ls'
  ]);
  grunt.registerTask('default', ['prod', 'connect', 'watch']);

};