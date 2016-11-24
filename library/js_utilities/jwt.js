/**
 * Created by thangtyt on 11/23/16.
 */
let jwt = require('jsonwebtoken');
exports.jwt = function (req,res,next) {
    let jwt_conf = this.getConfig('jwt');
    //let token = req.body.token || req.query.token || req.headers['x-access-token'];
    let token ;
    try{
        token = req.headers['authorization'].split(/[ +]/ig).pop();
    }catch(err){
        token = null;
    }
    //console.log(token);
    if(token){
        jwt.verify(token,jwt_conf.jwtSecretKey, function (err,decoded) {
            //console.log(decoded);
            if(err||!decoded){
                res.status(440).jsonp({
                    messgage: 'Wrong token'
                })
            }else{
                req.user = decoded.data;
                next();
            }
        })
    }else{
        res.status(499).jsonp({
            messgage: 'Token required !'
        })
    }
}
