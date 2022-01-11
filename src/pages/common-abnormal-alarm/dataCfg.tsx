import utils from "../../public/js/utils"

export const levelConfigList = [
  { title: utils.intl('桌面通知'), type: "desktop" },
  { title: utils.intl('声光通知'), type: "optic" },
  { title: utils.intl('短信通知'), type: "note" },
]

export const receiverDayMap = [
  { value: 1, name: utils.intl('全天') },
  { value: 2, name: `${utils.intl('白天')}(08:00 ~ 20:00)` },
  { value: 3, name: `${utils.intl('晚上')}(20:00 ~ ${utils.intl('次日')}08:00)` },
]