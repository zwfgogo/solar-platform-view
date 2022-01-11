import createServices from '../../../../util/createServices';

const services = {
    getCrews: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            '/api-terminal/enums/crews',
            params
        );
    },
    getEnergyUnits: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            '/enums',
            params
        );
    },
    getDetailTableSourse: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            '/api-terminal/analysis-query/storage/detail',
            params
        );
    },
};

export default services;
