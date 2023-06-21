
function generateUUID() {
  let uuid = '', i, random;
  
  for (i = 0; i < 32; i++) {
    random = (Math.random() * 16) | 0;
    
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-';
    }
    
    uuid += (i === 12 ? 4 : (i === 16 ? (random & 3) | 8 : random)).toString(16);
  }
  
  return uuid;
}

/**
 * 执行接口
 */
export class Executable {
  // 这个方法需要实现类去实现
  async execute(parameters) {}
}

/**
 * 模块类
 */
export class BaseModule {
  constructor(name) {
    this.name = name;
  }

  /**
   * 子类必须实现该方法，用于执行特定的行为或操作
   * @param {string} uri - 执行操作的唯一标识符
   * @param {object} parameters - 执行操作所需的参数
   * @returns {Promise<any>} - 返回执行结果的 Promise 对象
   */
  async execute(uri, parameters) {
    // 子类需实现该方法
  }
}

/**
 * 模块群组类
 */
export class ModuleGroup {
  constructor(name) {
    this.name = name;
    this.modules = new Map();
  }

  /**
   * 添加模块到群组中
   * @param {BaseModule} module - 待添加的模块
   */
  add(module) {
    module.group = this;
    this.modules.set(module.name, module);
  }

  /**
   * 从群组中移除模块
   * @param {BaseModule} module - 待移除的模块
   */
  remove(module) {
    module.group = undefined;
    this.modules.delete(module.name);
  }

  /**
   * 执行指定 URI 对应的操作
   * @param {string} uri - 执行操作的 URI
   * @param {object} parameters - 执行操作所需的参数
   * @returns {Promise<any>} - 返回执行结果的 Promise 对象
   */
  async execute(uri, parameters) {
    const [moduleName, ...rest] = uri.split('/');
    const module = this.modules.get(moduleName);

    if (!module) {
      throw new Error(`Module ${moduleName} not found in group ${this.name}`);
    }

    const actionName = rest.join('/');
    return module.execute(actionName, parameters);
  }
}

/**
 * 标准模块类
 */
export class StdModule extends BaseModule {
  constructor(name) {
    super(name);

    this.executables = [];
  }

  /**
   * 添加操作到标准模块中
   * @param {string} uri - 操作的名称
   * @param {Executable} execuatable - 待添加的操作
   */
  addExecutable(uri, execuatable) {
    this.executables.push({uri, execuatable});
  }

  /**
   * 执行指定 URI 对应的操作
   * @param {string} uri - 执行操作的 URI
   * @param {object} parameters - 执行操作所需的参数
   * @returns {Promise<any>} 返回执行结果的 Promise 对象
   */
  async execute(uri, parameters) {
    const execuatableName = uri;
    const execuatable = this.executables.find(({uri}) => uri === execuatableName)?.execuatable;

    if (!execuatable) {
      throw new Error(`Execuatable ${execuatableName} not found in module ${this.name}`);
    }

    return execuatable.execute(parameters);
  }
}

export class WorkerModule extends BaseModule {
  constructor(name, worker) {
    super(name);

    this.worker = worker;
    this.callbackHandlers = new Map();
    this.worker.onmessage = (e) => {
      this.callbackHandle(e);
    }
  }

  async callbackHandle(event) {
    const { uuid, result, call, uri, parameters } = event.data;

    if (call) {
      const result = await this.group.execute(uri, parameters);
      this.worker.postMessage({
        call: true,
        uuid,
        result
      });
    } else {
      const callback = this.callbackHandlers.get(uuid);

      if (callback) {
        callback(result);
        this.callbackHandlers.delete(uuid);
      }
    }
  }

  async execute(uri, parameters) {
    return new Promise(resolve => {
      const uuid = generateUUID();
      this.callbackHandlers.set(uuid, resolve);

      this.worker.postMessage({
        uri, parameters, uuid
      });
    });
  }
}
