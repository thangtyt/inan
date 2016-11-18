/**
 * Created by thangnv on 10/27/16.
 */
"use strict";
let  FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function (passport, config, app) {
    passport.use(new FacebookStrategy({
        clientID: config.facebook.FACEBOOK_APP_ID,
        clientSecret: config.facebook.FACEBOOK_APP_SECRET,
        callbackURL: config.facebook.CALLBACK_URL,
        profileFields: ['id', 'displayName', 'photos', 'email']
        },
        function(accessToken, refreshToken, profile, done) {
            //console.log(profile);
            let user = {
                user_email : profile.emails[0].value || '',
                display_name : profile.displayName || '',
                user_image_url : profile.photos[0].value || '',
                user_name : profile.username || '',
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