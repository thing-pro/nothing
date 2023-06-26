// API设计
// scene
//   - node 
//     - node
//   - node
//   - node

// 最外部是 命令式api
// =======

//模块化

// 同样是内部调用的 api
// =======

const scene = new NT.Scene();
const camera = new NT.Camera(); // PerspectiveCamera  OrthographicCamera CubeCamera

const plane = new NT.Node(); // MeshNode LightNode CameraNode ...
const mesh = new NT.Mesh(); // PlaneMesh CubeMesh ...
const material = new NT.Material(); // PhoneMaterial UnlitMaterial PBRMaterial ....

const lightNode = new NT.Node();
const light = new NT.Light();
light.setLight(light);

mesh.setMaterial(material);
plane.setMesh(mesh);

const cameraNode = new NT.Node();
cameraNode.setCamera(camera);

scene.addNode(plane);
scene.addNode(lightNode);
scene.addNode(cameraNode);

const pipe = new NT.Pipeline(); // StandardPipeline SketchfabPipeline 

// step
//  - pass options // 通用
//  - pass instance // 通用 pass 内部的 glWrapper 有不同的实现
//  - config and parameters // 通用
// step 用于自动执行 pass
const step = new NT.PipelineStep();  // MainLoopStep SSRStep ...

pipe.addStep(step);

scene.setPipeline(pipe);
// scene.setEnvironment();

scene.render();

pipe.render(scene, camera);

const shader = new NT.Shader();
shader.setSource();

const program = new NT.Program();
program.setVertexSahder();
program.setFragmentSahder();

const technique = new NT.Technique(program);
technique.setProgram();
technique.setAttribute();
technique.setUniform();

const techMaterial = new NT.TechniqueMaterial();
techMaterial.setTechnique(technique);

// 以上可以改成
// =======

const runtime = new NT.Runtime();

runtime.run({
  // ... 上下文信息
})

// 多渲染器的设计 

// const shaderData = new NT.ShaderData();
// shaderData.upload(scene, camera);


 

// pipeline 分发到多渲染器进行渲染 需要渲染上下文也同步 比较麻烦
// 多模块的可以使用 共同的缓存模块进行数据的统一处理 在将数据分发到 各个显然模块进行处理



// 更底层的渲染封装
// =======
// 减少 framebuffer 的使用 仅对输出内容 使用新的 renderTarget 输出

// 在 pipeline step 内部 的封装

// renderTarget 
//   - framebuffer
//   - texture
/*
RenderTarget 可以具有以下特征和属性：

尺寸（Size）：RenderTarget 可以具有自定义的宽度和高度，决定了渲染结果的输出大小。

格式（Format）：RenderTarget 可以指定渲染结果的像素格式，例如 RGBA、RGB、深度+模板缓冲等。

纹理（Texture）：RenderTarget 可以是一个纹理对象，允许将渲染结果用作纹理贴图。这样可以方便地在其他渲染过程中使用渲染结果。

多重采样（Multisampling）：RenderTarget 可以启用多重采样来提高渲染结果的平滑度和抗锯齿效果。

深度和模板缓冲区（Depth and Stencil Buffer）：RenderTarget 可以附带深度和模板缓冲区，用于进行深度测试和模板运算。
*/
const target = new RenderTarget() // => framebuffer color|depth|scissor;
const pass = new StandardPass();
const main = new MainLoop();

// Pass
// RenderPass extends Pass
// PostPass extends Pass
// 一个 组合 pass
// GroupPass extends Pass
// ...

pass
  .renderTargetPool //渲染目标池
  .readBuffer = renderTargetPool.get()
  .writeBuffer
  .poolBuffers = Map .free()

pass.setRenderTarget(target);
pass.setRenderTarget(null);

pass.render();

main.setCamera(cameraNode);
main.setRenderTarget(target); // bindframebuffer
main.clear();
main.resize();
// main.blendFunc = ;
main.render(scene, camera);
pass.clear();
pass.render();
main.render(node, camera);

// pass 内
renderTarget

ProgramWrapper.use

configPipeline // blend
configAttribute
configUniform
configTexture
configOver
draw
drawOver

// 需要输出的 framebuffer 内容 需要单独绑定一个 renderTarget 
// 其他的 使用 readbuffer 和 writebuffer 交替使用即可
