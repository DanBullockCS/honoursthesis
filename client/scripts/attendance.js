$(document).ready(function () {
  var dateEntered, selectedClass, dateList;

  // New Attendance Sheet button 
  $("#enter-attend-date").change(function () {
    let input = this.value;
    dateEntered = new Date(input.replace(/-/g, '\/')); // Had to replace - with / due to date format issues
    dateEntered = dateEntered.toString().substr(0, 16);
    $('#new-sheet-btn').removeClass("disabled");
    if (dateEntered == 'Invalid Date') {
      $('#new-sheet-btn').addClass("disabled");
    }
    $('#current-date').text(dateEntered);
  });


  // Show attendance sheet if they are making a new one
  $('#new-sheet-btn').click(function () {
    // Show the attendance sheet
    $('#attendance-sheet').css('display', 'block');
    // Scroll to the attendance sheet
    $([document.documentElement, document.body]).animate({ scrollTop: $("#attendance-sheet").offset().top }, 750);
    // Add date to the datelist in the backend
    $.ajax({
      url: "/addingNewAttendanceSheet",
      method: "POST",
      data: {
        "courseName": selectedClass,
        "dateEntered": dateEntered
      }
    });
    // Add the date to the select list
    var select = $('#previous-sheets');
    var optionDate = $('<option/>')
      .addClass('value')
      .appendTo(select)
      .text(dateEntered.toString().substr(0, 16));
  });

  // Show attendance sheet if they are editing an old one
  $('#previous-sheets').change(function () {
    $('#attendance-sheet').css('display', 'block');
    // Scroll to the attendance sheet
    $([document.documentElement, document.body]).animate({ scrollTop: $("#attendance-sheet").offset().top }, 750);


  });

  $("#users-classes").change(function () {
    selectedClass = $(this).children("option:selected").val();
    $('#sheetsClassName').text(selectedClass);
    // Clear the dates from the other classes and add the "select an attendance sheet" prompt
    $('#previous-sheets').children().remove().end()
      .append('<option class="disabled selected value" style="display: none;"> -- select an attendance sheet -- </option>');
    
    $('#previous-sheets-div').css('display', 'block');
    $('#enter-date-div').css('display', 'block');

    $.ajax({
      url: "/reloadAttendanceSheet",
      method: "POST",
      data: {
        "courseName": selectedClass
      },
      success: (data) => {
        //data.studentList use to populate the table
        //data.attendanceList use to populate the table
        dateList = data.dateList;
        var select = $('#previous-sheets');
        $.each(data.dateList, function (i) {
          var optionDate = $('<option/>')
            .addClass('value')
            .appendTo(select)
            .text(data.dateList[i]);
        });
      }
    });
  });

});

function buildAttendanceSheet() {

}


function setAttendance(id) {
  let attendance = id.substr(0, 4); // pres, abse, or late 
  let idNum = id.substr(4);         // Get the id number of the three buttons

  if (attendance == "pres") {
    $("#pres" + idNum).addClass('btn-success');
    $("#pres" + idNum).removeClass('btn-outline-secondary');
    $("#abse" + idNum).addClass('btn-outline-secondary');
    $("#late" + idNum).addClass('btn-outline-secondary');
    $('#abse' + idNum).removeClass('btn-danger');
    $('#late' + idNum).removeClass('btn-warning');
  } else if (attendance == "abse") {
    $("#abse" + idNum).addClass('btn-danger');
    $("#abse" + idNum).removeClass('btn-outline-secondary');
    $("#pres" + idNum).addClass('btn-outline-secondary');
    $("#late" + idNum).addClass('btn-outline-secondary');
    $('#pres' + idNum).removeClass('btn-success');
    $('#late' + idNum).removeClass('btn-warning');
  } else if (attendance == "late") {
    $("#late" + idNum).addClass('btn-warning');
    $("#late" + idNum).removeClass('btn-outline-secondary');
    $("#abse" + idNum).addClass('btn-outline-secondary');
    $("#pres" + idNum).addClass('btn-outline-secondary');
    $('#pres' + idNum).removeClass('btn-success');
    $('#abse' + idNum).removeClass('btn-danger');
  }
}