import io from 'socket.io-client';
import AsyncRobot from './asyncRobot';

export default class SocketIO {
    constructor(sessionToken, Robot) {
        super();
        this.socket = null;
        this.extraHeaders = {
            extraHeaders: {
                Authorization: `Bearer ${sessionToken}`
            }
        };
        AsyncRobot
            .getInstance(Robot)
            .then(instance => {
                this.robot = instance;
            });
        this.connect();
    }
    bindEvents() {
        this.socket
            .on('connect', () => {
                //console.log(socket);
                //console.log(io);
            })
            .on('authenticated', () => {
                if (process.env.REMOTE_CONFIG) {
                    this.socket.emit('config-request');
                } else {
                    AsyncRobot.setConfig(require('./conf/devicesConf'));
                    AsyncRobot.setProfiles(require('./conf/robotProfiles'));
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
        const uri = `http://${process.env.HOST}${process.env.PORT?':':''}${process.env.PORT}`;
        this.socket = io.connect(uri, this.extraHeaders);
        this.bindEvents();
    }
    disconnect(reason) {
        console.log('Disconnect ', reason);
        this.socket.disconnect();
    }
}
