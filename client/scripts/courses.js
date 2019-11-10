// Load student List
$(document).ready(function() {
  var ul = $('#student-names-display');

  $.ajax({
    url: "/reloadStudentList",
    method: "POST",
    data: {
      class: "class 1"
    },
    success: (data, status) => {
      if (data.courseNames.length != 0) {
        $("#users-classes").change(function() {
          var selectedClass = $(this).children("option:selected").val();
          var index;
          ul.empty(); // Clear student list

          // Find index with that selected class
          for (i = 0; i < data.courseNames.length; i++) {
            if (selectedClass == data.courseNames[i]) { index = i; }
          }
          //
          $.each(data.studentList[index], function(i) {
            var li = $('<li/>')
              .addClass('list-group-item')
              .appendTo(ul)
              .text(data.studentList[index][i]);
          });
        });
      } else {
        $("#classes-display").hide();
        $("#no-class-display").css("display", "block");
      }
    }
  })
});
