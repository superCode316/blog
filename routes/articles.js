let express = require('express');
const { check, validationResult } = require('express-validator/check');

let router = express.Router();

let Article = require('../models/article');
router.get('/new',function(req,res){
    res.render('/articles/new',{
        title:'add article'
    });
});

router.post('/create',[check('title').isLength({min:1}).withMessage("标题字数不得少于1")],
    [check('author').isLength({min:1}).withMessage("作者字数不得少于1")],
    [check('body').isLength({min:1}).withMessage("内容字数不得少于1")],
    function(req,res){
        let article = new Article(req.body);
        const errors = validationResult(req);
        // console.log(req.body);
        // console.log(errors.array());
        article.save(function(err){
            if(errors.isEmpty()){
                {
                    res.redirect('/');
                    req.flash('success','Article Added');
                }
            }else {
                res.render('articles/new',{
                    title:'Add Article',
                    errors:errors.array()
                });
            }
        })
    });

router.get('/:id/edit',function(req,res){
    Article.findById(req.params.id,function(err,article){
        if(err){
            return
        }
        res.render('articles/edit',{
            article:article
        })
    })
});

router.post('/update/:id',function(req,res){
    let query = {_id:req.params.id};
    Article.update(query,req.body,function(err){
        if(err){
            console.log(err);
        }else{
            res.render('articles/index',{message:req.flash('Article Added')})
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

    Article.remove(query,function(err){
        if (err){
            console.log(err);
        }
        res.send('Success')
    })
});

module.exports = router;