import deviceTypes from './deviceTypes';

const robotConf = {
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
            pin: 7
        },
        {
            name: 'Heater',
            type: deviceTypes.RELAY,
            pin: 8
        }
    ]
};

export default robotConf;
