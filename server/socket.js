import io from 'socket.io-client';
import RobotFactory from './robotFactory';

export default class SocketIO {
    constructor(sessionToken, Robot) {
        this.socket = null;
        this.extraHeaders = {
            extraHeaders: {
                Authorization: `Bearer ${sessionToken}`
            }
        };
        this.robotFactory = new RobotFactory();

        this.robot = this.robotFactory.getInstance(Robot);
        this.connect();
    }
    bindEvents() {
        this.socket
            .on('connect', () => {
                this.socket.emit('authenticate');
            })
            .on('authenticated', () => {
                console.log('Authentication is valid.');
                this.robot.then(robot => {
                    robot.onData((data) => {
                        //todo: create a stack to handle data-sent data-received and keep a disconnected cache on !data-received
                        this.socket.emit('data-sent', data);
                    });
                }).catch(console.log.bind(console));
                if (process.env.REMOTE_CONFIG) {
                    this.socket.emit('config-request');
                } else {
                    this.robotFactory.setConfig(require('./conf/devicesConf'));
                    this.robotFactory.setProfiles(require('./conf/robotProfiles'));
                }
            })
            .on('config-response', (config) => {
                AsyncRobot.setConfig(config);
                this.socket.emit('profiles-request');
            })
            .on('profiles-response', (profiles) => {
                AsyncRobot.setProfiles(profiles);
            })
            .on('disconnect', this.disconnect.bind(this));
    }
    connect() {
        const uri = `${process.env.SERVER_URI}`;
        console.log(`CONNECT: attempting to connect to ${uri}`);
        this.socket = io.connect(uri, this.extraHeaders);
        this.bindEvents();
    }
    disconnect(reason) {
        console.log('Disconnect ', reason);
        this.socket.disconnect();
    }
}
