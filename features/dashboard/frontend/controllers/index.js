'use strict';

module.exports = function (controller, component, application) {

    controller.index = function (req, res) {
        //console.log(res);
        res.frontend.render('index', {
            title: 'Home page'
        })
    };
};