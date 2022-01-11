import createServices from '../../../../util/createServices';

const services = {
    getEnergyUnits: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            '/enums',
            params
        );
    },
    getTableSourse: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            '/api-terminal/analysis-query/storage',
            params
        );
    },
};

export default services;
