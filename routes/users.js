const express = require('express');
const { check, validationResult } = require('express-validator/check');
let svgCaptcha = require('svg-captcha');
let router = express.Router();
let captcha = svgCaptcha.create();
let verify = function(){
    captcha = svgCaptcha.create();
};
const User = require('../models/user');
const bcrypt = require('bcrypt');

router.get('/register',function(req,res){
    res.render('users/register',{
        svg_data:captcha.data
    })
});

router.post('/register',[check('username').isLength({min:1}).withMessage("用户名字数不得少于1")],
    [check('email').isEmail().withMessage("email格式错误")],
    [check('password').isLength({min:1}).withMessage("密钥不得少于1")],
    function(req,res){
        let article = new User(req.body);
        const errors = validationResult(req);
        let error = errors.array();
        if(req.body.verify !== captcha.text){
            error.push({
                location:'body',
                param:'verify',
                value:req.body.verify,
                msg:'验证码输入错误'
            });
        }
        if(error.length === 0){
            let user = new User(req.body);
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(req.body.password, salt, function(err, hash) {
                    user.password = hash;
                    user.save(function(err){
                        if (err) {
                            console.log(err);
                            return;
                        }
                        res.redirect('/');
                        req.flash('success','注册成功');

                    })
                });
            });

        }else {
            verify();
            res.render('users/register',{
                errors:error,
                svg_data:captcha.data
            })
        }
    });

router.get('/login',function(req,res){
    res.render('users/login',{
        svg_data:captcha.data
    })
})
module.exports = router;