/**
 * Created by thangtyt on 11/21/16.
 */
'use strict';
module.exports = function (controller,component,app) {

    controller.getSubjects = function (req, res) {
        let actions = app.feature.examination.actions;
        let host = req.protocol + '://'+req.get('host');
        actions.sFindAll({
            limit: 6
        })
        .then(function (subjects) {
                subjects = subjects.filter(function (val) {
                    console.log(JSON.stringify(val,3,3));
                    if(typeof val.icons == 'string'){
                        try{
                            val.icons = JSON.parse(val.icons);
                            val.icons.icon.default = host+val.icons.icon.default;
                            val.icons.icon.hover = host+val.icons.icon.hover;
                        }catch(err){
                            val.icons = {}
                        }
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
