require('dotenv').config();

const login = require('./api/login');
const prompt = require('prompt');

var credentials = new Promise((resolve, reject) => {
    if(process.env.LOGIN) {
        let splitted = process.env.LOGIN.split(':');
        let [email, ...password] = splitted;
        password = password.join('');
        resolve({ email, password });
    } else {
        prompt.get({
            properties: {
                email:  {
                    type: 'string',
                },
                password: {
                    hidden: true
                }
            }
        }, function (err, result) {
            if(err)
                reject(err);
            else
                resolve(result);
        });
    }
});

credentials.then((credentials) => {
    return login(credentials.email, credentials.password)
})
.then((events) => {
    events
        .subscribe(m => {
            console.log(m);
        })
})
.catch((err) => {
    console.log(err);
});