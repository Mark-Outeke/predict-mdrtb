const config = {
    type: 'app',
    name: 'predict MDRTB',
    coreApp: false,
    id: 'predict-MDRTB',
    minDHI2Version: '2.37',
    maxDHI2Version: '2.41',

    entryPoints: {
        app: './src/App.js',
    },
}

module.exports = config
