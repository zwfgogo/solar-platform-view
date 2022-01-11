import createServices from "../../util/createServices";

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/alarm-service/alarm-config",
            params
        );
    },
    patchList: function (params) {
        return createServices<{ name: string; password: string }>(
            "patch",
            "/alarm-service/alarm-config/batch",
            params
        );
    },
    enumsAlarmLevel: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/enums",
            params
        );
    },
};

export default services;
