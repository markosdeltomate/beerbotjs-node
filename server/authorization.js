import request from 'request';
import jwt from 'jsonwebtoken';

let postBody = {
        'appId': process.env.APP_ID,
        'code': jwt.sign({"_id": process.env.APP_ID, date: new Date().getDate()}, process.env.APP_SECRET)
    },
    Auth;

Auth = {
    login: (cb) => {
        request.post(
            `${process.env.SERVER_URI}/auth`,
            postBody,
            (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    let sessionToken = JSON.parse(body).token,
                        payload = Auth.validateToken(sessionToken);
                    if (payload) {
                        cb(sessionToken);
                    }
                } else {
                    Auth.fail();
                }
            }
        );
    },
    validateToken: (token) => {
        try {
            return jwt.verify(token, process.env.APP_SECRET);
        } catch (err) {
            console.log('JWT validation error:', err.message);
            return false;
        }
    },
    fail: () => {
        console.log('Couldn\'t log in with credentials for ' + process.env.APP_ID);
    }
};

export default Auth;
