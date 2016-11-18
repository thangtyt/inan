/**
 * Created by thangnv on 10/28/16.
 */

"use strict";
let  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = function (passport, config, app) {
    passport.use(new GoogleStrategy({
            clientID: config.google.GOOGLE_CLIENT_ID,
            clientSecret: config.google.GOOGLE_CLIENT_SECRET,
            callbackURL: config.google.CALLBACK_URL,
            profileFields: ['displayName', 'photos', 'email']
        },
        function(token, tokenSecret, profile, done) {
            let user = {
                user_email : profile.emails[0].value || '',
                display_name : profile.displayName || '',
                user_image_url : profile.photos[0].value || '',
                user_status : 'publish'

            }
            let conditions = {};
            let isEmpty = false;
            try{
                if(profile['emails'].length > 0){
                    conditions = {
                        where : {
                            user_email : profile.emails[0].value
                        }
                    }
                }else if(profile.username != undefined){
                    conditions = {
                        where : {
                            user_name : profile.username
                        }
                    }
                }else{
                    isEmpty = true;
                }
                if (!isEmpty){
                    app.feature.users.actions.find(conditions)
                        .then(function (userFound) {
                            if(userFound){
                                done(null,userFound);
                            }else{
                                app.feature.users.actions.create(user)
                                    .then(function (new_user) {
                                        done(null,new_user);
                                    })
                            }
                        })
                        .catch(function (err) {
                            done(err,null);
                        })
                }else{
                    done(new Error('Error when using connect to Facebook'),null);
                }

            }catch (err){
                done(err,null)
            }
        }
    ));
}