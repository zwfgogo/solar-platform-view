import createServices from "../../util/createServices";

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/operation-on-duty/work-order",
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
    getDetail: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/operation-on-duty/work-order/:id",
            params
        );
    },
    getDeal: function (params) {
        return createServices<{ name: string; password: string }>(
            "patch",
            "/operation-on-duty/work-order",
            params
        );
    },
};

export default services;
