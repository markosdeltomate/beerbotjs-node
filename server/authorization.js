import request from 'request';
import jwt from 'jsonwebtoken';

const uri = `${process.env.SERVER_URI}/auth`,
    body = {
        'appId': process.env.APP_ID,
        'code': jwt.sign({"_id": process.env.APP_ID, date: new Date().getDate()}, process.env.APP_SECRET)
    };

export default class Auth {
    constructor() {
        //no op;
    }
    login(cb) {
        console.log(`AUTH: Logging in to ${uri}`);
        request.post({
                uri,
                body,
                json: true
            },
            (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    let sessionToken = body.token,
                        payload = this.validateToken.bind(this, sessionToken);
                    if (payload) {
                        cb(sessionToken);
                    }
                } else {
                    this.fail();
                }
            });
    }
    verify(token) {
        jwt.verify(token, process.env.APP_SECRET)
    }
    validateToken(token) {
        try {
            return this.verify(token);
        } catch (err) {
            console.log('JWT validation error:', err.message);
            return false;
        }
    }
    fail() {
        console.log('Couldn\'t log in with credentials for ' + process.env.APP_ID);
    }
}

export default Auth;
