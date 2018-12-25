let express = require('express');
const { check, validationResult } = require('express-validator/check');
let svgCaptcha = require('svg-captcha');
let router = express.Router();
let captcha = svgCaptcha.create();
let verify = function(){
    captcha = svgCaptcha.create();
};
let Article = require('../models/article');
router.get('/new',function(req,res){
    verify();
    res.render('articles/new',{
        data:{
            title:'',
            author:'',
            body:''
        },
        title:'add article',
        svg_data:captcha.data
    });
});

router.post('/create',[check('title').isLength({min:1}).withMessage("标题字数不得少于1")],
    [check('author').isLength({min:1}).withMessage("作者字数不得少于1")],
    [check('body').isLength({min:1}).withMessage("内容字数不得少于1")],
    function(req,res){
        let article = new Article(req.body);
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
            article.save(function(err){
                if (err) {
                    console.log(err);
                }
                res.redirect('/');
                req.flash('success','Article Added');

            })
        }else {
            verify();
            res.render('articles/new',{
                data:req.body,
                title:'Add Article',
                errors:error,
                svg_data:captcha.data
            });
        }
    });

router.get('/:id/edit',function(req,res){
    Article.findById(req.params.id,function(err,article){
        if(err){
            return
        }
        res.render('articles/edit',{
            article:article,
        })
    })
});

router.post('/update/:id',function(req,res){
    let query = {_id:req.params.id};
    Article.updateMany(query,req.body,function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect('/')
            req.flash('success','Article Updated');
        }
    })
});

router.get('/:id',function(req,res){
    Article.findById(req.params.id,function(err,article){
        if(err){
            return
        }
        res.render('articles/show',{
            article:article
        })
    })
});

router.delete('/:id',function(req,res){
    let query = { _id:req.params.id}

    Article.deleteMany(query,function(err){
        if (err){
            console.log(err);
        }
        res.send('Success')
    })
});

module.exports = router;
