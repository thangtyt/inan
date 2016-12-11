'use strict';
const nodeMailer = require('nodemailer');
module.exports = function (controller, component, app) {
    let mailConfig = app.getConfig('mailer_config');
    controller.view = function (req, res) {
        if(req.user){
            res.redirect('/admin');
        }else{
            res.backend.render('login');
        }

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
        res.redirect('/admin/login');
    };

    controller.forgotview = function (req,res) {
        res.backend.render('forgot');
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
                res.backend.render('changePass',{
                    error : {
                        message : 'This function is expires or not avaiable !'
                    }
                });
            }else{
                res.backend.render('changePass');
            }
        }).catch(function (err) {
            res.backend.render('changePass',{
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
                res.backend.render('changePass');
            }else{
                if(!user){
                    res.backend.render('changePass',{
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
                            res.backend.render('changePass');
                        }

                    })

                }
            }

        }).catch(function (err) {
            res.backend.render('changePass',{
                error : {
                    message : 'This function is expires or not available !'
                }
            });
        })
    }
    controller.forgot = function (req,res) {
        app.feature.users.actions.findByEmail( req.body.email)
            .then(function (user) {
                if(!user){
                    res.backend.render('forgot',{
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
                                        res.backend.render('forgot');
                                    }else{
                                        res.backend.render('forgot',{
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
            res.backend.render('forgot',{
                messages : {
                    error : [err.message]
                }
            });
        })

    }
    controller.notHavePermission = function (req, res) {
        res.jsonp({
            status: 403,
            message: 'The request was a valid request'
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