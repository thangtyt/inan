/**
 * Created by thangtyt on 11/23/16.
 */
let jwt = require('jsonwebtoken');
exports.jwt = function (req,res,next) {
    let jwt_conf = this.getConfig('jwt');
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
        if(token){
            jwt.verify(token,jwt_conf.jwtSecretKey, function (err,decoded) {
                if(err||!decoded){
                    res.redirect('/api/440')
                }else{
                    req.user = decoded.data;
                    next();
                }
            })
        }else{
            res.redirect('/api/499');
        }
}
