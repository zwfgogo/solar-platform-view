import createServices from '../../../util/createServices';

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/overhaul-maintenance/abnormal-config/list",
            params
        );
    },
    patchList: function (params) {
        return createServices<{ name: string; password: string }>(
            "patch",
            "/api/overhaul-maintenance/abnormal-config/list",
            params
        );
    },
    enumsAlarmLevel: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/enums",
            params
        );
    },
};

export default services;
