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
            }),
            app.models.exam.findAndCountAll({
                where: {
                    status: 1
                },
                include: {
                    model: app.models.subject,
                    attributes: ['id','icons','title']
                },
                attributes: ['id','subject_id','title','status'],
                limit: 4,
                order: 'id DESC',
                raw:true
            }),
            app.models.question.count(),
            app.models.questionReport.count({
                where: {
                    status: 0
                }
            })
        ]).then(function (results) {
            results[1].rows.filter(function (_exam) {
                _exam.icon = JSON.parse(_exam['subject.icons']).icon.default;
                return _exam;
            });
            res.backend.render('index', {
                questionStatistic: results[2],
                examStatistic: results[1].count,
                userStatistic: results[0].count,
                errorQAStatistic: results[3],
                newestUsers: results[0].rows,
                newestExams: results[1].rows
            });
        }).catch(function (err) {
            //console.log(err);
            res.backend.render('index');
        })
    };
};