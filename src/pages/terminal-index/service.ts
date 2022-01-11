import createServices from "../../util/createServices";

const services = {
    stationOverviewInfo: function (params) {
        return createServices<{ firmId: string }>(
            'get',
            '/api/overview/info',
            params
        );
    },
    getStoragesCodeAxios: function (params) {
        return createServices<{ firmId: string }>(
            'get',
            '/api/overview/selectStorage',
            params
        );
    },
    runStatusAxios: function (params) {
        return createServices<{}>(
            'get',
            '/api/overview/runStatus',
            params
        );
    },
    runEnvironmentAxios: function (params) {
        return createServices<{ firmId: string; mod: string }>(
            'get',
            '/api/overview/runEnvironment',
            params
        );
    },
    getEcharts: function (params) {
        return createServices<{ firmId: string; mod: string }>(
            'get',
            '/api/overview/temperature/byDevCodeAndPlace',
            params
        );
    },
};

export default services;
