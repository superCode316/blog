const express = require('express');
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcrypt');
const passport = require('passport');

let User = require('../models/user');

let router = express.Router();

let svgCaptcha = require('svg-captcha');
let captcha = svgCaptcha.create();
let verify = function(){
    captcha = svgCaptcha.create();
};

router.get('/register', function(req, res) {
    verify();
    res.render('users/register',{
        svg_data:captcha.data
    });
});

router.post('/register', [
    check('username').isLength({ min: 1 }).withMessage('Username is required'),
    check('email').isLength({ min: 1 }).withMessage('Email is required'),
    check('email').isEmail().withMessage('invalid email'),
    check("password").isLength({ min: 1 })
], function(req, res) {
    const errors = validationResult(req);
    let array = errors.array();
    if(req.body.verify !== captcha.text){
        array.push({
            location:'body',
            param:'verify',
            value:req.body.verify,
            msg:'验证码输入错误'
        });
    }
    console.log(array);
    if (array.length !== 0) {
        res.render('users/register', {
            errors: array
        })
    } else {
        let user = new User(req.body);

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    console.log(err);
                    return;
                }

                user.password = hash;

                user.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        req.flash("success", "You are now registered and can log in");
                        res.redirect('/users/login');
                    }
                })

            });
        });
    }
});

router.get('/login', function(req, res) {
    res.render('users/login');
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true,
        successFlash: 'Welcome!'
    })(req,res,next);
});

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;
