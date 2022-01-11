import createServices from "../../util/createServices";

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/monographic-analysis/battery-analysis",
            params
        );
    },
    getSelect: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/enums",
            params
        );
    },
    getBatteryList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/monographic-analysis/battery-analysis/:dataType",
            params
        );
    },
    getBatteryTree: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/monographic-analysis/battery-analysis/getBatteryTree",
            params
        );
    },
};

export default services;
