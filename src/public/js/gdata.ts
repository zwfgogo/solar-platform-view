import moment from 'moment';

const data = {
    languageMessages: {},
    userType: {
        "Operator": "运营商",
        "Maintenance": "运维商",
        "FinalUser": "终端用户",
        "Platform": "平台用户"
    },
    date: {
        'today': moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD')
    },
    months: [
        {
            name: '一月',
            value: '1',
        },
        {
            name: '二月',
            value: '2',
        },
        {
            name: '三月',
            value: '3',
        },
        {
            name: '四月',
            value: '4',
        },
        {
            name: '五月',
            value: '5',
        },
        {
            name: '六月',
            value: '6',
        },
        {
            name: '七月',
            value: '7',
        },
        {
            name: '八月',
            value: '8',
        },
        {
            name: '九月',
            value: '9',
        },
        {
            name: '十月',
            value: '10',
        },
        {
            name: '十一月',
            value: '11',
        },
        {
            name: '十二月',
            value: '12',
        },
    ],
    colors: [
        '#c700df',
        '#3148f5',
        '#08ba9e',
        '#2dff3c',
        '#ff6622',
        '#ff0700',
        '#003457',
        '#00b9d1',
        '#00ff89',
        '#00581f',
        '#523100',
        '#ff6436',
        '#8400ff',
        '#008a6e',
        '#003b6e',
        '#fdff2f'
    ],
    echartThemes: {
        "space-gray": {
            axisLineColor: '#2e323d',//y轴分割线颜色
            axisTextColor: '#fff',//x、y轴字体颜色
            yUnitColor: '#fff' //y轴单位颜色
        },
        "mint-green": {
            axisLineColor: '#efefef',//y轴分割线颜色
            axisTextColor: '#000',//x、y轴字体颜色
            yUnitColor: '#000', //y轴单位颜色
        },
        "slate-blue": {
            axisLineColor: '#efefef',//y轴分割线颜色
            axisTextColor: '#000',//x、y轴字体颜色
            yUnitColor: '#000' //y轴单位颜色
        }
    }
};
export default function (name?: string, value?: any) {
    if (arguments.length === 1) {
        return data[arguments[0]];
    } else {
        data[arguments[0]] = arguments[1];
        return data;
    }
}
