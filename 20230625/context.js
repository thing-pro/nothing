let idCount = 0;

const CompononentCount = new Map(
  [
      ['SCALAR', 1],
      ['VEC2', 2],
      ['VEC3', 3],
      ['VEC4', 4],
      ['MAT2', 4],
      ['MAT3', 9],
      ['MAT4', 16]
  ]
);

export class Subject {
  constructor(name) {
    this._id = idCount++;
    this.name = name;
  }

  fromJson (json) {
    for (let key in json) {
      if (this.hasOwnProperty(key)) {
        this[key] = json[key];
      }
    }
  }

  destory() {}
}

export class Buffer extends Subject {
  constructor(name) {
    super(name);

    this.uri = undefined;
    this.byteLength = undefined;

    this._buffer = undefined;
  }

  fromJson(json) {
    super.fromJson(json);

    if (json.buffer) {
      this._buffer = new Float32Array(json.buffer);
    }
  }

  async load () {
    if (this._buffer !== undefined) {
      return true;
    }

    this._buffer = await fetch(this.uri).then(r => r.arrayBuffer());
    return true;
  }
}

export class BufferView extends Subject {
  constructor(name) {
    super(name);

    this.buffer = undefined;
    this.byteOffset = undefined;
    this.byteLength = undefined;
    this.byteStride = undefined;
  }
}

export class Accessor extends Subject {
  constructor(name) {
    super(name);

    this.bufferView = undefined;
    this.byteOffset = undefined;
    this.componentType = undefined;
    this.normalized = false;
    this.count = undefined;
    this.type = undefined;
    this.max = undefined;
    this.min = undefined;

    this._typedView = undefined;
  }

  getComponentCount(type) {
    return CompononentCount.get(type);
  }

  getComponentSize(componentType) {
    switch (componentType) {
      case BYTE:
      case UNSIGNED_BYTE:
        return 1;
      case SHORT:
      case UNSIGNED_SHORT:
        return 2;
      case UNSIGNED_INT:
      case FLOAT:
        return 4;
      default:
        return 0;
    }
  }

  getTypedView(context) {
    if (this._typedView !== undefined) {
      return this._typedView;
    }

    if (this.bufferView !== undefined) {
      const bufferView = context.bufferViews[this.bufferView];
      const buffer = context.buffers[bufferView.buffer];
      const byteOffset = this.byteOffset + bufferView.byteOffset;
      const componentSize = this.getComponentSize(this.componentType);
      let componentCount = this.getComponentCount(this.type);

      if (bufferView.byteStride !== 0) {
        componentCount = bufferView.byteStride / componentSize;
      }

      const arrayLength = this.count * componentCount;

      switch (this.componentType) {
        case BYTE:
          this._typedView = new Int8Array(buffer._data, byteOffset, arrayLength);
          break;
        case UNSIGNED_BYTE:
          this._typedView = new Uint8Array(buffer._data, byteOffset, arrayLength);
          break;
        case SHORT:
          this._typedView = new Int16Array(buffer._data, byteOffset, arrayLength);
          break;
        case UNSIGNED_SHORT:
          this._typedView = new Uint16Array(buffer._data, byteOffset, arrayLength);
          break;
        case UNSIGNED_INT:
          this._typedView = new Uint32Array(buffer._data, byteOffset, arrayLength);
          break;
        case FLOAT:
          this._typedView = new Float32Array(buffer._data, byteOffset, arrayLength);
          break;
      }
    }

    if (this._typedView === undefined) {
      console.warn('Failed to convert buffer view to typed view!: ' + this.bufferView);
    }

    return this._typedView;
  }
}

export class Mesh extends Subject {
  constructor(name) {
    super(name);

    // 目前只支持 顶点和法线
    this.position = undefined;
    this.normal = undefined;

    this.indices = undefined;
    this.material = undefined;
    this.mode = undefined;
  }
}

export class Node extends Subject {
  constructor(name) {
    super(name);

    this.mesh = undefined;
    this.children = undefined;
  }
}

export class Scene extends Subject {
  constructor(name) {
    super(name);

    this.nodes = undefined;
  }
}

export class Material extends Subject {
  constructor(name) {
    super(name);

    this.type = 'unlit';
    this.alphaMode = false;
    this.alphaCutoff = 0.5;
    this.doubleSided = false;

    this.baseColorFactor = undefined;
  }
}

const ContextKeys = new Map(
  [
      ['buffers', Buffer],
      ['bufferViews', BufferView],
      ['accessors', Accessor],
      ['meshes', Mesh],
      ['nodes', Node],
      ['scenes', Scene],
      ['materials', Material]
  ]
);

export class RenderContext {
  constructor() {
    this.scene = undefined;

    this.buffers = {};
    this.bufferViews = {};
    this.accessors = {};
    this.meshes = {};
    this.nodes = {};
    this.scenes = {};
    this.materials = {};
  }

  async load(url) {
    this.url = url;

    const json = await fetch(this.url).then(r => r.json());

    for (let key in json) {
      if (key === 'scene') {
        this.scene = json['scene'];
        continue;
      }

      for (let keyKey in json[key]) {
        if (this.hasOwnProperty(key)) {
          const clazz = ContextKeys.get(key);
          this[key][keyKey] = new clazz(keyKey);
          this[key][keyKey].fromJson(json[key][keyKey]);

          if (key === 'buffers') {
            await this[key][keyKey].load();
          }
        }
      }
    }
  }

  add(ctx) {
    for (let key in ctx) {
      if (key === 'scene') {
        continue;
      }

      if (this.hasOwnProperty(key)) {
        for (let keyKey in ctx[key]) {
          // 没有的前提下 会合并 有就会被忽略
          if (!this[key].hasOwnProperty(keyKey)) {
            this[key][keyKey] = ctx[key][keyKey];
          } else {
            console.warn(`combine context ${key} ${keyKey} repeat !`);
          }
        }
      }
    }
  }

  remove(ctx) {
    for (let key in ctx) {
      if (key === 'scene') {
        continue;
      }

      if (this.hasOwnProperty(key)) {
        for (let keyKey in ctx[key]) {
          // 没有的前提下 会合并 有就会被忽略
          if (this[key].hasOwnProperty(keyKey)) {
            this[key][keyKey].destory();
            delete this[key][keyKey];
          } else {
            console.warn(`remove context ${key} ${keyKey} not found !`);
          }
        }
      }
    }
  }
}
