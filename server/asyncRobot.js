export default class AsyncRobot{
    constructor() {
        this._instance = null;
        this._config = null;
        this._profiles = null;
        this._resolved = {
            all: false,
            config: false,
            profiles: false
        };
        this.defferConfig();
        this.defferProfiles();

    }
    defferConfig() {
        let deferredConfig = new Promise((resolve, reject) => {
            this._config = {
                resolve,
                reject
            };
            const rejectTimeout = () => {
                if (!this._resolved.config) {
                    reject(null);
                    throw new Error('ASYNC CONFIG: The config is taking to much to load.');
                }
            };

            //wait 60 secs before rejecting the promise
            setTimeout(rejectTimeout, 60000);
        });
    }

    defferProfiles() {
        let deferredProfiles = new Promise((resolve, reject) => {
            this._profiles = {
                resolve,
                reject
            };
            const rejectTimeout = () => {
                if (!this._resolved.profiles) {
                    reject(null);
                    throw new Error('ASYNC PROFILES: The profiles are taking to much to load.');
                }
            };

            //wait 60 secs before rejecting the promise
            setTimeout(rejectTimeout, 60000);
        });
    }
    static setConfig(config) {
        this._resolved.config = true;
        this._config.resolve(config);
    }
    static setProfiles(profiles) {
        this._resolved.profiles = true;
        this._profiles.resolve(profiles);
    }
    static getInstance(Robot) {
        if (!this._instance instanceof Promise) {
            this._instance = new Promise((resolve, reject) => {
                Promise
                    .all([this._config, this._profiles])
                    .then((config, profiles) => {
                        this._resolved.all = true;
                        resolve(new Robot(config, profiles))
                    });

                const rejectTimeout = () => {
                    if (!this._resolved.all) {
                        reject(null);
                        throw new Error('ASYNC ROBOT: The robot is taking to much time to initialize.');
                    }
                };

                //wait 60 secs before rejecting the promise
                setTimeout(rejectTimeout, 60000);
            });
        }
        return this._instance;
    }
}
