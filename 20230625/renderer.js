import { RenderContext } from "./context.js";
import { mat4 } from "../glMatrix/index.js";

export class Camera {
  constructor() {
    this.type = 'perspective'; // 'perspective' | 'orthographic'

    this.yfov = 45.0 * Math.PI / 180.0;
    this.aspectRatio = 16.0 / 9.0;
    
    this.znear = 0.01;
    this.zfar = 10000.0;
    
    this.xmag = 1.0;
    this.ymag = 1.0;

    this.position = new Float32Array([1, 1, 1]);
    this.target = new Float32Array([0, 0, 0]);
    this.up = new Float32Array([0, 1, 0]);
  }

  projectionMatrix() {
    const projection = mat4.create();

    if (this.type === 'perspective') {
        mat4.perspective(projection, this.yfov, this.aspectRatio, this.znear, this.zfar);
    } else if (this.type === 'orthographic') {
        projection[0] = 1.0 / this.xmag;
        projection[5] = 1.0 / this.ymag;
        projection[10] = 2.0 / (this.znear - this.zfar);
        projection[14] = (this.zfar + this.znear) / (this.znear - this.zfar);
    }
    return projection;
  }

  viewMatrix() {
    const view = mat4.create();

    mat4.lookAt(view, this.position, this.target, this.up);
    return view;
}
}

export class WebGLRenderer {
  constructor(canvas, context) {
    this.gl = canvas.getContext('webgl');
    // camera 
    // context
    // renderer this
    this.context = context;
    this.animationFrameId = undefined;
  }

  start() {
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  stop() {
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = undefined;
  }

  loop() {
    if (this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
    }

    this.update();
    this.render();
  }

  update() {
    // 更新场景、节点、动画等

    // 示例：
    // const time = performance.now();
    // const deltaTime = time - lastTime;
    // lastTime = time;
    // updateScene(deltaTime);
    // updateAnimations(deltaTime);
  }

  render() {
    // 清空画布
    this.gl.clearColor(1.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // // 使用着色器程序
    // gl.useProgram(this.renderContext.shaderProgram);

    // // 设置顶点属性指针
    // const positionAttributeLocation = gl.getAttribLocation(this.renderContext.shaderProgram, 'a_position');
    // gl.enableVertexAttribArray(positionAttributeLocation);

    // // 绑定和启用顶点缓冲区
    // const positionBuffer = this.renderContext.buffers['position'];
    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    // // 绘制网格
    // const mesh = this.renderContext.meshes['mesh'];
    // mesh.primitives.forEach((primitive) => {
    //   // 设置材质属性
    //   const material = this.renderContext.materials[primitive.material];
    //   material.setUniforms();

    //   // 绑定并启用索引缓冲区
    //   const indexBuffer = primitive.indexBuffer;
    //   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    //   // 执行绘制命令
    //   gl.drawElements(gl.TRIANGLES, primitive.numIndices, gl.UNSIGNED_SHORT, 0);
    // });

    // // 禁用顶点属性指针
    // gl.disableVertexAttribArray(positionAttributeLocation);
  }
}

// setShaderProgram(vertexShaderSource, fragmentShaderSource) {
//   const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vertexShaderSource);
//   const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

//   this.shaderProgram = this.gl.createProgram();
//   this.gl.attachShader(this.shaderProgram, vertexShader);
//   this.gl.attachShader(this.shaderProgram, fragmentShader);
//   this.gl.linkProgram(this.shaderProgram);

//   if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
//     console.error('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(this.shaderProgram));
//   }
// }

// loadShader(type, source) {
//   const shader = this.gl.createShader(type);
//   this.gl.shaderSource(shader, source);
//   this.gl.compileShader(shader);

//   if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
//     console.error('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
//     this.gl.deleteShader(shader);
//     return null;
//   }

//   return shader;
// }

// createBuffer(bufferName, data) {
//   const buffer = this.gl.createBuffer();
//   this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
//   this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
//   this.buffers[bufferName] = buffer;
// }

// createTexture(textureName, imageSrc) {
//   const texture = this.gl.createTexture();
//   this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

//   // 设置纹理参数和加载图像数据到纹理对象中
//   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
//   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
//   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
//   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

//   const image = new Image();
//   image.onload = () => {
//     this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
//     this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
//   };
//   image.src = imageSrc;

//   this.textures[textureName] = texture;
// }
