import five from 'johnny-five';
import _ from 'lodash';
//let boardConfig = {};



export default class Robot {
    constructor(sockets) {
        this.sockets = sockets;
        this.board = new five.Board();
        this.sensors = {};
        this.relays = {};
    }

    init(boardConfig) {
        this.board.on('ready', () => {
            this.addRelays(boardConfig.relays);
            this.addSensors(boardConfig.sensors);

            this.addTask(boardConfig.tasks);

        });
    }

    addRelays(relays) {
        relays.forEach((relay) => {
            let config = {
                pin: relay.pin,
                type: relay.type
            };

            this.relays[relay._id] = new five.Relay(config);
        });
    }

    addSensors(sensors) {
        sensors.forEach((sensor) => {
            let config = {
                controller: sensor.type,
                pin: sensor.pin,
                freq: sensor.frequency
            };
            if (sensor.address) {
                config.address = sensor.address;
            }

            this.sensors[sensor._id] = new five.Thermometer(config);
        });
    }

    addTask(tasks) {
        tasks.forEach((task) => {
            let parent = this,
                sensor = this.sensors[task.sensor._id],
                logOnly = !!task.logOnly,
                //frequency = task.frequency,
                type = task.type,
                relay,
                on,
                off;

            if (!logOnly && task.relay._id) {
                relay = this.relays[task.relay._id];
            }
            sensor.on('data', function readData() {
                let currentTemp = this.celcius,
                    data = {
                        sensor: _.assign({celcius: currentTemp}, task.sensor)
                    };

                if (!logOnly) {
                    parent[`check${type}`](currentTemp, on, off, relay);
                    data.relay = _.assign({isOn: relay.isOn}, task.relay);
                }

                this.sockets.emit('data', data);
            });
        });
    }

    checkLow(temperature, on, off, relay) {
        let alert = false;
        if (temperature >= on && !relay.isOn) {
            alert = true;
            relay.on();
        }

        if (temperature <= off && relay.isOn) {
            alert = true;
            relay.off();
        }

        return alert;
    }

    checkHigh(temperature, on, off, relay) {
        let alert = false;
        if (temperature <= on && !relay.isOn) {
            alert = true;
            relay.on();
        }

        if (temperature >= off && relay.isOn) {
            alert = true;
            relay.off();
        }

        return alert;
    }
}
