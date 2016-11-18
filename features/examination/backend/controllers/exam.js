/**
 * Created by thangnv on 11/3/16.
 */
'use strict';
module.exports = function (controller,component,app) {
    let baseRoute = '/admin/examination/exam';
    let permission = {
        all : 'manager',
        create : 'manager',
        index : 'manager',
        delete : 'manager',
        active: 'active'
    }
    let isAllow = ArrowHelper.isAllow;
    controller.eList = function (req,res) {
        let actions = app.feature.examination.actions;
        // Get current page and default sorting
        let page = req.params.page || 1;
        let itemOfPage = app.getConfig('pagination').numberItem || 10;
        // Add button on view
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton(baseRoute);
        toolbar.addSearchButton(isAllow(req, permission.index));
        toolbar.addGeneralButton(true,{
            link: baseRoute+'/create/auto-generate',
            title: '<i class="fa fa-plus"></i>  Create Exam Auto',
            buttonClass: 'btn btn-primary'
        });
        toolbar.addGeneralButton(true,{
            link: baseRoute+'/create/auto-manual',
            title: '<i class="fa fa-plus"></i>  Create Exam Manual',
            buttonClass: 'btn btn-primary'
        })
        toolbar.addDeleteButton();
        toolbar = toolbar.render();
        let table = [
            {
                column : 'id',
                width : '1%',
                header : ' ',
                type : 'checkbox'
            },
            {
                column : 'title',
                width : '20%',
                header : 'Title',
                link : baseRoute + '/' + '{id}',
                filter : {
                    data_type : 'string'
                }
            //},
            //{
            //    column : 'subject.title',
            //    width : '15%',
            //    header : 'Subject',
            //    filter : {
            //        data_type : 'string'
            //    }
            //},
            //{
            //    column : 'chapter.title',
            //    width : '15%',
            //    header : 'Chapter',
            //    filter : {
            //        data_type : 'string'
            //    }
            //},
            //{
            //    column : 'lesson',
            //    width : '10%',
            //    header : 'Lesson',
            //    filter : {
            //        data_type : 'string'
            //    }
            //},
            //{
            //    column : 'level',
            //    width : '10%',
            //    header : 'Level',
            //    type : 'custom',
            //    alias : {
            //        "0" : 'Basic' ,
            //        "1" : 'Medium',
            //        "2" : 'Difficult',
            //        "3" : 'Very Difficult'
            //    },
            //    filter : {
            //        type : 'select',
            //        filter_key : 'level',
            //        data_source : [
            //            {
            //                name : 'Easy',
            //                value : 0
            //            },{
            //                name : 'Medium',
            //                value : 1
            //            },{
            //                name : 'Difficult',
            //                value : 2
            //            },{
            //                name : 'Very Difficult',
            //                value : 3
            //            }
            //        ],
            //        display_key : 'name',
            //        value_key : 'value'
            //    }
            }
        ];
        let filter = ArrowHelper.createFilter(req, res, table, {
            rootLink: baseRoute + '/page/$page/sort',
            limit: itemOfPage,
            backLink: 'qa_back_link'
        });
        res.backend.render('exam/list',{
            title: 'List Of Exam',
            toolbar : toolbar
        })
    }
}