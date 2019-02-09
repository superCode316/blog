const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const Article = require('./models/article');
const database = require('./config/database');
mongoose.connect(database.database,{ useNewUrlParser: true });
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
    secret: database.secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next) {
    console.log(req.user);
    res.locals.user = req.user || null;
    next();
});

app.get('/',function(req,res){
    req.flash('message','Welcone');
    Article.find({},function(err,articles){
        res.render('articles/index',{
            articles:articles
        })
    });
});

app.use('/articles',require('./routes/articles'));
app.use('/users',require('./routes/users'));

app.listen(3000,function(){
    console.log("server start listening port 3000")
});