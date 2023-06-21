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

const callbackHandlers = new Map();

async function callModuleAction(uri, parameters) {
  return new Promise(resolve => {
    const uuid = generateUUID();
    callbackHandlers.set(uuid, resolve);

    self.postMessage({
      uuid, uri, parameters, call: true
    });
  });
}


self.onmessage = async (e) => {
  const { uri, parameters, uuid, result, call } = e.data;

  // 代表回调
  if (call) {
    const callback = callbackHandlers.get(uuid);
    if (callback) {
      callback(result);
      callbackHandlers.delete(uuid);
    }
  } else if (uri === 'minus') {
    const result = await callModuleAction('minus/minus', parameters)
    self.postMessage({
      uuid, result
    });
  } else {
    console.log('no support', uri, parameters, uuid);
  }
}
