import { Moment } from 'moment'
import utils from '../public/js/utils'

export const maxLengthRule = (length: number) => {
  return {
    validator: (rule, value: string, callback) => {
      if (value && value.length > length) {
        return Promise.reject(utils.intl('common.请输入{$}字符以内', length))
      }
      return Promise.resolve()
    }
  }
}

export const inputLengthRule = (length: number, label = '') => {
  return {
    validator: (rule, value: any, callback) => {
      let labelText = label ? label : ''
      if (typeof value == 'number') {
        let valueTxt = value + ''
        if (valueTxt.indexOf('.') != -1) {
          if (valueTxt && valueTxt.length - 1 > length) {
            return Promise.reject(utils.intl('common.请输入{$}字符以内', length))
          }
        } else {
          if (valueTxt && valueTxt.length > length) {
            return Promise.reject(utils.intl('common.请输入{$}字符以内', length))
          }
        }
      } else {
        if (value && value.length > length) {
          return Promise.reject(utils.intl('common.请输入{$}字符以内', length))
        }
      }
      return Promise.resolve()
    }
  }
}

// max1整数部分，max2小数部分
export const numberRule = (max1, max2, message) => {
  return {
    validator: (rule, value: number, callback) => {
      if (max1 == null) {
        max1 = 9999
      }
      if (max2 == null) {
        max2 = 9999
      }
      if (value == null) {
        return Promise.resolve()
      }
      let valueStr = value.toString()
      let parts = valueStr.split('.')
      if (parts[0].length > max1) {
        return Promise.reject(message)
      }
      if (parts[1] && parts[1].length > max2) {
        return Promise.reject(message)
      }
      return Promise.resolve()
    }
  }
}

export const numberRangeRule = (min, max, message) => {
  return {
    validator: (rule, value: number, callback) => {
      if (value == null) {
        return Promise.resolve()
      }
      if (value < min || value > max) {
        return Promise.reject(message)
      }
      return Promise.resolve()
    }
  }
}

export const numberRangePrecisionRule = (min, max, precision) => {
  return {
    validator: (rule, value: number, callback) => {
      if (value == null) {
        return Promise.resolve()
      }
      if (value < min || value > max) {
        return Promise.reject(utils.intl('rule.取值范围[{0}-{1}]', min, max))
      }
      let valueStr = value.toString()
      let parts = valueStr.split('.')
      if (parts[1] && parts[1].length > precision) {
        return Promise.reject(utils.intl('rule.保留{0}位小数', precision))
      }
      return Promise.resolve()
    }
  }
}

export const minLengthRule = (length: number) => {
  return {
    validator: (rule, value: any, callback) => {
      if (value.length < length) {
        return Promise.reject(`长度必须不小于${length}`)
      }
      return Promise.resolve()
    }
  }
}

export const noSpaceRule = () => {
  return {
    validator: (rule, value: any, callback) => {
      if (value.indexOf(' ') != -1) {
        return Promise.reject(utils.intl('无效字符'))
      }
      return Promise.resolve()
    }
  }
}

export const lengthEqualRule = (length: number) => {
  return {
    validator: (rule, value: any, callback) => {
      if (typeof value == 'number') {
        let valueTxt = value + ''
        if (valueTxt.length != length) {
          return Promise.reject(`请输入${length}位`)
        }
      } else {
        if (value && value.length > length) {
          return Promise.reject(`请输入${length}字符以内`)
        }
      }
      return Promise.resolve()
    }
  }
}

/**
 * 校验结束日期是否小于开始时间
 */
export const dateSmallRule = (getStartDate: () => Moment, message) => {
  return {
    validator: (rule, endDate: Moment, callback) => {
      let startDate = getStartDate()
      if (!endDate || !startDate) {
        return Promise.resolve()
      }
      if (endDate.valueOf() < startDate.valueOf()) {
        return Promise.reject(message)
      }
      return Promise.resolve()
    }
  }
}

export const existRule = (list: (string | number)[], oldValue?: string | number) => {
  return {
    validator: (rule, value: any, callback) => {
      if (value === oldValue) {
        return Promise.resolve()
      }
      if (list.indexOf(value) != -1) {
        return Promise.reject('已存在')
      }
      return Promise.resolve()
    }
  }
}

export const exist1Rule = (getList: () => (string | number)[], oldValue?: string | number) => {
  return {
    validator: (rule, value: any, callback) => {
      if (value === oldValue) {
        return Promise.resolve()
      }
      console.log(getList())
      if (getList().indexOf(value) != -1) {
        return Promise.reject('已存在')
      }
      return Promise.resolve()
    }
  }
}

export const hasCheckedItem = () => {
  return {
    validator: (rule, value: number[], callback) => {
      if (value.length == 0) {
        return Promise.reject('至少选择一项')
      }
      return Promise.resolve()
    }
  }
}

export const checkMobile = () => {
  return {
    validator: (rule, value: string, callback) => {
      if (!value) {
        return Promise.resolve()
      }
      if (!/^\d{11}$/.test(value.trim())) {
        return Promise.reject('手机格式错误')
      }
      return Promise.resolve()
    }
  }
}

export const checkPhone = (option: any = {}) => {
  return {
    validator: (rule, value: any, callback) => {
      let opt: any = {}
      if (typeof option === 'function') {
        opt = option()
      } else if (typeof option === 'object') {
        opt = option
      }
      const { required = false, maxLength } = opt

      if (!value || !value.phone) {
        if (required) {
          return Promise.reject(utils.intl('请输入16数字以内联系人电话'))
        }
        return Promise.resolve()
      }

      const { phone = '', code = '' } = value

      if (!/^[0-9]{1,16}$/.test(phone.trim())) {
        return Promise.reject(utils.intl('请输入16数字以内联系人电话'))
      }

      if (maxLength && phone.length > maxLength) {
        return Promise.reject(utils.intl('请输入16数字以内联系人电话'))
      }

      if (!code) {
        return Promise.reject(utils.intl('rule.请选择区号'))
      }

      return Promise.resolve()
    }
  }
}

export const checkEmail = () => {
  return {
    validator: (rule, value: string, callback) => {
      if (!value) {
        return Promise.resolve()
      }
      if (!/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(value.trim())) {
        return Promise.reject('邮箱格式错误')
      }
      return Promise.resolve()
    }
  }
}

export const ipAddressRule = () => {
  return {
    validator: (rule, value: string, callback) => {
      value = value.trim()
      if (!value) {
        return Promise.resolve()
      }
      if (!(/^[\d|\.]*$/.test(value))) {
        return Promise.reject('IP格式不正确')
      }
      if (value.indexOf(' ') != -1) {
        return Promise.reject('IP格式不正确')
      }
      let parts = value.split('.')
      if (parts.length != 4) {
        return Promise.reject('IP格式不正确')
      }
      for (let part of parts) {
        try {
          if (part == '') {
            return Promise.reject('IP格式不正确')
          }
          let number = Number(part)
          if (number < 0 || number > 255) {
            return Promise.reject('IP格式不正确')
          }
        } catch (e) {
          return Promise.reject('IP格式不正确')
        }
      }
      return Promise.resolve()
    }
  }
}

// 必须以中文、大小写字母、数字开头
export const startWithChineseLetterOrNumberRule = () => {
  return {
    validator: (rule, value: string, callback) => {
      if (!value) {
        return Promise.resolve()
      }
      if (!/^([\u4e00-\u9fa5]|[a-zA-Z]|\d)/.test(value)) {
        return Promise.reject(utils.intl('必须以中文、大小写字母、数字开头'))
      }
      return Promise.resolve()
    }
  }
}

// 必须以中文、大小写字母开头
export const startWithChineseLetterRule = () => {
  return {
    validator: (rule, value: string, callback) => {
      if (!value) {
        return Promise.resolve()
      }
      if (!/^([\u4e00-\u9fa5]|[a-zA-Z])/.test(value)) {
        return Promise.reject('必须以中文、大小写字母开头')
      }
      return Promise.resolve()
    }
  }
}

// 必须以大小写字母开头
export const startWithLetterRule = () => {
  return {
    validator: (rule, value: string, callback) => {
      if (!value) {
        return Promise.resolve()
      }
      if (!/^([a-zA-Z])/.test(value)) {
        return Promise.reject(utils.intl('必须以大小写字母开头'))
      }
      if (!/^[a-zA-Z\d]+$/.test(value)) {
        return Promise.reject(utils.intl('只能输入大小写字母和数字'))
      }
      return Promise.resolve()
    }
  }
}
export const numberStringRule = () => {
  return {
    validator: (rule, value: string, callback) => {
      if (!value) {
        return Promise.resolve()
      }
      if (!/^\d+$/.test(value)) {
        return Promise.reject('请输入数字')
      }
      return Promise.resolve()
    }
  }
}

export const numberStringPrecisionRule = (min, max, precision) => {
  return {
    validator: (rule, value: string, callback) => {
      if (!value) {
        return Promise.resolve()
      }
      if (!/^-?\d+(\.\d+)?$/.test(value)) {
        return Promise.reject(utils.intl('请输入数字'))
      }
      const num = Number(value)
      if (num < min || num > max) {
        return Promise.reject(utils.intl('rule.取值范围[{0}-{1}]', min, max))
      }
      let parts = value.split('.')
      if (parts[1] && parts[1].length > precision) {
        return Promise.reject(utils.intl('rule.保留{0}位小数', precision))
      }
      return Promise.resolve()
    }
  }
}

// 不能以数字开头
export const startWithoutNumberRule = () => {
  return {
    validator: (rule, value: string, callback) => {
      if (!value) {
        return Promise.resolve()
      }
      if (/^(\d)/.test(value)) {
        return Promise.reject('不能以数字开头')
      }
      return Promise.resolve()
    }
  }
}



// 只能输入英文和数字
export const letterAndNumberRule = () => {
  return {
    validator: (rule, value: string, callback) => {
      if (!value) {
        return Promise.resolve()
      }
      if (!/^[a-zA-Z\d]+$/.test(value)) {
        return Promise.reject(utils.intl('只能输入大小写字母和数字'))
      }
      return Promise.resolve()
    }
  }
}

// 只能输入英文和数字、小数点
export const letterAndNumberAndSpotRule = () => {
  return {
    validator: (rule, value: string, callback) => {
      if (!value) {
        return Promise.resolve()
      }
      if (!/^[a-zA-Z\d.]+$/.test(value)) {
        return Promise.reject(utils.intl('只能输入字母、数字、小数点'))
      }
      return Promise.resolve()
    }
  }
}

/**
* 验证普通字串，只要字串中不包含特殊字符即可
*/
export const checkTextDataForNORMA = () =>{
  return {
    validator: (rule, value: string, callback) => {
      if (!value) {
        return Promise.resolve()
      }
      if (!/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(value)) {
        return Promise.reject(utils.intl('不允许输入特殊字符'))
      }
      return Promise.resolve()
    }
  }
}

// 其数据类型与所选的数据类型相同 int32, float, double
export type GetType = () => 'int32'|'float'|'double'|string
export const dataTypeExamineRule = (getType: GetType) => {
  console.log(getType)
  const regMap = {
    int32: isInt32,
    float: isFloat,
    double: isDouble,
  };
  return {
    validator: (rule, value: number, callback) => {
      const type = getType();
      if (!value) {
        return Promise.resolve()
      }
      const valueStr = String(value);
      if (regMap[type] && !regMap[type](value)) {
        return Promise.reject(utils.intl('不符合数据类型'))
      }
      return Promise.resolve()
    }
  }
}

function isInt32(value) {
  if(!/^\d+$/.test(value)) return false
  const number = Number(value);
  return number >= -2147483648 && number <= 2147483647;
}

function isFloat(value) {
  if(!/^\d+(\.\d+)?$/.test(value)) return false
  return true;
}

function isDouble(value) {
  if(!/^\d+(\.\d+)?$/.test(value)) return false
  return true;
}
