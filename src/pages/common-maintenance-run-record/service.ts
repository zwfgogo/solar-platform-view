import createServices from "../../util/createServices";

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/overhaul-maintenance/operation-analyze/list",
            params
        );
    },
    addList: function (params) {
        return createServices<{ name: string; password: string }>(
            "post",
            "/api/overhaul-maintenance/operation-analyze",
            params
        );
    },
    editList: function (params) {
        return createServices<{ name: string; password: string }>(
            "put",
            "/api/overhaul-maintenance/operation-analyze",
            params
        );
    },
    getDetail: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/overhaul-maintenance/operation-analyze",
            params
        );
    },
    deleteList: function (params) {
        return createServices<{ name: string; password: string }>(
            "delete",
            "/api/overhaul-maintenance/operation-analyze",
            params
        );
    },
};

export default services;
