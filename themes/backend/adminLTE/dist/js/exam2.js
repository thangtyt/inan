/**
 * Created by thangtyt on 12/16/16.
 */

var content = [];
var questionChose = [];
var questionListTemp = [];
var filter = '';
var total_mark_auto = 0 ;
var sectionDiv = `
                <div class="box box-info" id="$id$">
                    <div class="box-header ">
                        <h3 class="box-title">$section-title$</h3>
                    </div>
                    <div class="box-body table-responsive no-padding">
                        <table class="table table-bordered table-hover sorted_table" id="tbody-$id$">
                        <thead>
                            <tr>
                              <th style="width: 39%">Tiêu đề</th>
                              <th style="width: 10%">Loại câu hỏi</th>
                              <th style="width: 10%">Độ khó</th>
                              <th style="width: 10%">Nhóm câu hỏi</th>
                              <th style="width: 10%">#</th>
                            </tr>
                        </thead>
                        <tbody id="section-tbody-$id$">

                        </tbody>
                      </table>
                    </div>
                    <!-- /.box-body -->
                    <div class="box-footer">
                      <button type="button" class="btn btn-info pull-right" onclick="showQuestions('$id$')">Thêm câu hỏi</button>
                      <button type="button" class="btn btn-reset" onclick="resetQuestions()">Xóa toàn bộ</button>
                    </div>
                    <!-- /.box-footer-->
                </div>

`;



function loadSections(){
    var subjectId = $('select[name="subject_id"]').val();
    $.ajax({
        url: '/admin/exam/list-section/'+subjectId,
        type: 'GET'
    }).done(function(results){
        if(!results) results =[];
        results.map(function (section) {
            $('#listSection').append('<li data-name="'+section.title+'" data-id="'+section.id+'"><i class="fa fa-fw fa-arrows-alt icon-move"></i> <span onclick="editSection(\''+section.id+'\')"> '+section.title+'</span></li>');
        });
        sortableInit();
    });
}
function addSection(element) {
    //console.log('addSection',JSON.stringify(element,2,2));
    var contentDiv = sectionDiv.replace(/\$id\$/g,element.id);
    contentDiv = contentDiv.replace(/\$section-title\$/g,element.text);
    $('#sortable').append(contentDiv);
    $.ajax({
        url: '/admin/exam/list-question/'+element.id,
        type: 'GET'
    }).done(function(questions) {
        if (!questions) questions = [];
        $('#question-' + element.id).select2();
        //console.log(JSON.stringify(questions,3,3));
        questions.map(function (question) {
            //console.log(question);
            var opt = new Option(question.title, question.id);
            $('#question-' + element.id).append(opt);
        });
        $('#question-' + element.id).on('select2:select', function (e) {
            addElement(element.id, e.params.data.id)
        });
        $('#question-' + element.id).on('select2:unselect', function (e) {
            removeElement(element.id, e.params.data.id);
        });
        //for update exam
        var _question = [];

        if (_content) {
            _content.map(function (con) {
                if (con.section_id == element.id) {
                    con.questions.map(function (ques) {
                        _question.push(ques);
                    })
                }
            });
            $('#question-' + element.id).select2('val', _question);
            _question.map(function (ques) {
                addElement(element.id, ques);
            })
        };
    });
}

function sortableInit() {
    choseSection = $("#choseSection").sortable({
        group: 'section',
        pullPlaceholder: false,
        handle: 'i.icon-move',
        // animation on drop
        onDrop: function ($item, container, _super) {
            var $clonedItem = $('<li/>').css({height: 0});
            $item.before($clonedItem);
            $clonedItem.animate({'height': $item.height()});
            $item.animate($clonedItem.position(), function () {
                $clonedItem.detach();
                _super($item, container);
            });
        },
        // set $item relative to cursor position
        onDragStart: function ($item, container, _super) {
            var offset = $item.offset(),
                pointer = container.rootGroup.pointer;

            adjustment = {
                left: pointer.left - offset.left,
                top: pointer.top - offset.top
            };
            _super($item, container);
        },
        onDrag: function ($item, position) {
            $item.css({
                left: position.left - adjustment.left,
                top: position.top - adjustment.top
            });
        },
        afterMove: function ($placeholder, container, $closestItemOrContainer) {
            //console.log(4444);
        },
        serialize: function ($parent, $children, parentIsContainer) {
            var result = $.extend({}, $parent.data());
            if (parentIsContainer)
                return [$children];
            else if ($children[0]) {
                result.children = $children
            }

            _sections.push({
                section_id: result.id,
                section_title: result.name
            });
        }
    });
    $("#listSection").sortable({
        group: 'section'
    });
}
function editSection(sectionId){
    serializeSection();
    content.map(function (_con) {
        if(_con.section_id == sectionId){
            $('#listQuestion').empty();
            $('#listQuestion').append(sectionDiv.replace(/\$id\$/g,_con.section_id).replace(/\$section-title\$/g,_con.section_title));
            initTableSort('tbody-'+_con.section_id);
        }
    });
}
function serializeSection(){
    _sections=[];
    let temp = [];
    choseSection.sortable('serialize').get();
    temp = _sections.filter(function (_sec) {
        //console.log(_sec);
        if (content.length == 0){
            _sec.questions = [];
            return _sec;
        }else{
            var _temp;
            content.map(function (_con) {
                if (_sec.section_id == _con.section_id){
                    _temp = _con;
                }else{
                    _temp = {
                        section_id: _sec.section_id,
                        section_title: _sec.section_title,
                        questions: []
                    }
                }
            });
            return _temp;
        }
    });
    content = temp;
}
function initTableSort(tableId){
    $('#'+tableId).sortable({
        containerSelector: 'table',
        itemPath: '> tbody',
        itemSelector: 'tr',
        placeholder: '<tr class="placeholder"/>',
        serialize: function ($parent, $children, parentIsContainer) {
            var result = $.extend({}, $parent.data());
            if (parentIsContainer)
                return [$children];
            else if ($children[0]) {
                result.children = $children
            }
        }
    });
}
function showQuestions(sectionId){

    //$('.modal-body').append('<iframe src="/admin/exam/list-questions/'+sectionId+'"></iframe>');
    //$('#list-questions').modal('show');
    $.ajax({
        url: '/admin/exam/list-questions/'+sectionId,
        type: 'POST',
        data: {
            exitsQuestion : getQuestionOfSectionArray(sectionId)
        }
    }).done(function(results){
        //console.log(11111,JSON.stringify(results,2,2));
        if(results){
            questionListTemp = results.items;
            $('.modal-body').empty();
            $('.modal-body').append(listQuestion(results.items,results.totalPage,results.page));
            $('#list-questions').modal('show');
        }
    });

}
function listQuestion(items,totalPage,page){
    if (!items)
        items=[];
    var result =
        `<div class="box box-solid">
            <div class="box-header">
              <h3 class="box-title">Danh sách câu hỏi</h3>
            </div>
            <!-- /.box-header -->
            <div class="box-body">
              <div id="example1_wrapper" class="dataTables_wrapper form-inline dt-bootstrap">
                <div class="row">
                    <div class="col-sm-6">
                        <div class="dataTables_length" id="example1_length">
                            <label>Show
                                <select name="example1_length" aria-controls="example1" class="form-control input-sm">
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select> entries
                            </label>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div id="example1_filter" class="dataTables_filter pull-right">
                            <label>
                                <button type="button" class="btn btn-block btn-info btn-sm">Lọc câu hỏi</button>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-12">
                        <table id="example1" class="table table-bordered table-striped dataTable table-hover" role="grid" aria-describedby="example1_info">
                            <thead>
                                <tr role="row">
                                    <th class="sorting" tabindex="0" aria-controls="example1" rowspan="1" colspan="1" style="width: 1%;">
                                        #
                                    </th>
                                    <th class="sorting" tabindex="0" aria-controls="example1" rowspan="1" colspan="1" style="width: 55%;">
                                        Tiêu đề
                                    </th>
                                    <th class="sorting" tabindex="0" aria-controls="example1" rowspan="1" colspan="1" style="width: 15%;">
                                        Loại câu hỏi
                                    </th>
                                    <th class="sorting" tabindex="0" aria-controls="example1" rowspan="1" colspan="1" style="width: 15%;">
                                        Độ khó
                                    </th>
                                    <th class="sorting_desc" tabindex="0" aria-controls="example1" rowspan="1" colspan="1" style="width: 14%;">
                                        Nhóm câu hỏi
                                    </th>
                                </tr>
                                <tr role="row">
                                    <th>

                                    </th>
                                    <th>
                                        <input name="modal_title" class="modal-input">
                                    </th>
                                    <th >
                                        <select name="modal_question_type">
                                            <option value="">Tất cả</option>
                                            <option value="0">Trắc Nghiệm</option>
                                            <option value="1">Tự Luận</option>
                                        </select>
                                    </th>
                                    <th>
                                        <select name="modal_level">
                                            <option value="">Tất cả</option>
                                            <option value="0">Dễ</option>
                                            <option value="1">Bình thường</option>
                                            <option value="2">Khó</option>
                                        </select>
                                    </th>
                                    <th>
                                        <select name="modal_require">
                                            <option value="">Tất cả</option>
                                            <option value="0">Câu hỏi đơn</option>
                                            <option value="1">Nhóm câu hỏi</option>
                                        </select>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>`;
                            items.map(function (item) {
                                var temp = '<tr role="row" class="odd">';
                                temp+= '<td><input type="checkbox" id="checkbox-'+item.id+'" onclick="chooseQuestion(\''+item.id+'\')" value="'+item.id+'"/>';
                                temp+= '<td>'+item.title+'</td>';
                                temp+= '<td>'+ (item.question_type == 0 ? 'Trắc nghiệm' : 'Tự Luận' ) +'</td>';
                                temp+= '<td>'+ checkLevel(item.level)              +'</td>';
                                temp+= '<td>'+ (item.require == 0 ? 'Câu hỏi đơn' : 'Nhóm câu hỏi' )  +'</td>';
                                temp+= '</tr>';
                                result+=temp;
                            });
            result+=`        </tbody>
                        </table>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-5">
                        <div class="dataTables_info pull-left center" id="example1_info" role="status" aria-live="polite">
                            Đã chọn : <span id="countChose"> 0 </span>
                        </div>
                    </div>
                    <div class="col-sm-7">`;
                    if(totalPage > 1){
                        result+='<div class="dataTables_paginate paging_simple_numbers pull-right"><ul class="pagination">'
                            for(var i = 1 ; i <= totalPage ; i++){
                                result+='<li class="paginate_button '+ (i == totalPage ? 'next' : '')(i == 1 ? 'previous' : '') (page == 1 ? 'disabled' : '') +'">';
                                result+='<a href="#">'+ (i == totalPage ? 'sau' : '')(i == 1 ? 'Trước' : i) +'</a>'
                            }

                        result+='</ul></div>';
                    }

                            //<ul class="pagination">
                            //    <li class="paginate_button previous disabled" id="example1_previous">
                            //        <a href="#" aria-controls="example1" data-dt-idx="0" tabindex="0">Previous</a>
                            //    </li>
                            //    <li class="paginate_button active">
                            //        <a href="#" aria-controls="example1" data-dt-idx="1" tabindex="0">1</a>
                            //    </li>
                            //    <li class="paginate_button ">
                            //        <a href="#" aria-controls="example1" data-dt-idx="2" tabindex="0">2</a>
                            //    </li>
                            //    <li class="paginate_button ">
                            //        <a href="#" aria-controls="example1" data-dt-idx="3" tabindex="0">3</a>
                            //    </li>
                            //    <li class="paginate_button ">
                            //        <a href="#" aria-controls="example1" data-dt-idx="4" tabindex="0">4</a>
                            //    </li>
                            //    <li class="paginate_button ">
                            //        <a href="#" aria-controls="example1" data-dt-idx="5" tabindex="0">5</a>
                            //    </li>
                            //    <li class="paginate_button ">
                            //        <a href="#" aria-controls="example1" data-dt-idx="6" tabindex="0">6</a>
                            //    </li>
                            //    <li class="paginate_button next" id="example1_next">
                            //        <a href="#" aria-controls="example1" data-dt-idx="7" tabindex="0">Next</a>
                            //    </li>
                            //</ul>
                        //</div>
                    result+=`</div>
                </div>
            </div>
        </div>
        <!-- /.box-body -->
    </div>`;
    return result;
}
function checkLevel(level){
    switch (level) {
        case 0 :
            return 'Dễ';
            break;
        case 1 :
            return 'Bình thường';
            break;
        case 2 :
            return 'Khó';
            break;
        default:
            return '';
    }

}
function chooseQuestion(question_id){
    //alert($('#checkbox-'+question_id).prop('checked'));
   if ( $('#checkbox-'+question_id).prop('checked') == true ) {
        questionListTemp.map(function (_ques) {
            if (_ques.id == question_id){
                questionChose.push(_ques);
            }
        })

   }else{
       var index = -1 ;
       for (var i = 0 ; i < questionChose.length ; i++){
           if (questionChose[i] == question_id){
               index = i ;
           }
       }
       delete questionChose[index];
   }
    $('#countChose').text(questionChose.length);
    //console.log(JSON.stringify(questionChose,2,2));
}
function addQuestionToSection(sectionId){
    $('#list-questions').modal('hide');
    if ( questionChose.length > 0 ){
        content.map(function (_con) {
            //console.log(_con);
            if (_con.section_id == questionChose[0].section_id){
                questionChose.map(function (_quesChose) {
                    _con.questions.push(_quesChose.id);
                    addQuestionView(_quesChose);
                })
            }
        })
    }
}
function addQuestionView(ques){
    var contentDiv = '';
    contentDiv+='<tr class="placeholder" id="tr-view-'+ques.section_id+'">';
    contentDiv+='<td>';
    contentDiv+=ques.title;
    contentDiv+='</td>';
    contentDiv+='<td>';
    contentDiv+= ques.question_type == 0 ? 'Trắc nghiệm' : 'Tự Luận' ;
    contentDiv+='</td>';
    contentDiv+='<td>';
    contentDiv+= checkLevel(ques.level);
    contentDiv+='</td>';
    contentDiv+='<td>';
    contentDiv+=ques.require == 0 ? 'Câu hỏi đơn' : 'Nhóm câu hỏi';
    contentDiv+='</td>';
    contentDiv+='<td>';
    contentDiv+='<a style="color: red;" href="#" onclick="removeQuestion(\''+ques.section_id+'\')"><i class="fa fa-fw fa-remove"></i></a>';
    contentDiv+='</td>';
    contentDiv+='</tr>';
    $('#section-tbody-'+ques.section_id).append(contentDiv);

}

function getQuestionOfSectionArray(sectionId){
    var result = [];
    if(content.length > 0){
        content.map(function (_con) {
            if (_con.section_id == sectionId){
                result = _con.questions;
            }
        })
    }
    console.log(result);
    return result;
}