let clientConf = {
    relays: [
        {
            _id: '56d9001d0ad75ff2121810d5',
            name: 'Freezer Relay #1',
            cool: {
                pin: '5',
                type: 'NO'
            },
            heat:{
                pin: '6',
                type: 'NO'
            }
        }
    ],
    screen: {
        pins: [7, 8, 9, 10, 11, 12]
    },
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
    profiles: [

        {
            '_id': '8769870twerer780370',
            name: 'Registro Freezer',
            sensor: {
                name: 'Freezer',
                _id: '56d8fff50ad75ff2121810d3'
            },
            logOnly: true
        },
        {
            '_id': '5363456345635635645',
            name: 'Freezer 1',
            sensor: {
                name: 'Fermentador',
                _id: '56d900030ad75ff2121810d4'
            },
            relays: {
                name: 'Freezer Relay #1',
                _id: '56d9001d0ad75ff2121810d5'
            },
            target: 18.0,
            diff: 1.5,
            compressorWait: 10 * 60 * 1000,
            //tempOffset: 0,
            logOnly: false
        }
    ]
};



export {clientConf as default};
