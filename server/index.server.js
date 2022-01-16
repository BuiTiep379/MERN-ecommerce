const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
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
app.use("/public", express.static(path.join(__dirname, "./src/uploads")));
app.use(morgan('tiny'));
app.use(cookieParser(process.env.JWT_SECRET));

app.use('/api/auth', adminRouter);
app.use('/api', userRouter);


const PORT = process.env.PORT || 2000;

app.listen(PORT, () => {
    connect(process.env.MONGODB_URL);
    console.log(`App listen at http://localhost:${PORT}`);
})
