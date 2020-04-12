// Client side js for my classes page
var selectedClass;

// Load student List
$(document).ready(function() {
  var ul = $('#student-names-display');

  // Autofocussing the addstudent inputbox (Modal code)
  $('#addStu-modal').on('shown.bs.modal', function () {
    $('#newStudentName').focus();

    // Event listen for making add button disabled until input is filled
    var empty = true;
    $('#add-student-btn').click(function() {
      $('#confirm-add-student-btn').attr('disabled', 'disabled');
    });

    $("#newStudentName").keyup( function(event) {
      if ($(this).val() != "") {
        empty = false;
      } else {
        empty = true;
      }

      if (empty) {
        $('#confirm-add-student-btn').attr('disabled', 'disabled');
      } else {
        $('#confirm-add-student-btn').removeAttr('disabled');
      }

      // Event listener for hitting space on add new student modal
      if (event.keyCode === 13 && !empty) { // Enter key
        event.preventDefault();   // Cancel the default action, if needed
        $("#confirm-add-student-btn").click();
      }
    });
  });

  // Buttons are by default disabled since there are no selected classes
  $("#delete-class-btn").prop("disabled", true);
  $("#add-student-btn").prop("disabled", true);

  if ( ($('#disabled-option').css("display", "none")) ) {
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
            .html("&times;")
            .attr("id", "span"+i)
            .click(function() {deleteStudent(span);});
        });
      }
    });
  });
});

// Deleting a class
function deleteClass() {
  var ul = $('#student-names-display');
  ul.empty(); // Clear student list
  // Delete the class from the dropdown
  $('option').each(function() {
    if ( $(this).val() == selectedClass ) {
       $(this).remove();
    }
  });

  $.ajax({
    url: "/deleteClass",
    method: "POST",
    data: { courseName: selectedClass }
  });
}

// Deleting a student via the x button
function deleteStudent(span) {
  let idToRemove = span.attr("id");
  $('#'+idToRemove).parent().remove();  // delete the item from list
  idToRemove = idToRemove.substring(4); // get rid of the "span" on id

  $.ajax({
    url: "/deleteStudent",
    method: "POST",
    data: {
      courseName: selectedClass,
      sIndex: idToRemove,
    }
  });
}

// Adding a student to the list
function addStudent() {
  var ul = $('#student-names-display');
  var lastStudentID;
  let newStudentName = $("#newStudentName").val();
  $("#newStudentName").val("");

  // Find Last Students id so the added on can have that +1
  $("span.closeLI").each(function() {
    lastStudentID = parseInt($(this).attr("id"));
  });

  var li = $('<li/>')
    .addClass('list-group-item')
    .appendTo(ul)
    .text(newStudentName);
  var span = $('<span/>')
    .addClass('closeLI')
    .appendTo(li)
    .html("&times;")
    .attr("id", lastStudentID+1)
    .click(function() {deleteStudent(span);});

  $.ajax({
    url: "/addingStudent",
    method: "POST",
    data: {
      courseName: selectedClass,
      newStudentName: newStudentName
    }
  });
}
