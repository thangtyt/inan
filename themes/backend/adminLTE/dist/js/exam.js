/**
 * Created by thangnv on 11/19/16.
 */
let content = [];

let sectionDiv = `


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
                                                       <span class="pull-left">Number of questions : </span><span class="pull-right" id='secTotalQues'></span>
                                                        <span class="pull-right">Total time : </span><span class="pull-left" id='secTotalTime'></span>
                                                    </div>
                                                    <!-- /.box-footer-->
                                                </div>


`;



function loadSections(){
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
                addSection(ele);
                addElement(ele.id);
            })
        }
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
    }).done(function(questions){
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

        if( _content ){
            _content.map(function (con) {
                if (con.section_id == element.id){
                    con.questions.map(function (ques) {
                        _question.push(ques);
                    })

                }
            });

            $('#question-'+element.id).select2('val',_question);

            _question.map(function (ques) {
                addElement(element.id,ques);
            })
        };
        //$("div.sortable").sortable();
        //sort.sortable({
        //    placeholder: "ui-sortable-placeholder",
        //    cancel: ".sort-box-title",
        //    stop: function (event, ui) {
        //        data = sort.sortable('serialize', {expression: /(.+)[-](.+)/});
        //    }
        //});
        //sort.disableSelection();
    });

}
function removeSection(element){
    $('#'+element.id).remove();
}
function addElement(section_id,question_id){
    if(question_id == null){
        content.push({
            section_id: section_id,
            questions: []
        })
    }else{
        content.map(function (con) {
            if(con.section_id == section_id){
                con.questions.push(question_id);
            }
        });
    }
}
function removeElement(section_id,question_id){
    if(question_id == null){
        if( content.length > 0 ){
            for(var i = 0 ; i < content.length ; i++){
                if(content[i].section_id == section_id){
                    content.splice(i,1);
                }
            }
        }
    }else{
        //console.log('question_id != null');
        if( content.length > 0 ){
            for(var i = 0 ; i < content.length ; i++){
                if(content[i].section_id == section_id){
                    content[i].questions = content[i].questions.filter(function (_question) {
                        if(_question !== question_id){
                            return _question;
                        }
                    })
                }
            }
        }
    }
}