import Robot from './robot';

import profileStatus from './constants/profileStatus';

export default class Fermenter extends Robot {
    constructor(socket) {
        super(socket);
        let deferredProfiles = (process.env.REMOTE_CONFIG) ?
            this.getProfilesAsync() :
            this.getProfilesSync();

        Promise
            .all([
                deferredProfiles,
                this.getBoard()
            ]).then(this.addProfiles.bind(this));

    }
    getProfilesSync() {
        return new Promise((resolve) => {
            resolve(require('./conf/robotProfiles'));
        });
    }
    getProfilesAsync() {
        return new Promise((resolve, reject) => {
            this.socket.on('profilesSent', (profiles) => {
                resolve(profiles);
            });

            const rejectTimeout = () => {
                if (!this.profiles) {
                    throw new Error('PROFILES: The profiles took to much time to load.');
                    reject(null);
                }
            };

            //wait 30 secs before rejecting the promise
            setTimeout(rejectTimeout, 30000);
        });
    }
    addProfiles([profiles, board]) {
        if (!profiles || profiles.length === 0) {
            throw new Error('ADD_PROFILES: There are no profiles to add.');
        }
        if (!board) {
            throw new Error('ADD_PROFILES: The board is not defined.');
        }
        profiles.forEach(profile => this.addProfile(profile));
    }
    addProfile({name: profileName, sensor: sensorName, relays: profileRelays = [], target = null, tolerance = null, wait = null, logOnly = true}) {
        if (!profileName) {
            throw new Error('ADD_PROFILE: A profile needs a name.');
        }
        if (!sensorName || !this.sensors[sensorName]) {
            throw new Error('ADD_PROFILE: A profile needs a valid sensor.');
        }
        let sensor = this.sensors[sensorName],
            relays = {},
            lastRun = null;


        if (!logOnly && profileRelays.length > 0) {
            profileRelays.forEach(relay => {
                relays[relay.type] = this.relays[relay.name]; //type: {cooler, heater, flow}
            });

        }

        sensor.on('data', () => {
            let reading = {
                time: new Date().getTime(),
                profile: profileName,
                value: sensor.value
            };
            if (!logOnly) {
                let statusChange = this.checkTemperature(reading.value, target, tolerance, relays, lastRun, wait);
                if (statusChange.status === profileStatus.COOLER_OFF) {
                    lastRun = new Date().getTime();
                }

                //flow is hardcoded to work only with cooling stage right now.
                if ( relays.flow) {
                    if (statusChange.status === profileStatus.HEATER_ON) {
                        relays.flow.on();
                    } else if (statusChange.status === profileStatus.HEATER_OFF){
                        relays.flow.off();
                    }
                }
                reading.status = statusChange.status;
            } else {
                //check for special devices to perform log only actions. IE: an hygrometer for environment temperature.
                if (sensor.humidity) {
                    reading.humidity = true;
                }
            }

            this.socket.emit('data', reading);
        });
    }

    checkTemperature(temperature, target, tolerance, relays, lastRun, wait) {
        let now = new Date().getTime(),
            tempIsLow,
            tempIsHigh,
            status;
        if (lastRun === null) { // startup, we need to wait in case the compressor just turn off
            return {status: profileStatus.COOLER_OFF};
        }
        if (relays && (!relays.heater.isOn && !relays.cooler.isOn) &&
            (((target - tolerance) < temperature) && (temperature < (target + tolerance)))) {
            return {status: profileStatus.IN_RANGE};
        }

        tempIsHigh = this.checkForCooler(temperature, target, tolerance, relays.cooler.isOn);
        tempIsLow = this.checkForHeater(temperature, target, tolerance, relays.heater.isOn);

        if (tempIsHigh.status != profileStatus.IN_RANGE) {
            status = tempIsHigh.status;
            if (tempIsHigh.status === profileStatus.COOLER_OFF) {
                relays.cooler.off();
            }
            if (tempIsHigh.status === profileStatus.COOLER_ON && (lastRun + wait) > now) {
                relays.cooler.on();
            } else {
                status = {status: profileStatus.WAITING_FOR_COMPRESSOR};
            }
        }

        if (tempIsLow.status != profileStatus.IN_RANGE) {
            status = tempIsLow.status;
            if (tempIsLow.status === profileStatus.HEATER_OFF) {
                relays.heater.off();
            }
            if (tempIsLow.status === profileStatus.HEATER_ON) {
                relays.heater.on();
            }
        }

        if (relays.heater.isOn && relays.cooler.isOn) {
            relays.cooler.off();
            relays.heater.off();
            // give some times to the relays to turn off
            setTimeout(() => {
                throw new Error("CHECK_TEMPERATURE: The cooler and heater were turned on simultaneously, check your temp ranges and your sensor readings.");
            }, 1500);
        }

        return status;
    }

    checkForCooler(temperature, target, tolerance, isOn) {
        let status = {status: profileStatus.IN_RANGE};
        // if the temperature is higher than my target plus offset and is not already cooling.
        if (temperature >= (target + tolerance) && !isOn) {
            // turn cooler on
            status = {status: profileStatus.COOLER_ON};
        }

        if (temperature >= (target + tolerance) && isOn) {
            // keep it cool
            status = {status: profileStatus.COOLING};
        }

        // if the temperature reaches our target and the cooler is on.
        if (temperature <= target && isOn) {
            // turn coler off
            status = {status: profileStatus.COOLER_OFF};
        }
        return status;
    }

    checkForHeater(temperature, target, tolerance, isOn) {
        let status = {status: profileStatus.IN_RANGE};
        // if the temperature is lower than my target minus offset and is not already heating.
        if (temperature <= (target - tolerance) && !isOn) {
            // turn heater on
            status = {status: profileStatus.HEATER_ON};
        }

        if (temperature <= (target - tolerance) && isOn) {
            // keep it worm
            status = {status: profileStatus.HEATING};
        }
        // if the temperature reaches our target and the heater is on.
        if (temperature >= target && isOn) {
            // turn heater off
            status = {status: profileStatus.HEATER_OFF};
        }
        return status;
    }
}
