import createServices from '../../../util/createServices';

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/overhaul-maintenance/event-management",
            params
        );
    },
    getListDetail: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/overhaul-maintenance/event-management/detail",
            params
        );
    },
    addList: function (params) {
        return createServices<{ name: string; password: string }>(
            "post",
            "/api/overhaul-maintenance/event-management/workOrder",
            params
        );
    },
    ignoreList: function (params) {
        return createServices<{ name: string; password: string }>(
            "put",
            "/api/overhaul-maintenance/event-management/ignore",
            params
        );
    },
    getDetail: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/api/overhaul-maintenance/event-management/workOrder",
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
};

export default services;
