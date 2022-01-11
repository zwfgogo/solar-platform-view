let MOCK_OPEN = false;

export function mockControllWrap(service, excludeApi = [], option = {}) {
  if (option.closeControll) return service;
  if (!MOCK_OPEN) {
    let keys = Object.keys(service).filter(
      key => excludeApi.indexOf(key) === -1
    );
    keys.forEach(key => {
      delete service[key];
    });
  } else {
    let keys = Object.keys(service).filter(
      key => excludeApi.indexOf(key) !== -1
    );
    keys.forEach(key => {
      delete service[key];
    });
  }
  return service;
}
