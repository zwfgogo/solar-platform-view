interface BooleanMap {
  [key: string]: boolean;
}

const loopStatus: BooleanMap = {};
const loopRunningStatus: BooleanMap = {};

function sleep(time: number) {
  return new Promise(r => {
    setTimeout(r, time);
  });
}

export const initLoopHelper = (namespace: string) => ({
  startLoop: function* (actionName: string, put: any, delay: number = 5000) {
    const key = `${namespace}/${actionName}`;
    loopStatus[key] = true;
    if(loopRunningStatus[key]) {
      return;
    }
    loopRunningStatus[key] = true;
    while(loopStatus[key]) {
      yield put({ type: actionName });
      yield sleep(delay);
    }
    loopRunningStatus[key] = false;
  },
  endLoop: function(actionName: string) {
    const key = `${namespace}/${actionName}`;
    loopStatus[key] = false;
  }
});
