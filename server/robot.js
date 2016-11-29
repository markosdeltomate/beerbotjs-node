import five from 'johnny-five';
import _ from 'lodash';
//let boardConfig = {};

export default class Robot {
    constructor(sockets) {
        this.sockets = sockets;
        this.board = new five.Board();
        this.sensors = {};
        this.screen = {};
        this.relays = {};
        this.displayQueue = [];
        this.sockets.on('configSent', (config) => {
            this.init(config);
        });
        // more Socket triggered actions here
    }

    init(boardConfig) {
        this.board.on('ready', () => {
            this.addSensors(boardConfig.sensors);

            if (boardConfig.relays) {
                this.addRelays(boardConfig.relays);
            }

            if (boardConfig.screen && boardConfig.screen.pins) {
                console.log('setting up screen');
                this.addScreen(boardConfig.screen);
            }

            this.addProfile(boardConfig.profiles);
        });
    }

    addScreen(screen) {
        let config = {
            pins: screen.pins
        };

        if (screen.backlight) {
            config.backlight = screen.backlight;
        }
        if (screen.rows) {
            config.rows = screen.rows;
        }
        if (screen.cols) {
            config.cols = screen.cols;
        }

        this.screen = new five.LCD(config);
        this.screen.on();
        this.screen.clear().print("BeerBot v0.1");
        this.screen.cursor(1,0).print("Hello hooman...");
    }

    displayTemp(current = 0) {
        let last = this.displayQueue.length,
            next = current + 1,
            currentItem = this.displayQueue[current],
            name = currentItem.name,
            relayState = '',
            temp;
        next = (next === last) ? 0 : next;
        this.screen.useChar("check");
        this.screen.clear().print(name);
        this.screen.cursor(1, 0);
        temp = currentItem.sensor.C.toFixed(1);
        if (currentItem.relays && currentItem.relays.cool.isOn) {
            relayState = "- cooling";
        } else if (currentItem.relays && currentItem.relays.heat.isOn) {
            relayState = "- heating";
        }
        this.screen.print(`${temp} ${relayState}`);

        setTimeout(() => {
            this.displayTemp(next);
        }, 3000);
    }

    addRelays(relays) {
        relays.forEach((relay) => {
            let config = {
                cool: {
                    pin: relay.cool.pin,
                        type: relay.cool.type
                },
                heat: {
                    pin: relay.heat.pin,
                    type: relay.heat.type
                }
            };

            this.relays[relay._id] = {
                cool: new five.Relay(config.cool),
                heat: new five.Relay(config.heat)
            };
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
            this.sensors[sensor._id] = new five.Thermometer(config);
        });
    }

    addProfile(profiles) {
        profiles.forEach((profile) => {
            let parent = this,
                sensor = this.sensors[profile.sensor._id],
                logOnly = !!profile.logOnly,
                relays;

            if (!logOnly && profile.relays) {
                relays = this.relays[profile.relays._id];
            }

            this.displayQueue.push({
                name: profile.sensor.name,
                sensor: sensor,
                relays: relays
            });
            // no arrow function  or method from Robot class
            // to avoid messing with 'this' binding by Johnny-five
            sensor.on('data', function readData() {
                let currentTemp = this.C,
                    response = {
                        stats: {
                            profile: profile,
                            temp: +currentTemp.toFixed(1)
                        }
                    };

                if (!logOnly) {
                    console.log(`${currentTemp.toFixed(2)}`);
                    let statusChange = parent.checkTemp(currentTemp, profile.target, profile.diff, relays);
                    if (statusChange) {
                        response.stats = statusChange;
                    }
                }
                parent.sockets.emit('data', response);
            });
        });
        this.displayTemp();
    }

    checkTemp(temperature, target, diff, relays) {
        let alert;
        if (relays && (!relays.heat.isOn && !relays.cool.isOn) &&
            (((target - diff) < temperature) && (temperature < (target + diff)))) {
            return false;
        }
        //TODO: Add support for compressor waiting time.
        alert = this.checksForCooler(temperature, target, diff, relays) || this.checksForHeater(temperature, target, diff, relays);

        // we shouldn't be falling in this scenario, so we notify the server and exit with an alert
        if (relays.heat.isOn && relays.cool.isOn) {
            relays.cool.off();
            relays.heat.off();
            setTimeout(() => {
                throw "The cooler and heater were turned on simultaneously, check your temp ranges and your sensor readings.";
            }, 1500);
            return {error: 1};
        }
        return alert;
    }

    checksForCooler(temperature, target, diff, relays){
        let alert = false;
        // if the temperature is higher than my target plus offset and is not already cooling.
        if (temperature >= (target + diff) && !relays.cool.isOn) {
            // turn cooller on
            alert = {cool: 1};
            relays.cool.on();
        }
        // if the temperature reaches our target and the cooler is on.
        if (temperature <= target && relays.cool.isOn) {
            // turn cooller off
            alert = {cool: 0};
            relays.cool.off();
        }

        return alert;
    }

    checksForHeater(temperature, target, diff, relays) {
        let alert = false;
        // if the temperature is lower than my target minus offset and is not already heating.
        if (temperature <= (target - diff) && !relays.heat.isOn) {
            // turn heater on
            alert = {heat: 1};
            relays.heat.on();
        }

        // if the temperature reaches our target and the heater is on.
        if (temperature >= target && relays.heat.isOn) {
            // turn heater off
            alert = {heat: 0};
            relays.heat.off();
        }

        return alert;
    }
}
