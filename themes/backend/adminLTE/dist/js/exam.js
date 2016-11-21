/**
 * Created by thangnv on 11/19/16.
 */
let content = [];

let sectionDiv = `
                <div class="box box-info collapsed-box" id="$id$">
                    <div class="box-header with-border">
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
                </div>`;

function loadSections(){
    var subjectId = $('select[name="subject_id"]').val();
    $.ajax({
        url: '/admin/examination/exam/list-section/'+subjectId,
        type: 'GET'
    }).done(function(results){
        if(!results) results =[];
        select2Sections.append(new Option('--Choose Subject--'));
        select2Sections.empty();
        results.map(function (section) {
            var opt = new Option(section.title,section.id);

            select2Sections.append(opt);
            //select2Sections.trigger('change');
        });

    });
}
function addSection(element) {
    var content = sectionDiv.replace(/\$id\$/g,element.id);
    content = content.replace(/\$section-title\$/g,element.text);
    $('#examDetail').append(content);
    $.ajax({
        url: '/admin/examination/exam/list-question/'+element.id,
        type: 'GET'
    }).done(function(questions){
        if(!questions) questions =[];
        $('#question-'+element.id).select2({
            templateSelection: function (option) {
                var text = $(option.element).text().trim();
                text = text.replace(/^[—]+/, '');
                return text;
            }
        });
        //console.log(JSON.stringify(questions,3,3));
        questions.map(function (question) {
            var opt = new Option(question.title,question.id);
            $('#question-'+element.id).append(opt);
        });
        $('#question-'+element.id).on('select2:select', function (e) {
            addElement(element.id,e.params.data.id)

        });
        $('#question-'+element.id).on('select2:unselect', function (e) {
            removeElement(element.id,e.params.data.id);
        });
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
        for(var i = 0 ; i < content.length ; i++){
            if(content[i].section_id == section_id){
                content[i].questions.push(question_id);
            }
        }
    }
    //console.log(JSON.stringify(content,2,2));
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
        if( content.length > 0 ){
            for(var i = 0 ; i < content.length ; i++){
                if(content[i].section_id == section_id){
                    for(var j = 0 ; j < content[i].questions.length ; j++){
                        content[i].questions[j].slice(j,1);
                    }
                }
            }
        }
    }
    //console.log(JSON.stringify(content,2,2));
}
//<div class="form-group">
//<div class="col-xs-12 table-responsive">
//<table class="table table-bordered table-hover dataTable">
//<thead style="background-color: #d2d6de">
//<th width="5%">
//    ?
//</th>
//<th>
//Answer Key
//</th>
//<th width="10%">
//#
//</th>
//</thead>
//<tbody id="answerList">
//
//</tbody>
//</table>
//</div>
//</div>