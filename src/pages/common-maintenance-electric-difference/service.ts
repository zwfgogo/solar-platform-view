import createServices from "../../util/createServices";

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/overhaul-maintenance/electric-variance-analysis/list",
            params
        );
    },
    // getSelect: function (params) {
    //     return createServices<{ name: string; password: string }>(
    //         "get",
    //         "/api/select",
    //         params
    //     );
    // },
    getElectricCompare: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/overhaul-maintenance/electric-variance-analysis/electricCompare",
            params
        );
    },
    addList: function (params) {
        return createServices<{ name: string; password: string }>(
            "post",
            "/api/overhaul-maintenance/electric-variance-analysis",
            params
        );
    },
    editList: function (params) {
        return createServices<{ name: string; password: string }>(
            "put",
            "/api/overhaul-maintenance/electric-variance-analysis/:id",
            params
        );
    },
    deleteList: function (params) {
        return createServices<{ name: string; password: string }>(
            "delete",
            "/api/overhaul-maintenance/electric-variance-analysis/:id",
            params
        );
    },
    getResList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/overhaul-maintenance/electric-variance-analysis/reason/list",
            params
        );
    },
    editResList: function (params) {
        return createServices<{ name: string; password: string }>(
            "patch",
            "/api/overhaul-maintenance/electric-variance-analysis/reason/:id",
            params
        );
    },
    addResList: function (params) {
        return createServices<{ name: string; password: string }>(
            "post",
            "/api/overhaul-maintenance/electric-variance-analysis/reason",
            params
        );
    },
    deleteResList: function (params) {
        return createServices<{ name: string; password: string }>(
            "delete",
            "/api/overhaul-maintenance/electric-variance-analysis/reason/:id",
            params
        );
    },
    getChartAxios: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/operation-mangement/operation-report/electricity",
            params
        );
    },
};

export default services;
