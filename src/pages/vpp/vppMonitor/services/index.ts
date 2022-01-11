import createServices from '../../../../util/createServices';

const services = {
    getDetail: function (params) {
        return createServices<{}>(
            "get",
            "/vpp/detail/summary",
            params
        );
    },
    getSite: function (params) {
        return createServices<{}>(
            "get",
            "/vpp/detail/site/running",
            params
        );
    },
    getCurve: function (params) {
        return createServices<{}>(
            "get",
            "/vpp/detail/power-curve",
            params
        );
    },
    dispatchVpp: function (params) {
        return createServices<{}>(
            "post",
            "/vpp/dispatch",
            params
        );
    },
    deleteVpp: function (params) {
        return createServices<{}>(
            "delete",
            "/vpp/dispatch",
            params
        );
    },
};

export default services;
