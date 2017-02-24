/**
 * Created by thangnv on 11/19/16.
 */
var content = [];
var dataMarkCount = [];
var sectionDiv = `
            <div class="box box-info collapsed-box " id="$id$">
                <div class="box-header with-border ui-state-default">
                    <h3 class="box-title">$section-title$</h3>
                    <div class="box-tools pull-right">
                        <button type="button" class="btn btn-box-tool" data-widget="collapse" data-toggle="tooltip" title="" data-original-title="Collapse">
                            <i class="fa fa-plus"></i></button>
                    </div>
                </div>
                <div class="box-body" style="display: none;">
                   <div class="form-group">
                                <label>Question</label>
                                <div class="form-group">
                                    <select multiple="multiple" id="question-$id$" style="width: 100%" class="form-control"></select>
                                </div>
                            </div>


                </div>
                <!-- /.box-body -->
                <div class="box-footer" style="display: none;">
                   <span class="pull-left">
                        Number of questions : <span style="color:blue" id='secTotalQues_$id$'>0</span> ( Bao gồm các câu hỏi thuộc nhóm câu hỏi nếu chọn nhóm câu hỏi )
                    </span>
                    <span class="pull-right">
                        Total mark : <span style="color:blue" id='secTotalMark_$id$'>0</span>
                </div>
                <!-- /.box-footer-->
            </div>
`;



function loadSections(){
    //console.log('loadSections');
    var selectValue = [];
    var subjectId = $('select[name="subject_id"]').val();
    $.ajax({
        url: '/admin/exam/list-section/'+subjectId,
        type: 'GET'
    }).done(function(results){
        if(!results) results =[];
        select2Sections.append(new Option('--Choose Subject--'));
        select2Sections.empty();
        results.map(function (section) {
            if(_sections.length > 0 && $.inArray(section.id,_sections) != -1){
                selectValue.push({
                    id: section.id,
                    text: section.title
                })
            }
            var opt = new Option(section.title,section.id);
            select2Sections.append(opt);
        });
        if(_sections.length > 0){
            select2Sections.select2('destroy');
            select2Sections.select2();
            //console.log(JSON.parse(_sections));
            select2Sections.select2('val',_sections);
            //select2Sections.val(_sections).trigger('change');
            selectValue.map(function (ele) {
                addElement(ele.id,null);
            })
            selectValue.map(function (ele) {
                addSection(ele);
            })
        }
    });
}
function addSection(element) {

    var contentDiv = sectionDiv.replace(/\$id\$/g,element.id);
    contentDiv = contentDiv.replace(/\$section-title\$/g,element.text);
    $('#sortable').append(contentDiv);
    $.ajax({
        url: '/admin/exam/list-question/'+element.id,
        type: 'GET'
    }).done(function(questions){
        //console.log('addSection',JSON.stringify(questions,2,2));
        if(!questions) questions =[];
        $('#question-'+element.id).select2();
        //console.log(JSON.stringify(questions,3,3));
        questions.map(function (question) {
            //console.log(question);
            var opt = new Option(question.title,question.id);
            $('#question-'+element.id).append(opt);
        });
        $('#question-'+element.id).on('select2:select', function (e) {
            addElement(element.id,e.params.data.id)

        });
        $('#question-'+element.id).on('select2:unselect', function (e) {
            removeElement(element.id,e.params.data.id);
        });

        //for update exam
        var _question = [];
        if( _content.length > 0 ){
            _content.map(function (con) {
                if (con.section_id == element.id){
                    con.questions.map(function (ques) {
                        _question.push(ques);
                        addElement(element.id,ques,true);
                    })

                }
            });
            $('#question-'+element.id).select2('val',_question);
        };
        loadMarkEdit();
    });

}
function removeSection(element){
    //console.log('removeSection');
    var index = 0;
    for (var i = 0 ; i < content.length ; i++){
        if (content[i].section_id == element.id){
            index = i;
            var _secTotalQues = $('#secTotalQues_'+content[i].section_id).text();
            var _secTotalMark = $('#secTotalMark_'+content[i].section_id).text();
            var _total_mark = $('#total_mark').val();
            var _total_question = $('#total_question').val();
            $('#total_mark').val(Number(_total_mark) - Number(_secTotalMark));
            $('#total_question').val(Number(_total_question) - Number(_secTotalQues));
        }
    }
    content.splice(index,1);
    $('#'+element.id).remove();
}
function addElement(section_id,question_id,isUpdate){
    //console.log('addElement',section_id,question_id);

    if(question_id == null){
        content.push({
            section_id: section_id,
            questions: []
        })
    }else if(isUpdate) {
        content.map(function (con) {
            if(con.section_id == section_id){
                con['questions'].push(question_id);
            }
        });
    }else{
        //console.log(33333);
        content.map(function (con) {
            if(con.section_id == section_id){
                con['questions'].push(question_id);
                countMark(section_id,question_id,true);
            }
        });
    }
}
function removeElement(section_id,question_id){
    //console.log(222222);
    if(question_id == null){
        if( content.length > 0 ){
            for(var i = 0 ; i < content.length ; i++){
                if(content[i].section_id == section_id){
                    content.splice(i,1);
                }
            }
        }
    }else{
        if( content.length > 0 ){
            for(var i = 0 ; i < content.length ; i++){
                if(content[i].section_id == section_id){
                    content[i].questions = content[i].questions.filter(function (_question) {
                        if(_question !== question_id){
                            return _question;
                        }
                    })
                }
            };
            countMark(section_id,question_id,false);
        }
    }
}
function countMark(sec_id,ques_id,isAdd){
    $.ajax({
        url: '/admin/qa/question-mark/'+ques_id,
        type: 'GET',
        async: false
    }).done(function  (result) {
            result = JSON.parse(JSON.stringify(result));
        //console.log($('#secTotalQues_' + sec_id).text());
            var _countQuestionSection = Number($('#secTotalQues_'+sec_id).text());
            var _markSection = Number($('#secTotalMark_'+sec_id).text());
            var _total_mark = Number($('#total_mark').val());
            var _total_question = Number($('#total_question').val());
            if (isAdd){
                _countQuestionSection = _countQuestionSection + Number(result.count);
                _markSection = _markSection + Number(result.mark);
                _total_mark = _total_mark + Number(result.mark);
                _total_question = _total_question + Number(result.count);
            }else{
                _countQuestionSection = _countQuestionSection - Number(result.count);
                _markSection = _markSection - Number(result.mark);
                _total_mark = _total_mark - Number(result.mark);
                _total_question = _total_question - Number(result.count);
            }

            $('#secTotalQues_'+sec_id).text(_countQuestionSection.toString());
            $('#secTotalMark_'+sec_id).text(_markSection.toFixed(1).toString());

            $('#total_mark').val(_total_mark.toFixed(1));
            $('#total_question').val(_total_question);
        //console.log($('#secTotalQues_' + sec_id).text());
        });

}
function getInfoMarkCount(){
    if (_content.length > 0){
        //call ajax
        $.ajax({
            url: '/admin/exam/data-mark-count/',
            type: 'POST',
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify(_content)
        }).done(function(result){
            dataMarkCount = result;
        });

    }
}
function loadMarkEdit(){
    //console.log(222222);
    if (_content.length > 0){
        _content.map(function (_con) {

            var countQues = 0;
            var markOfSec = 0;
            _con['questions'].map(function (_ques_id) {
                dataMarkCount.map(function (_val) {
                    if (_val.question_id == _ques_id){
                        markOfSec += Number(_val.mark);
                        countQues++;
                    }
                })
            });
            $('#secTotalQues_'+_con.section_id).text(countQues.toString());
            $('#secTotalMark_'+_con.section_id).text(markOfSec.toFixed(1).toString());
        });
    }
}