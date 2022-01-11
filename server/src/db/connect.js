const mongoose = require('mongoose');

const connect = (url) => {
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log('Connect successfully!'))
        .catch(() => console.log('Connect failure!'))
};
module.exports = connect;