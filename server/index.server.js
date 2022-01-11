const express = require('express');
const morgan = require('morgan');
const app = express();
require('dotenv').config();
//connect database 
const connect = require('./src/db/connect');
// router 
const userRouter = require('./src/routes/auth');
const adminRouter = require('./src/routes/admin/auth');
// middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

app.use('/api/auth', adminRouter);
app.use('/api', userRouter);

app.use('/', (req, res) => {
    res.send('Hello world');
});

const PORT = process.env.PORT || 2000;

app.listen(PORT, () => {
    connect(process.env.MONGODB_URL);
    console.log(`App listen at http://localhost:${PORT}`);
})
