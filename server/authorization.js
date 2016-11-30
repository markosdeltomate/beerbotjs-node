import request from 'request';
import jwt from 'jsonwebtoken';

let postBody = {
        'AppId': process.env.APP_ID,
        'AuthToken': process.env.AUTH_TOKEN
    },
    sessionToken,
    Auth;

Auth = {
    login: (cb) => {
        request.post(
            `http://${process.env.HOST}:${process.env.PORT}/login`,
            postBody,
            (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    body = JSON.parse(body);
                    sessionToken = body.token;
                    let payload = Auth.validateToken(sessionToken);
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
