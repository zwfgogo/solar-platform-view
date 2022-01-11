import createServices from '../../../../util/createServices';

const services = {
    getSelect: function (params) {
        return createServices<{}>(
            "get",
            "/api/enums",
            params
        );
    },
    getHealth: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getHealth",
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
    getStationInfo: function (params) {
        return createServices<{}>(
            "get",
            "/api/basic-data-management/equipment-ledger/stations/:id/base",
            params
        );
    },
    getStations: function (params) {
        return createServices<{}>(
            "get",
            "/battery-cabin/station",
            params
        );
    },
    getInfoHealthScore: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getBatteryInfoHealthScore",
            params
        );
    },
    getParentOptions: function (params) {
        return createServices<{}>(
            "get",
            "/enums/devices/by-parent-type",
            params
        );
    },
};

export default services;
