import five from 'johnny-five';

five.Board().on('ready', () => {
    let temp1 = new five.Thermometer({
            pin: 3,
            controller: 'DS18B20',
            address: 0x11590831fff,
            freq: 3000
        }),
        temp2 = new five.Thermometer({
            pin: 3,
            controller: 'DS18B20',
            address: 0x415938551ff,
            freq: 3000
        });

    temp1.on('data', function checkTemp1(data) {
        console.log('Temp: ' + this.celsius + '°C sensor 1');
        console.log(data);
    });
    temp2.on('data', function checkTemp2(data) {
        console.log('Temp: ' + this.celsius + '°C sensor 2');
        console.log(data);
    });
});
