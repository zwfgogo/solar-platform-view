/**
 * Created by zhuweifeng on 2019/11/12.
 */

let list = [];
for (let index = 0; index < 3; index++) {
  list.push({
    key: index,
    name: '胡彦斌',
    age: 32,
    count: index,
    address: '西湖区湖底公园1号',
    num:index+1,
    time:"05:30",
    abbreviation:10,
    power:50,
    content:'设备名称',
    date:'2019-10-27',
    value:20+index
  });
}

export default {
  'GET /api/select':{
    errorMsg: 'Succeed',
    errorCode:0,
    results: list,
    }
}