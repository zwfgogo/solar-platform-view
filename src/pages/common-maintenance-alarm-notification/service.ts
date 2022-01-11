import createServices from "../../util/createServices";

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/abnormalNotice/list",
            params
        );
    },
    addList: function (params) {
        return createServices<{ name: string; password: string }>(
            "post",
            "/abnormalNotice",
            params
        );
    },
    editList: function (params) {
        return createServices<{ name: string; password: string }>(
            "put",
            "/abnormalNotice",
            params
        );
    },
    deleteList: function (params) {
        return createServices<{ name: string; password: string }>(
            "delete",
            "/abnormalNotice",
            params
        );
    },
};

export default services;
