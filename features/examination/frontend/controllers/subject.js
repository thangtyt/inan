/**
 * Created by thangtyt on 11/21/16.
 */
'use strict';
module.exports = function (controller,component,app) {

    controller.getSubjects = function (req, res) {
        let actions = app.feature.examination.actions;
        actions.sFindAll()
        .then(function (subjects) {
            res.jsonp(JSON.parse(JSON.stringify(subjects)));
        }).catch(function (err) {
            res.jsonp({
                status: 300,
                message: err.message
            })
        })
    }

}
