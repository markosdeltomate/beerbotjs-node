let clientConf = {
    relays: [
        {
            _id: '56d9001d0ad75ff2121810d5',
            name: 'Freezer',
            pin: '10',
            type: 'NO'
        },
        {
            _id: '56d900290ad75ff2121810d6',
            name: 'Calentador',
            pin: '11',
            type: 'NO'
        }
    ],
    sensors: [
        {
            _id: '56d8fff50ad75ff2121810d3',
            name: 'Freezer',
            pin: 3,
            controller: 'DS18B20',
            address: 0x415938551ff,
            freq: 1000*10
        },
        {
            _id: '56d900030ad75ff2121810d4',
            name: 'Fermentador',
            pin: 3,
            controller: 'DS18B20',
            address: 0x11590831fff,
            freq: 1000*10
        }
    ],
    tasks: [
        {
            name: 'Registro Freezer',
            type: 'log',
            sensor: {
                name: 'Freezer',
                _id: '56d8fff50ad75ff2121810d3'
            },
            logOnly: true,
            alerts: {
                im: 0,
                email: 1,
                visual: 0
            }
        },
        {
            name: 'Enfriar',
            type: 'Low',
            sensor: {
                name: 'Fermentador',
                _id: '56d900030ad75ff2121810d4'
            },
            relay: {
                name: 'Freezer',
                _id: '56d9001d0ad75ff2121810d5'
            },
            on: 20,
            off: 18,
            logOnly: false,
            alerts: {
                im: 0,
                email: 0,
                visual: 1
            }
        },
        {
            name: 'Calentar',
            type: 'High',
            sensor: {
                name: 'Fermentador',
                _id: '56d900030ad75ff2121810d4'
            },
            relay: {
                name: 'Calentador',
                _id: '56d900290ad75ff2121810d6'
            },
            on: 16,
            off: 18,
            logOnly: false,
            alerts: {
                im: 0,
                email: 0,
                visual: 1
            }
        }
    ]
};



export {clientConf as default};
