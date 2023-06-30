import * as NT from '../20230620/core.js';
import { WebGLRenderer, Camera } from './renderer.js';
import { RenderContext } from './context.js';

export const Executable = NT.Executable;
export const ContextExecutable = NT.ContextExecutable;
export const ModuleGroup = NT.ModuleGroup;
export const BaseModule = NT.BaseModule;
export const StdModule = NT.StdModule;
export const WorkerModule = NT.WorkerModule;

class InitExecute extends ContextExecutable {
  async execute(parameters) {
    const { canvas } = parameters;
    
    this.context.renderer = new WebGLRenderer(canvas, this.context);
    this.context.camera = new Camera();

    return true;
  }
}

class LoadExecute extends ContextExecutable {
  async execute(parameters) {
    const { url } = parameters;
    const context = new RenderContext();

    context.load(url);

    this.context.context = context;

    return true;
  }
}

class RenderExecute extends ContextExecutable {
  async execute(parameters) {

    this.context.renderer.start();

    return true;
  }
}

export class RendererModule extends StdModule {
  constructor() {
    super('renderer');

    // 用于存储缓存
    this.context = {};
    this.addExecutable('init', new InitExecute(this.context));
    this.addExecutable('load', new LoadExecute(this.context));
    this.addExecutable('render', new RenderExecute(this.context));
  }
}
