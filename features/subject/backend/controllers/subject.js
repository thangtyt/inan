/**
 * Created by thangnv on 11/3/16.
 */

'use strict'
let _ = require('arrowjs')._;
let Promise = require('arrowjs').Promise;
let logger = require('arrowjs').logger;
module.exports = function (controller, component, app) {
    //todo: not done. View must process javascript, delete method ...
    let baseRoute = '/admin/subject';
    let permission = {
        all : 'all',
        create : 'create',
        edit : 'edit',
        delete : 'delete',
        active: 'active'
    };
    let isAllow = ArrowHelper.isAllow;
    controller.list = function (req, res) {

        // Get current page and default sorting
        var page = req.params.page || 1;
        let itemOfPage = app.getConfig('pagination').numberItem || 10;
        //start create toolbar
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton(baseRoute);
        toolbar.addSearchButton(isAllow(req, permission.index));
        toolbar.addCreateButton(isAllow(req, false), baseRoute + '/create');
        toolbar.addDeleteButton();
        toolbar = toolbar.render();
        //end toolbar
        //define column to be displayed
        let table = [
            {
                column: 'id',
                width: '1%',
                header: ' ',
                type: 'checkbox'
            },
            {
                column: 'title',
                width: '20%',
                header: 'Tiêu đề',
                link: baseRoute + '/' + '{id}',
                filter: {
                    data_type: 'string'
                }
            },
            {
                column: 'class',
                width: '10%',
                header: 'Lớp',
                filter: {
                    data_type: 'number'
                }
            }
        ];

        let filter = ArrowHelper.createFilter(req, res, table, {
            rootLink: baseRoute + '/page/$page/sort',
            limit: itemOfPage,
            backLink: 'subject_back_link'
        });
        filter.order = req.params.sort ? req.params.sort : 'created_at DESC';
        app.models.subject.findAndCountAll({
            where: filter.conditions,
            order: filter.order || ' created_at DESC',
            limit: filter.limit,
            offset: (page - 1) * itemOfPage
        }).then(function (results) {
            let totalPage = Math.ceil(results.count / itemOfPage);
            // Replace title of no-title post
            let items = results.rows;
            items.map(function (item) {
                if (!item.title) item.title = '( Không có tiêu đề )';
            });

            // Render view
            res.backend.render('list', {
                title: 'Danh sách môn thi',
                totalPage: totalPage,
                items: items,
                currentPage: page,
                toolbar: toolbar,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                baseRoute: baseRoute
            });
        }).catch(function (err) {
            logger.error(err);
            req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);

            // Render view if has error
            res.backend.render('list', {
                title: 'Danh sách môn thi',
                totalPage: 1,
                items: null,
                currentPage: page,
                toolbar: toolbar,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                baseRoute: baseRoute
            });
        });
    };
    controller.view = function (req, res) {

        let subjectId = req.params.subjectId;
        let toolbar = new ArrowHelper.Toolbar();
        let icons = app.getConfig('subjects');
        toolbar.addBackButton(req, 'subject_back_link');
        toolbar.addSaveButton();
        toolbar.addDeleteButton();
        app.models.subject.find({
            where: {
                id: subjectId
            },
            include: [
                {
                    model: app.models.chapter,
                    as: 'chapters'
                }
            ]
        })
        .then(function (subject) {
                //console.log('VIEW ',subject);
                subject.icons = JSON.parse(subject.icons);
            if(subject){
                subject.chapters = subject['chapters'].sort(function (a, b) {
                    return a.index - b.index;
                });
                res.backend.render('form', {
                    title: 'Thông tin chi tiết',
                    toolbar: toolbar.render(),
                    subject: subject,
                    icons: JSON.parse(JSON.stringify(icons)),
                    baseRoute: baseRoute
                })
            }else{
                res.backend.render('form', {
                    title: 'Thông tin chi tiết',
                    toolbar: toolbar.render(),
                    subject: null,
                    icons: ''
                })
            }

        }).catch(function (err) {
            logger.error(err.message);
            req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);
            res.backend.render('form', {
                toolbar: toolbar.render()
            })
        });

        //res.backend.render('subject/form',{
        //    toolbar : toolbar.render()
        //})
    };
    controller.delete = function (req, res) {

        let ids = [];
        if (req.params.subjectId){
            ids = [req.params.subjectId]
        }else{
            ids = req.body.ids.split(',');
        }
        Promise.all([
            app.models.section.count({
                where: {
                    subject_id: {
                        $in : ids
                    }
                }
            }),
            app.models.question.count({
                where: {
                    subject_id: {
                        $in : ids
                    }
                }
            })
        ]).then(function (resultCount) {
            if(resultCount[0] > 0 || resultCount[1] > 0){
                throw new Error();
            }else{
                return app.models.chapter.delete({
                    where: {
                        subject_id: {
                            $in: ids
                        }
                    }
                }).then(function (deleteChapter) {
                    return app.models.subject.destroy({
                        where: {
                            id: {
                                $in: ids
                            }
                        }
                    })
                })
            }
        })
        .then(function (result) {
            if (result){
                req.flash.success('Xóa môn thi thành công !');
                return res.jsonp({});
            }else{
                throw new Error();
            }

        }).catch(function (err) {
            req.flash.error('Bạn không thể xóa khi có môn thi đã được dùng !');
            return res.jsonp({
                error: 'Bạn không được xóa môn thi !'
            });
        });
    };
    controller.update = function (req, res,next) {

        let subjectId = req.params.subjectId;
        let data = req.body;

        let _icons = data.icons.split('::');
        data.icons = {
            id: _icons[0],
            name: _icons[1],
            icon: {
                default: _icons[2],
                hover: _icons[3]
            }
        };
        data.icons = JSON.stringify(data.icons);
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'subject_back_link');
        toolbar.addSaveButton();
        toolbar.addDeleteButton();
        app.models.subject.find({
            where: {
                id: subjectId
            }
        })
        .then(function (result) {
            //console.log(JSON.stringify(result,2,2));
            return result.update(data);
        })
        .then(function (newSubject) {
            if(newSubject){
                return app.models.chapter.destroy({
                    where: {
                        subject_id: subjectId
                    }
                }).then(function () {
                    let chapterPromise = [];
                    let chapters = [];
                    try {
                        chapters = JSON.parse(data['chapter']);
                    } catch (err) {
                        chapters = [];
                    }
                    chapters.map(function (chapter) {
                        try {
                            chapter.lessons = JSON.stringify(chapter.lessons);
                        } catch (err) {
                            //console.log(err);
                            chapter.lessons = []
                        }
                        chapterPromise.push(
                            app.models.chapter.create({
                                id: chapter.id,
                                title: chapter.title,
                                subject_id: newSubject.id,
                                index: chapter.index,
                                lessons: chapter.lessons
                            })
                        );
                    })
                    return Promise.all(chapterPromise);
                })
            }else{
                return null;
            }
        })
        .then(function (chapters) {
            //console.log(JSON.stringify(chapters));
            req.flash.success('Cập nhật môn thi thành công !');
            next();
        })
        .catch(function (err) {
            //console.log(err);
            req.flash.error('Cập nhật môn thi không thành công !');
            next();
        });
    };
    controller.create = function (req, res) {

        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'subject_back_link');
        toolbar.addSaveButton();
        let subjectList = app.getConfig('subjects');

        res.backend.render('form', {
            title: 'Thêm mới môn thi',
            toolbar: toolbar.render(),
            icons: subjectList
        })
    };
    controller.save = function (req, res) {

        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'subject_back_link');
        toolbar.addSaveButton();
        let form = req.body;
        if (form.icons){
            let icons = form.icons.split('::');
            icons = {
                name: icons[0],
                default: icons[1],
                hover: icons[2]
            }
            form.icons = JSON.stringify(icons);

        }
        //console.log(JSON.stringify(form.icons));
        app.models.subject.create(form)
            .then(function (subject) {
                if (subject) {
                    let chapterPromise = [];
                    let chapters = [];
                    try {
                        chapters = JSON.parse(form['chapter']);
                    } catch (err) {
                        chapters = [];
                    }
                    chapters.map(function (chapter) {
                        try {
                            chapter.lessons = JSON.stringify(chapter.lessons);
                        } catch (err) {
                            chapter.lessons = []
                        }
                        chapterPromise.push(
                            app.models.chapter.create({
                                id: chapter.id,
                                title: chapter.title,
                                subject_id: subject.id,
                                index: chapter.index,
                                lessons: chapter.lessons

                            })
                        );
                    })
                    return Promise.all(chapterPromise);
                }
            })
            .then(function (chapters) {
                if (chapters.length > 0) {
                    req.flash.success('Thêm mới môn thi thành công !');
                    res.redirect(baseRoute);
                } else {
                    res.backend.render('form', {
                        toolbar: toolbar.render(),
                        subject: form
                    })
                }
            }).catch(function (err) {
                logger.error(err.message);
                req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);
                res.backend.render('form', {
                    toolbar: toolbar.render(),
                    subject: form
                })
            })
    };
}