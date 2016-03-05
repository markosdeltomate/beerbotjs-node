import five from 'johnny-five';
import _ from 'lodash';
//let boardConfig = {};



export default class Robot {
    constructor(sockets) {
        this.sockets = sockets;
        this.board = new five.Board();
        this.sensors = {};
        this.relays = {};
        this.sockets.on('configSent', (config) => {
            this.init(config);
        });
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
                controller: sensor.controller,
                pin: sensor.pin,
                freq: sensor.freq
            };
            if (sensor.address) {
                config.address = sensor.address;
            }
            //console.log(config);
            this.sensors[sensor._id] = new five.Thermometer(config);
        });
    }

    addTask(tasks) {
        let enabledSensors = [];
        tasks.forEach((task) => {
            let parent = this,
                sensor = this.sensors[task.sensor._id],
                logOnly = !!task.logOnly,
                //frequency = task.frequency,
                type = task.type,
                relay;

            if (!logOnly && task.relay._id) {
                relay = this.relays[task.relay._id];
            }
            if (enabledSensors.includes(task.sensor._id)) {
                return;
            }
            enabledSensors.push(task.sensor._id);
            sensor.on('data', function readData() {
                let currentTemp = this.C,
                    response = {
                        stats: {
                            task: task.name,
                            temp: currentTemp
                        },
                        sensor: task.sensor
                    };

                if (!logOnly) {
                    let on = task.on,
                        off = task.off;

                    console.log(`${currentTemp} - ${on} - ${off}`);
                    parent[`check${type}`](currentTemp, on, off, relay);
                    response.relay = task.relay;
                    response.stats.isOn = relay.isOn;
                }

                parent.sockets.emit('data', response);
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
