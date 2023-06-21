self.onmessage = function(e) {
  const { uri, parameters, uuid } = e.data;

  if (uri === 'minus') {
    self.postMessage({
      uuid, result: parameters.a - parameters.b
    });
  } else {
    console.log('no support', uri, parameters, uuid);
  }
}
