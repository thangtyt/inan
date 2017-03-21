'use strict';

let promise = require('arrowjs').Promise;

module.exports = function (cont, comp, app) {
    cont.view = function (req, res) {
        promise.all([
            app.feature.users.actions.findAndCountAll({
                where: {
                    user_status: 'publish'
                },
                limit: 8,
                order: 'id DESC'
            })
        ]).then(function (results) {
            res.backend.render('index', {
                userStatistic: results[0].count,
                newestUsers: results[0].rows
            });
        }).catch(function (err) {
            //console.log(err);
            res.backend.render('index');
        })
    };
};