import createServices from '../../../../util/createServices';

const services = {
    getSelect: function (params) {
        return createServices<{}>(
            "get",
            "/api/enums",
            params
        );
    },
    getCapacity: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getCapacity",
            params
        );
    },
    getBatteryCapacity: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getBatteryCapacity",
            params
        );
    },
    getStationInfo: function (params) {
        return createServices<{}>(
            "get",
            "/api/basic-data-management/equipment-ledger/stations/:id/base",
            params
        );
    },
    getUniformityCurve: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getMaxCellTempRange",
            params
        );
    },
    getBatteryInfoHealthScoreEvaluate: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getBatteryInfoHealthScoreEvaluate",
            params
        );
    },
    getChargingEnd: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getChargingEnd",
            params
        );
    },
    getDischargeEnd: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getDischargeEnd",
            params
        );
    },
    getCellHistory: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getCellHistory",
            params
        );
    },
    getEnergyUnitsInfo: function (params) {
        return createServices<{}>(
            "get",
            "/information-room/energyUnitsInfo",
            params
        );
    },
};

export default services;
