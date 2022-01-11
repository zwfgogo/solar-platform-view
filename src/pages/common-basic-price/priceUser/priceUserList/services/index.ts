import createServices from '../../../../../util/createServices';

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/basic-data-management/prices/cost",
            params
        );
    },
    del: function (params) {
        return createServices<{ name: string; password: string }>(
            "delete",
            "/api/basic-data-management/prices/cost/:id",
            params
        );
    },
};

export default services;
