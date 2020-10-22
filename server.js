const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

const app = express();

//Connecting to mongoDB
mongoose.connect(config.get('mongoURI'),{
    useNewUrlParser:true,
    useUnifiedTopology: true,
    useCreateIndex:true
})
.then(res => console.log('MongoDb Connected...'))
.catch(err => console.log(err));

app.get('/',(req,res)=> {
    res.send("Working!");
});
const PORT = process.env.PORT || 5000;

app.listen(PORT,(req,res)=>{
    console.log(`Server started at port ${PORT}`)
});

//Load Routes
const users = require('./routes/api/users');
const auth = require('./routes/api/auth');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');


//Middlewares

app.use(express.json());

//Using Routes
app.use('/api/users',users);
app.use('/api/auth',auth);
app.use('/api/profile',profile);
app.use('/api/posts',posts);