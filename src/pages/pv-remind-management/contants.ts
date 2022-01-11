import utils from "../../public/js/utils"

export enum RemindType {
  Contract = 'EXPIRE_CONTRACT',
  ElectricityPrice = 'ELECTRICITY',
  ReportForms = 'REPORTERS',
}

export enum RemindWay {
  Phone = 'PHONE',
  Email = 'EMAIL',
  App = 'APP',
}

export enum PushCycle {
  Day = 'DAY',
  Week = 'WEEK',
  Month = 'MONTH',
}

export enum LanguageType {
  CN = 'CHINESE',
  EN = 'ENGLISH',
}

export enum AdvanceTimeCycle {
  Day = 'DAY',
  Week = 'WEEK',
  Month = 'MONTH',
}

export enum ReportTimeCycle {
  Day = 'DAY',
  Week = 'WEEK',
  Month = 'MONTH',
}

export const RemindTypeList = [
  { title: utils.intl('remind.合同'), value: RemindType.Contract },
  { title: utils.intl('remind.电价'), value: RemindType.ElectricityPrice },
  { title: utils.intl('remind.报表'), value: RemindType.ReportForms },
]

export const RemindWayList = [
  { title: utils.intl('remind.短信'), value: RemindWay.Phone },
  { title: utils.intl('remind.邮箱'), value: RemindWay.Email },
  { title: 'APP', value: RemindWay.App },
]

export const PushCycleList = [
  { title: utils.intl('remind.每天'), value: PushCycle.Day },
  { title: utils.intl('remind.每周周一'), value: PushCycle.Week },
  { title: utils.intl('remind.每月1日'), value: PushCycle.Month },
]

export const LanguageTypeList = [
  { title: utils.intl('remind.中文'), value: LanguageType.CN },
  { title: utils.intl('remind.英文'), value: LanguageType.EN },
]
