/**
 * Created by thangtyt on 11/23/16.
 */
exports.setHeaderCors = function (req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
}