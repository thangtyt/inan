/**
 * Created by thangtyt on 11/21/16.
 */
'use strict';
module.exports = function (controller,component,app) {

    controller.getSubjects = function (req, res) {
        let actions = app.feature.examination.actions;
        let host = req.protocol + '://'+req.get('host');
        actions.sFindAll()
        .then(function (subjects) {
                subjects = subjects.filter(function (val) {
                    if(typeof val.icons == 'string'){
                        val.icons = JSON.parse(val.icons);
                        val.icons.default = host+val.icons.default;
                        val.icons.hover = host+val.icons.hover;
                    }
                    return val;
                })
            res.status(200);
            res.jsonp(JSON.parse(JSON.stringify(subjects)));
        }).catch(function (err) {
            res.status(300);
            res.jsonp({
                message: err.message
            })
        })
    }

}
