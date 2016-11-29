import five from 'johnny-five';
import EventEmitter from 'events';
import deviceTypes from './deviceTypes';

const AUTO_INIT_DEVICES = [
    'sensors',
    'relays'
];
export default class Robot extends EventEmitter {
    constructor(socket) {
        super();
        this.five = five;
        this.socket = socket;
        this.board = null;
        this.sensors = {};
        this.relays = {};
        if (process.env.REMOTE_CONFIG) {
            this.sockets.on('configSent', (config) => {
                this.init(config);
            });
        } else {
            this.init(require('./robotConf'));
        }
    }
    getBoard() {
        return new Promise((resolve, reject) => {
            this.on('BOARD_READY', () => {
                resolve(this.board);
            });
            const rejectTimeout = () => {
                if (!this.board) {
                    throw new Error('BOARD: The board took to much time to initialize.');
                    reject(null);
                }
            };

            //wait 30 secs before rejecting the promise
            setTimeOut(rejectTimeout, 30000);
        });
    }

    init(config) {
        if (!config) {
            throw new Error('INIT: Cannot create a board without config');
        }
        if (this.board === null) {
            this.board = new this.five.Board(config.boardConf || undefined);
        }
        this.config = config;

        this.board.on('ready', () => {
            AUTO_INIT_DEVICES.forEach(deviceType => {
                const devices = config[deviceType];
                if (devices && devices.length > 0) {
                    devices.forEach(device => {
                        this[deviceType][device.name] = this.addDevice(device);
                    });
                }
            });
            this.emit('BOARD_READY');
        });
    }

    addDevice(device) {
        let deviceObj;
        switch(device.type) {
            case deviceTypes.ANALOG:
                deviceObj = this.analog(device.config);
                break;
            case deviceTypes.DIGITAL:
                deviceObj = this.digital(device.config);
                break;
            case deviceTypes.I2C:
                deviceObj = this.i2c_sensor(device.config);
                break;
            case deviceTypes.RELAY:
                deviceObj = this.relay(device.config);
                break;
            default:
                throw new Error('ADD_SENSOR: cannot create a sensor without type');
        }
        return deviceObj;
    }

    digital(config) {
        if (!config.pin) {
            throw new Error('SENSOR_DIGITAL_CONFIG: Cannot create a sensor without a Pin');
        }
        return new this.five.Sensor.Digital(config);
    }
    analog(config) {
        if (!config.pin) {
            throw new Error('SENSOR_ANALOG_CONFIG: Cannot create a sensor without a Pin');
        }
        return new this.five.Sensor(config);
    }
    i2c_sensor(config) {
        if (!config.address) {
            throw new Error('SENSOR_I2C_CONFIG: Cannot create an i2c sensor without an address');
        }
        if (!config.bytes) {
            throw new Error('SENSOR_I2C_CONFIG: Cannot create an i2c sensor without the amount of bytes to read');
        }
        const ADDRESS = config.address,
            BYTES = config.bytes,
            FREQ = config.freq || 1000;

        let sensorObj = {
            on: (event, handler) => {
                //TODO: add some logic to handle difference between onData and onChange events.
                this.board.loop(FREQ, () => {
                    this.board.i2cReadOnce(ADDRESS, BYTES, (bytes) => {
                        let result = [];

                        for (let i = 0; i < bytes.length; i = i + 2) {
                            result.push(five.Fn.int16(bytes[i], bytes[i + 1])/100);
                        }
                        sensorObj.value = result;
                        handler();
                    });
                });
            },
            value: null
        };

        this.board.i2cConfig(ADDRESS);

        return sensorObj;
    }
    relay(config) {
        if (!config.pin) {
            throw new Error('RELAY_CONFIG: Cannot create a relay without a Pin');
        }
        return new this.five.Relay(config);
    }
}
