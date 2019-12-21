$(document).ready(function() {
  var dateEntered;

  // New Attendance Sheet button 
  $("#enter-attend-date").change(function() {
    var input = this.value;
    dateEntered = new Date(input);
    $('#new-sheet-btn').removeClass("disabled");
    if (dateEntered == 'Invalid Date') {
      $('#new-sheet-btn').addClass("disabled");
    }
    $('#current-date').text(dateEntered.toString().substr(0, 16));  
  });

  
  // show attendance sheet if they are making a new one
  $('#new-sheet-btn').click(function() {
    // Show the attendance sheet
    $('#attendance-sheet').css('display', 'block');

    
  });

  // show attendance sheet if they are editing an old one
  $('#previous-sheets').change(function() {
    $('#attendance-sheet').css('display', 'block');
  });

  $("#users-classes").change(function() {
    $('#previous-sheets-div').css('display', 'block');
    $('#enter-date-div').css('display', 'block');

    $.ajax({
      url: "/reloadAttendanceSheet",
      method: "POST",
      data: {

      },
      success: (data) => {
          
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
    $("#pres"+idNum).addClass('btn-success');
    $("#pres"+idNum).removeClass('btn-outline-secondary');
    $("#abse"+idNum).addClass('btn-outline-secondary');
    $("#late"+idNum).addClass('btn-outline-secondary');
    $('#abse'+idNum).removeClass('btn-danger');
    $('#late'+idNum).removeClass('btn-warning');
  } else if (attendance == "abse") {
    $("#abse"+idNum).addClass('btn-danger');
    $("#abse"+idNum).removeClass('btn-outline-secondary');
    $("#pres"+idNum).addClass('btn-outline-secondary');
    $("#late"+idNum).addClass('btn-outline-secondary');
    $('#pres'+idNum).removeClass('btn-success');
    $('#late'+idNum).removeClass('btn-warning');
  } else if (attendance == "late") {
    $("#late"+idNum).addClass('btn-warning');
    $("#late"+idNum).removeClass('btn-outline-secondary');
    $("#abse"+idNum).addClass('btn-outline-secondary');
    $("#pres"+idNum).addClass('btn-outline-secondary');
    $('#pres'+idNum).removeClass('btn-success');
    $('#abse'+idNum).removeClass('btn-danger');
  }
}