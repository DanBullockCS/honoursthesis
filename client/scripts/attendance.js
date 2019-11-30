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

  
  $("#users-classes").change(function() {
    $('#attendance-sheet').css('display', 'block'); // show attendance sheet on change

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

function setAttendance(id) {
  let attendance = id.substr(0, 4); // pres, abse, or late 
  let idNum = id.substr(4);         // Get the id number of the three buttons
  
  if (attendance == "pres") {
    $("#pres"+idNum).addClass('btn-warning');
    $("#pres"+idNum).removeClass('btn-secondary');
    $("#abse"+idNum).addClass('btn-secondary');
    $("#late"+idNum).addClass('btn-secondary');
    $('#abse'+idNum).removeClass('btn-warning');
    $('#late'+idNum).removeClass('btn-warning');
  } else if (attendance == "abse") {
    $("#abse"+idNum).addClass('btn-warning');
    $("#abse"+idNum).removeClass('btn-secondary');
    $("#pres"+idNum).addClass('btn-secondary');
    $("#late"+idNum).addClass('btn-secondary');
    $('#pres'+idNum).removeClass('btn-warning');
    $('#late'+idNum).removeClass('btn-warning');
  } else if (attendance == "late") {
    $("#late"+idNum).addClass('btn-warning');
    $("#late"+idNum).removeClass('btn-secondary');
    $("#abse"+idNum).addClass('btn-secondary');
    $("#pres"+idNum).addClass('btn-secondary');
    $('#pres'+idNum).removeClass('btn-warning');
    $('#abse'+idNum).removeClass('btn-warning');
  }
}