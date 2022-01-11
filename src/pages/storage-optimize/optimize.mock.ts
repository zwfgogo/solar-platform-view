import utils from '../../public/js/utils'

export const mock_fetchStrategyDetail = [{
  'id': 19466,
  'title': utils.intl('策略1'),
  'runStrategyDetails': [{
    'id': 20086,
    'title': null,
    'runMonth': '1,2,3,4,5,6,7,8,9,10,11,12',
    'standbyTime': 2,
    'antiBackfeedSet': 2,
    'chargeTimes': [['00:00', '04:00']],
    'dischargeTimes': [['04:00', '18:00']],
    'storageTimes': [['18:00', '00:00']],
    'chargeDischargeParam': {
      'id': 20085,
      'maxChargePower': null,
      'maxDischargePower': null,
      'chargeVoltage': 2,
      'dischargeCurrent': 2,
      'runStrategyControlType': {
        'id': 5041,
        'name': 'Voltage/CurrentControl',
        'title': utils.intl('电压/电流控制'),
        'sn': 2,
        'activity': true
      }
    },
    'endControlParam': {
      'id': 19451,
      'maxSoc': null,
      'minSoc': null,
      'chargeRateLimit': 12,
      'dischargeEndVoltage': 2,
      'runStrategyControlType': {
        'id': 5041,
        'name': 'Voltage/CurrentControl',
        'title': utils.intl('电压/电流控制'),
        'sn': 2,
        'activity': true
      }
    },
    'runStrategyControlMode': {'id': 5043, 'name': 'Manual', 'title': utils.intl('手动模式'), 'sn': 2, 'activity': true},
    'energyUnitId': 19580
  }]
}]