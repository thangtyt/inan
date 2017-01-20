/**
 * Created by thangtyt on 1/20/17.
 */
let _ = require('arrowjs')._;
module.exports = function (controller, component, app) {
    "use strict";
    controller.reportQuestion = function (req,res) {
        let questionId = req.params.questionId;
        //let data = req.body;
        if (questionId){
            res.status(200).jsonp({
                message: 'Thông báo câu hỏi bị lỗi thành công !'
            })
        }else{
            res.status(400).jsonp({
                message: 'Thông báo câu hỏi bị lỗi không thành công !'
            })
        }
    }
}