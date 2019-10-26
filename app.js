var express=require("express")
var app=express()
app.set('view engine','ejs')
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true});

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


var session = require('express-session')
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 1160000 } }))

const _ = require("lodash")

var bodyParser = require("body-parser")
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var h=new Schema({
    message:String,
    To:String,
    from:ObjectId,

})
const ok=mongoose.model('sim',h)

var j=new Schema({
    email:String,
    password:String,

})
const userModel=mongoose.model('him',j)

app.get('/',(req,res)=>{
    res.render('login');
})
app.post('/', urlencodedParser, (req, res) => {
    switch (req.body.action) {
        case 'signup':
            userModel.findOne({ email: req.body.email }, function (err, doc) {
                if (err) {
                    console.log(err, 'error')
                    res.redirect('/')
                    return
                }
                if (_.isEmpty(doc)) {
                    let newUser = new userModel();
                    newUser.email = req.body.email;
                    newUser.password = req.body.password;
                    newUser.save(function (err) {
                        if (err) {
                            console.log(err, 'error')
                            return
                        }
                        res.render('login', { message: "Sign Up Successful. Please log in." })
                    });

                } else {
                    res.render('login', { message: "User already exists" })
                }
            })
            break;
        case 'login':
            userModel.findOne({ email: req.body.email, password: req.body.password }, function (err, doc) {
                if (err) {
                    console.log(err, 'error')
                    res.redirect('/')
                    return
                }
                if (_.isEmpty(doc)) {
                    res.render('login', { message: "Please check email/password" })
                } else {
                    req.session.user = doc
                    res.redirect('/user/dashboard')
                }
            })
            break;
    }

})
app.get('/user/dashboard',(req,res)=>{
ok.find({To:req.session.user.email},(err,doc)=>{
    res.render("inbox",{mails:doc})

})
})
app.get('/user/dashboard/mail',(req,res)=>{
    res.render('mail')
})

app.post('/user/dashboard/mail',urlencodedParser,(req,res)=>{
    let op=new ok()
    op.message=req.query.ma
    op.To=req.query.To
    op.from=req.session.user._id
    op.save(function (err) {
        if (err) {
            console.log(err, 'error')
            return
        }
    })
        res.render('email')
    
})
app.listen(3000, () => {
    console.log("Server is running")
})