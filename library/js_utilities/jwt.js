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

    if(token){
        jwt.verify(token,jwt_conf.jwtSecretKey, function (err,decoded) {
            //console.log(decoded);
            if(err||!decoded){
                res.status(440).jsonp({
                    message: 'Đăng nhập không thành công !'
                })
            }else{
                req.user = decoded.data;
                next();
            }
        })
    }else{
        res.status(499).jsonp({
            message: "Bạn cần đăng nhập để tiếp tục !"
        })
    }
}
