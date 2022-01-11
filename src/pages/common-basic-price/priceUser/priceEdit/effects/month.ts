import utils from '../../../../../public/js/utils';

export default {
  *unselectMonth(action, { call, put,select,take }) {
    const { monthSelected } = yield select(state => state.priceEdit);
    const { value } = action.payload;
    const newMonthSelected = utils.delFromArrByIndex(monthSelected, monthSelected.indexOf(value));
    yield put({
      type: 'updateToView',
      payload: {
        monthSelected: newMonthSelected,
      }
    });
  },
  *selectMonth(action, { call, put,select,take }) {
    const { monthSelected } = yield select(state => state.priceEdit);
    const { value } = action.payload;
    const newMonthSelected = [...monthSelected, value];
    yield put({
      type: 'updateToView',
      payload: {
        monthSelected: newMonthSelected,
      }
    });
  },
};
