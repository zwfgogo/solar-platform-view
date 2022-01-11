import { table, mockResponse } from '../../../../../public/js/mockdata';
export default {
  getList() {
    let list = [];
    for (let index = 0; index < 60; index++) {
      list.push({
        key: index,
        name: '胡彦斌',
        age: 32,
        count: index,
        address: '西湖区湖底公园1号',
      });
    }
    return {
      status: 200,
      data: list,
    };
  },
  getPriceCost() {
    return table(
      {
        id: 1,
        title: '电价名称',
        area: '适用地区',
        provinceId: 1,
        cityId: 1,
        countryId: 1,
        property: '用电性质',
        voltageLevelId: 1,
        voltageLevelTitle: '适用电压等级',
      },
      60,
      'id',
    );
  },
  getDetail() {
    return mockResponse({
      id: 629,
      title: '新测试',
      provinceId: 685,
      provinceTitle: '北京',
      cityId: 892,
      cityTitle: '北京市',
      districtId: 942,
      districtTitle: '朝阳',
      property: '测试',
      voltageLevels: [74, 1048],
      seasonPrices: [
        {
          id: 628,
          title: 'newTest',
          runMonth: '1,2,3,4,5,6,7,8,9,10,11,12',
          priceRates: [824, 937, 993],
          seasonPriceDetails: [
            {
              id: 626,
              priceRateId: 937,
              price: 1,
              startTime: '00:10:00',
              endTime: '00:14:00',
            },
            {
              id: 627,
              priceRateId: 993,
              price: 1,
              startTime: '00:00:00',
              endTime: '00:10:00',
            },
            {
              id: 625,
              priceRateId: 937,
              price: 1,
              startTime: '00:14:00',
              endTime: '00:16:00',
            },
            {
              id: 624,
              priceRateId: 937,
              price: 1,
              startTime: '00:16:00',
              endTime: '00:20:00',
            },
            {
              id: 623,
              priceRateId: 824,
              price: 1,
              startTime: '00:20:00',
              endTime: '00:00:00',
            },
          ],
        },
      ],
      season: [
        {
          id: 628,
          runMonth: '1,2,3,4,5,6,7,8,9,10,11,12',
          priceRates: [824, 937, 988],
          title: 'newTest',
          seasonPriceDetails: [
            {
              priceRateId: 824,
              price: 1,
              time: '00:20-00:00',
            },
            {
              priceRateId: 937,
              price: 1,
              time: '00:10-00:14,00:14-00:16,00:16-00:20',
            },
            {
              // 将 rate 改成priceRateId
              priceRateId: 988,
              price: 1,
              time: '00:20-24:00',
            },
          ],
        },
      ],
      area: '北京北京市朝阳',
      voltageLevelsTitle: '1~10Kv',
    });
  },
};
