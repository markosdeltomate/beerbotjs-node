import five from 'johnny-five';

five.Board({port: 'COM3'}).on('ready', () => {
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
        }),
        lcd = new five.LCD({
            pins: [7, 8, 9, 10, 11, 12]
        });

    temp1.on('data', function checkTemp1(data) {
        console.log('Temp: ' + this.celsius.toFixed(1) + '°C sensor 1');
        lcd.clear().print(this.celsius.toFixed(1) + 'C sensor 1');
    });
    temp2.on('data', function checkTemp2(data) {
        console.log('Temp: ' + this.celsius.toFixed(1) + '°C sensor 2');
        lcd.cursor(1, 0);
        lcd.print(this.celsius.toFixed(1) + 'C sensor 2');
    });
});
