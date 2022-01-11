import createServices from '../../../../util/createServices';

const services = {
    getSelect: function (params) {
        return createServices<{}>(
            "get",
            "/api/enums",
            params
        );
    },
    getPacks: function (params) {
        return createServices<{}>(
            "get",
            "/api/enums/packs",
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
    getUniformityCurve: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getConsistence",
            params
        );
    },
    getDistributionCurve: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getCellTempRange",
            params
        );
    },
    getScattarCurve: function (params) {
        return createServices<{}>(
            "get",
            "/api/information-room/getTempRise",
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
