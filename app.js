const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const { check, oneOf, validationResult } = require('express-validator/check');
let Article = require('./models/article');
mongoose.connect("mongodb://localhost/blog",{ useNewUrlParser: true });
let db = mongoose.connection;
db.on('error',function(err){
    console.log(err);
});
db.once('open',function(){
    console.log('connect to Mongodb')
});


const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));
app.engine('pug', require('pug').__express);
app.set('views', path.join(__dirname,'views'));
app.set('view engine','pug');
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))


app.get('/',function(req,res){
    Article.find({},function(err,articles){
        res.render('articles/index',{
            articles:articles
        })
    })
});

let articles = require('./routes/articles');
app.use('/articles',articles);
let users = require('./routes/users');
app.use('/users',users);

app.listen(5001,function(){
    console.log("server start listening port 5001")
});