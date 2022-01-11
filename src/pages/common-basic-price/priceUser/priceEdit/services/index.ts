import createServices from '../../../../../util/createServices';

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/basic-data-management/prices/cost",
            params
        );
    },
    add: function (params) {
        return createServices<{ name: string; password: string }>(
            "post",
            "/basic-data-management/prices/cost",
            params
        );
    },
    edit: function (params) {
        return createServices<{ name: string; password: string }>(
            "put",
            "/basic-data-management/prices/cost/:id",
            params
        );
    },
    getDetail: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/basic-data-management/prices/cost/:id",
            params
        );
    },
    del: function (params) {
        return createServices<{ name: string; password: string }>(
            "delete",
            "/basic-data-management/prices/cost/:id",
            params
        );
    },
    getIsbind: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/basic-data-management/prices/isBind/:id",
            params
        );
    },
};

export default services;
