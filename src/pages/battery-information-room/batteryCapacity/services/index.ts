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

};

export default services;
