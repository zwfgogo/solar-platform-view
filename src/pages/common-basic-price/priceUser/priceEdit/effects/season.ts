export default {
    *addSeason(action, { call, put,select }) {
        const { editSeason } = yield select(state => state.priceEdit);
        yield put({
            type: 'updateToView',
            payload: {editSeason: [...editSeason, { id: new Date().getTime(), seasonPriceDetails: [], priceRates: [] }]}
        });
    },
    *deleteSeason(action, { call, put,select }) {
        // 将季节的月份删除
        const { editSeason,forms, monthSelected } = yield select(state => state.priceEdit);
        const { index, id } = action.payload;
        const delmonth = forms[id].getFieldsValue().runMonth;
        if (delmonth.length) {
            yield put({
                type: 'updateToView',
                payload: {monthSelected: monthSelected.filter(val => {
                    return delmonth.indexOf(val) === -1;
                })}
            });
        }
        const data1 = editSeason.slice(0, index);
        const data2 = editSeason.slice(index + 1, editSeason.length);
        yield put({
            type: 'updateToView',
            payload: {editSeason: [...data1, ...data2]}
        });
    },
    *editSeasonact(action, { call, put,select }) {
        const { editSeason } = yield select(state => state.priceEdit);
        const { index, type, val } = action.payload;
        const data1 = editSeason.slice(0, index);
        const indexValue = { ...editSeason.slice(index, index + 1)[0] };
        const data2 = editSeason.slice(index + 1, editSeason.length);
        indexValue[type] = val;
        yield put({
            type: 'updateToView',
            payload: {editSeason: [...data1, indexValue, ...data2],}
        });
    },
};
