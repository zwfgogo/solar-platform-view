import createServices from "../../../util/createServices";

const services = {
    analogMap: function (params) {
        return createServices<{ firmId: string }>(
            'post',
            '/on-line-monitoring/system-wiring/alarm/byAnalog',
            params
        );
    },
    topologicalRealData: function (params) {
        return createServices<{ firmId: string }>(
            'post',
            'api/on-line-monitoring/system-wiring/realtime',
            params
        );
    },
    getTheDotName: function (params) {
        return createServices<{ firmId: string }>(
            'get',
            'api/on-line-monitoring/system-wiring/title/byAnalog',
            params
        );
    },
    getEchart: function (params) {
        return createServices<{ firmId: string }>(
            'post',
            'api/on-line-monitoring/system-wiring/history',
            params
        );
    },
    getDevInfo: function (params) {
        return createServices<{ firmId: string }>(
            'get',
            'api/basic-data-management/equipment-ledger/devices/:id',
            params
        );
    },
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "api-terminal/alarm-service/alarm-monitor",
            params
        );
    },
    getRealData: function (params) {
        return createServices<{ firmId: string }>(
            'get',
            '/system-connect-line/real-data',
            params
        );
    },
};

export default services;
