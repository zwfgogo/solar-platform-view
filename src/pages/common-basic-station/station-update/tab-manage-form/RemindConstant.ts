import utils from "../../../../public/js/utils";

export const RemindList = [{
  name: utils.intl('tabManageLook.开启'),
  value: 1,
}, {
  name: utils.intl('tabManageLook.关闭'),
  value: 0,
}];

export const RemindTimeList = [{
  name: utils.intl('日'),
  value: 'day',
}
/* , {
  name: utils.intl('周'),
  value: 'week',
} */
, {
  name: utils.intl('月'),
  value: 'month',
}, {
  name: utils.intl('年'),
  value: 'year',
}];

export const RemindTimeMap = {
  day: utils.intl('日'),
  week: utils.intl('周'),
  month: utils.intl('月'),
  year: utils.intl('年'),
};
