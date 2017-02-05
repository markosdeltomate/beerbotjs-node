import deviceTypes from '../constants/deviceTypes';

const robotConf = {
    /*boardConf: {
        port: 'COM4'
    },*/
    sensors: [
        {
            name: 'hygrometer+thermometer',
            type: deviceTypes.I2C,
            isMultiDevice: true,
            address: 0x0A,
            bytes: 6,
            devices: [
                {
                    name: 'Humidity',
                    bytes: 2,
                    params: {
                        humidity: true
                    }
                },
                {
                    name: 'Ambient',
                    alias: 'C',
                    bytes: 2
                },
                {
                    name: 'Fermenter 1',
                    alias: 'C',
                    bytes: 2
                }
            ]
        }

    ],
    relays: [
        {
            name: 'Cooler',
            type: deviceTypes.RELAY,
            pin: 4
        },
        {
            name: 'Heater',
            type: deviceTypes.RELAY,
            pin: 5
        }
    ]
};

export default robotConf;
