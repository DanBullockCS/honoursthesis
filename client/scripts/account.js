// Hiding and showing pastebox or upload file input
$(function() {
    $('#paste-or-excel').change(function(){
      if($('#excel-input').css('display') == 'none') {
        $('#paste-input').hide();
        $('#excel-input').show();
      } else {
        $('#excel-input').hide();
        $('#paste-input').show();
      }
    });
  });
  
  // Check that a classname was entered
  $(function() {
    $('#enter_class_name').keyup(function() {
        if (this.value) {
            $('#create-class-button').removeAttr("disabled");
        } else {
            $('#create-class-button').prop("disabled", "true");
        }
    });
  });