import createServices from '../../util/createServices';

const services = {
    chartAxios: function (params) {
        return createServices<{ name: string; password: string }>(
            "post",
            params,
        );
    },
    getChartAxios: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            params.url,
            params.postData
        );
    },
    postChartAxios: function (params) {
        return createServices<{ name: string; password: string }>(
            "post",
            params.url,
            params.postData
        );
    },

};

export default services;
