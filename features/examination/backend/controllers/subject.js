/**
 * Created by thangnv on 11/3/16.
 */

'use strict'
let _ = require('arrowjs')._;
let Promise = require('arrowjs').Promise;
let logger = require('arrowjs').logger;
module.exports = function (controller, component, app) {
    //todo: not done. View must process javascript, delete method ...
    let baseRoute = '/admin/examination/subject';
    let permission = {
        all: 'subject',
        create: 'subject',
        index: 'subject',
        delete: 'subject'
    }
    let isAllow = ArrowHelper.isAllow;
    controller.sList = function (req, res) {
        let actions = app.feature.examination.actions;
        // Get current page and default sorting
        var page = req.params.page || 1;
        let itemOfPage = app.getConfig('pagination').numberItem || 10;
        //start create toolbar
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton(baseRoute);
        toolbar.addSearchButton(isAllow(req, permission.index));
        toolbar.addCreateButton(isAllow(req, permission.all), baseRoute + '/create');
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
                header: 'Title',
                link: baseRoute + '/' + '{id}',
                filter: {
                    data_type: 'string'
                }
            },
            {
                column: 'class',
                width: '10%',
                header: 'class',
                filter: {
                    data_type: 'string'
                }
            }
        ];
        let filter = ArrowHelper.createFilter(req, res, table, {
            rootLink: baseRoute + '/page/$page/sort',
            limit: itemOfPage,
            backLink: 'subject_back_link'
        });
        actions.sFindAndCountAll({
            where: filter.conditions,
            order: filter.order || ' created_at DESC',
            limit: filter.limit,
            offset: (page - 1) * itemOfPage
        }).then(function (results) {
            let totalPage = Math.ceil(results.count / itemOfPage);
            // Replace title of no-title post
            let items = results.rows;
            items.map(function (item) {
                if (!item.title) item.title = '(no title)';
            });

            // Render view
            res.backend.render('subject/list', {
                title: 'Subject',
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
            res.backend.render('subject/list', {
                title: 'Subject',
                totalPage: 1,
                items: null,
                currentPage: page,
                toolbar: toolbar,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                baseRoute: baseRoute
            });
        });
    };
    controller.sView = function (req, res) {
        let actions = app.feature.examination.actions;
        let subjectId = req.params.subjectId;
        let toolbar = new ArrowHelper.Toolbar();
        let icons = app.getConfig('subjects');
        toolbar.addBackButton(req, 'sView_back_link');
        toolbar.addSaveButton();
        toolbar.addDeleteButton();
        actions.sFind({
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
            if(subject){
                subject.chapters = subject['chapters'].sort(function (a, b) {
                    return a.index - b.index;
                });
                res.backend.render('subject/form', {
                    toolbar: toolbar.render(),
                    subject: JSON.parse(JSON.stringify(subject)),
                    icons: icons
                })
            }else{
                res.backend.render('subject/form', {
                    toolbar: toolbar.render(),
                    subject: JSON.parse(JSON.stringify(subject)),
                    icons: icons
                })
            }

        }).catch(function (err) {
            logger.error(err.message);
            req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);
            res.backend.render('subject/form', {
                toolbar: toolbar.render()
            })
        });

        //res.backend.render('subject/form',{
        //    toolbar : toolbar.render()
        //})
    };
    controller.sDelete = function (req, res) {
        let actions = app.feature.examination.actions;
        let ids = [];
        //console.log('11111');
        if (req.params.subjectId){
            ids = [req.params.subjectId]
        }else{
            ids = req.body.ids.split(',');
        }
        actions.cDelete({
            where : {
                id: {
                    $in: ids
                }
            }
        }).then(function (result) {
            req.flash.success('Delete successfully !');
            res.jsonp({
                error: null
            });
        }).catch(function (err) {
            req.flash.error('You cannot delete one of subjects !');
            res.jsonp({
                error: 'You cannot delete one of subjects !'
            });
        });
        //app.models.transaction(function (t) {
        //    let sectionsToDelete = [];
        //    ids.map(function (secId) {
        //        sectionsToDelete.push(app.models.section.destroy({
        //            where: {
        //                id: secId
        //            }
        //        },{transaction: t}));
        //    })
        //    return Promise.all(sectionsToDelete);
        //}).then(function (result) {
        //    console.log(result);
        //}).catch(function (err) {
        //    console.log(err);
        //})
        //console.log(ids);
        //res.redirect(baseRoute);
        //res.sendStatus(200);
    };
    controller.sUpdate = function (req, res,next) {
        let actions = app.feature.examination.actions;
        let subjectId = req.params.subjectId;
        let data = req.body;
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'sView_back_link');
        toolbar.addSaveButton();
        toolbar.addDeleteButton();
            Promise.all([
                actions.sFind({
                    where: {
                        id: subjectId
                    }
                })
            ])
                .then(function (result) {
                    //console.log(JSON.stringify(result,2,2));
                    return actions.sUpdate(result[0],data)
                        .then(function (newSubject) {
                            //console.log('NEEEEEEE',newSubject);
                            return newSubject;
                        }).
                        catch(function (err) {
                            return null;
                        })
                })
                .then(function (newSubject) {
                    if(newSubject){
                        return actions.cDelete({
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
                                    actions.cCreate({
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
                    req.flash.success('Update subject successfully !');
                    next();
                })
                .catch(function (err) {
                    logger.error(err.message);
                    req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);
                    next();
                });
    };
    controller.sCreate = function (req, res) {
        //let actions = app.feature.examination.actions;
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'sCreate_back_link');
        toolbar.addSaveButton();
        let subjectList = app.getConfig('subjects');

        res.backend.render('subject/form', {
            toolbar: toolbar.render(),
            icons: subjectList
        })
    };
    controller.sSave = function (req, res) {
        let actions = app.feature.examination.actions;
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'sCreate_back_link');
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
        actions.sCreate(form)
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
                            actions.cCreate({
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
                    req.flash.success('Create subject successfully !');
                    res.redirect(baseRoute);
                } else {
                    res.backend.render('subject/form', {
                        toolbar: toolbar.render(),
                        subject: form
                    })
                }
            }).catch(function (err) {
                logger.error(err.message);
                req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);
                res.backend.render('subject/form', {
                    toolbar: toolbar.render(),
                    subject: form
                })
            })
    };
}