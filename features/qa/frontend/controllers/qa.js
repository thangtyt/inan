/**
 * Created by thangtyt on 1/20/17.
 */
let _ = require('arrowjs')._;
module.exports = function (controller, component, app) {
    "use strict";
    controller.reportQuestion = function (req,res) {
        let questionId = req.params.questionId;
        let data = req.body;
        let user = req.user;
        app.models.question.find({
            where: {
                id : questionId
            }
        }).then(function (_question) {
            if (_question){
                return app.models.questionReport.create({
                    question_id : questionId,
                    content : data.content,
                    created_by : user.id
                }).then(function () {
                    res.status(200).jsonp({
                        message: 'Thông báo lỗi câu hỏi thành công !'
                    })
                })

            }else{
                throw new Error('Câu hỏi bạn báo lỗi không tồn tại !');
            }
        }).catch(function (err) {
            res.status(400).jsonp({
                message: err.message
            })
        })

    }
}