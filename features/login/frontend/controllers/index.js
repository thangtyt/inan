'use strict';
const nodeMailer = require('nodemailer');
let jwt = require('jsonwebtoken');

module.exports = function (controller, component, app) {
    let jwt_conf = app.getConfig('jwt');
    //jwt
    let jwtSign = function (conf,user) {
        return jwt.sign({
            ignoreExpiration: true,
            data: user
        }, conf.jwtSecretKey);
    }
    let jwtVerify = function (token,conf) {
        return jwt.verify(token,conf.jwtSecretKey);
    }


    let mailConfig = app.getConfig('mailer_config');
    controller.view = function (req, res) {
        res.frontend.render('login');
    };

    controller.logout = function (req, res) {
        if (req.user && req.user.id) {
            // Remove cache
            let redis = app.redisClient;
            redis.del(app.getConfig('redis_prefix') + 'current-user-' + req.user.id);
        }

        req.logout();

        if (req.session.prelink) {
            return res.redirect(req.session.prelink);
        }
        res.redirect('/');
    };

    controller.forgotview = function (req,res) {
        res.frontend.render('forgot');
    }
    controller.cPassView = function (req,res) {
        let token = req.params.token;
        app.feature.users.actions.find({
            where : {
                reset_password_expires : {
                    $gt: Date.now()
                },
                reset_password_token : token
            }
        }).then(function (user) {
            if(!user){
                res.frontend.render('changePass',{
                    error : {
                        message : 'This function is expires or not avaiable !'
                    }
                });
            }else{
                res.frontend.render('changePass');
            }
        }).catch(function (err) {
            res.frontend.render('changePass',{
                error : {
                    message : 'This function is expires or not avaiable !'
                }
            });
        })

    }
    controller.cPassSave = function (req,res) {
        let token = req.params.token;
        let data = req.body;
        app.feature.users.actions.find({
            where : {
                reset_password_expires : {
                    $gt: Date.now()
                },
                reset_password_token : token
            }
        }).then(function (user) {
            if (data.password == null || data.password.length < 6){
                req.flash.error('Password is null or too short !');
                res.frontend.render('changePass');
            }else{
                if(!user){
                    res.frontend.render('changePass',{
                        error : {
                            message : 'This function is expires or not avaiable !'
                        }
                    });
                }else{
                    user.updateAttributes({
                        reset_password_expires : 0,
                        reset_password_token : '',
                        user_pass : user.hashPassword(data.password)
                    }).then(function (user) {
                        if(user){
                            req.flash.success('Change password successfully !');
                            req.flash.success('Please re-login with a new password !');
                            res.redirect('/admin/login');
                        }else{
                            req.flash.error('Change password un-successfully ! \n Please re-enter new password !');
                            res.frontend.render('changePass');
                        }

                    })

                }
            }

        }).catch(function (err) {
            res.frontend.render('changePass',{
                error : {
                    message : 'This function is expires or not avaiable !'
                }
            });
        })
    }
    controller.forgot = function (req,res) {
        app.feature.users.actions.findByEmail( req.body.email)
            .then(function (user) {
                if(!user){
                    res.frontend.render('forgot',{
                        messages : {
                            error : ['E-mail is not registered !','Please enter another e-mail']
                        }
                    });
                }else{
                    let href = req.protocol + '://'+req.get('host')+req.originalUrl;
                    user.updateAttributes({
                        reset_password_expires : Date.now() + Number(app.getConfig('timeExpires')),
                        reset_password_token : tokenGenerate(50)
                    })
                    .then(function (userUpdated) {
                            if(userUpdated){
                                href += '/'+userUpdated.reset_password_token;
                                let transporter = nodeMailer.createTransport(mailConfig);
                                let message = {
                                    to : 'thangtyt@gmail.com',//userUpdated.user_email,
                                    subject : 'Confirm email to reset password',
                                    html : `<p>You have just process reset your password</p>
                                <p>Please click link below to continue reset your password</>
                                <p><a href='`+href+`'>`+href+`</a></p>`
                                };
                                transporter.sendMail(message, function (err,info) {
                                    if(err){
                                        req.flash.error(err.message);
                                        res.frontend.render('forgot');
                                    }else{
                                        res.frontend.render('forgot',{
                                            sendEmail : user.user_email
                                        });
                                    }
                                })
                            }else{
                                return new Error('Error when send mail please try again');
                            }
                    })
                    .catch(function (err) {
                        return err;
                    })

                }
        })
        .catch(function (err) {
            res.frontend.render('forgot',{
                messages : {
                    error : [err.message]
                }
            });
        })

    }
    controller.notHavePermission = function (req, res) {
        res.status(403);
        res.jsonp({
            message: 'The request was a valid request'
        })
    }
    controller.timeOut = function (req, res) {
        res.status(440);
        res.jsonp({
            message: 'The client\'s session has expired and must log in again.'
        })
    }
    controller.requireToken = function (req,res) {
        res.status(499);
        res.jsonp({
            message: 'Token is required'
        })
    }
    controller.test = function (req,res) {
        res.frontend.render('/');
    }
    controller.jwtSuccess = function (req,res) {
        //console.log(jwtVerify(jwtSign(jwt_conf, req.user), jwt_conf));
        //console.log(JSON.stringify(req.user,2,2));
        let user = req.user;
        user.role = [];
        user.role_id = [];
        user.role_ids = [];
        res.status(200);
        res.jsonp({
            message: 'login successful !',
            token: jwtSign(jwt_conf,user)
        })
    }
    controller.jwtFailure = function (req,res) {
        res.status(400);
        res.jsonp({
            message: 'Login failure'
        })
    }
    controller.getUserInfo = function (req,res) {
        let user = req.user;
        delete user.role;
        delete user.role_id;
        delete user.role_ids;
        delete user.user_pass;
        delete user.salt;
        delete user.reset_password_expires;
        delete user.reset_password_token;
        res.status(200);
        res.jsonp({
            message: 'login successful !',
            user: user
        })
    }
};
let tokenGenerate = function (length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"+Date.now();

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};