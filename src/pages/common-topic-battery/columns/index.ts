import temperatureColumns from './temperatureColumns';
import voltageColumns from './voltageColumns';
import socColumns from './socColumns';
import columns from './columns';
/**
 * 键值是子页面的名字
 */
export default {
  columns: {
    'temperature': temperatureColumns,//温度页面
    'voltage': voltageColumns,//电压页面
    'SOC': socColumns,//soc页面
    'index': columns//首页
  },
};
