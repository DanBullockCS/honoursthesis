var selectedClass;
var ul = $('#student-names-display');

// Load student List
$(document).ready(function() {
  // Buttons are by default disabled since there are no selected classes
  $("#delete-class-btn").prop("disabled", true);
  $("#add-student-btn").prop("disabled", true);

  if (($('#disabled-option').css("display", "none"))) {
    ul.empty();
  } else {
    // The user has no classes
    $("#classes-display").hide();
    $("#no-class-display").css("display", "block");
  }

  // Class is selected:
  $("#users-classes").change(function() {
    // Enable the delete/add buttons
    $("#delete-class-btn").prop("disabled", false);
    $("#add-student-btn").prop("disabled", false);

    selectedClass = $(this).children("option:selected").val();
    $.ajax({
      url: "/reloadStudentList",
      method: "POST",
      data: {
        "courseName": selectedClass
      },
      success: (data) => {
        ul.empty(); // Clear student list
        // Add students to the list
        $.each(data.studentList, function(i) {
          var li = $('<li/>')
            .addClass('list-group-item')
            .appendTo(ul)
            .text(data.studentList[i]);
          var span = $('<span/>')
            .addClass('closeLI')
            .appendTo(li)
            .html("&times;");
          });
      }
    });
  });
});
// Deleting a class
function deleteClass() {
  // TODO
}

// Deleting a student via the x button
function deleteStudent() {
  // TODO
}

// Adding a student to the list
function addStudent() {
  // TODO
}
