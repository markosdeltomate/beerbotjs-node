import deviceTypes from './deviceTypes';

const robotConf = {
    sensors: [
        {
            name: 'Luz 1',
            type: deviceTypes.ANALOG,
            config: {
                pin: 'A0',
                freq: 250
            }
        }
    ]
};

export default robotConf;
