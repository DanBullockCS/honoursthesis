var selectedClass, selectedSheet, studentList, attendanceList, tbody;

$(document).ready(function () {
  var dateEntered, dateList;
  tbody = $("#sheet-body");

  // New Attendance Sheet button 
  $("#enter-attend-date").change(function () {
    let input = this.value;
    dateEntered = new Date(input.replace(/-/g, '\/')); // Had to replace '-' with '/' due to date format issues
    dateEntered = dateEntered.toString().substr(0, 16);
    $('#new-sheet-btn').removeClass("disabled");
    if (dateEntered == 'Invalid Date') {
      $('#new-sheet-btn').addClass("disabled");
    }
  });

  // Show attendance sheet if they are making a new one
  $('#new-sheet-btn').click(function () {
    // Add date to the datelist in the backend if it already doesn't exist
    if (!$('#previous-sheets option:contains(' + dateEntered + ')').length) {
      // Show the attendance sheet
      $('#attendance-sheet').css('display', 'block');
      // Scroll to the attendance sheet
      $([document.documentElement, document.body]).animate({ scrollTop: $("#attendance-sheet").offset().top }, 750);
      
      // Clear Date Input
      $("#enter-attend-date").val("");
      
      // Set all the buttons to grey on default
      $('button').each(function() {
        if ((this.id.substr(0, 4) == "pres" ||
            this.id.substr(0, 4) == "abse" || 
            this.id.substr(0, 4) == "late")&&
            !this.classList.contains("btn-outline-secondary")) {
          $(this).removeClass("btn-success");
          $(this).removeClass("btn-danger");
          $(this).removeClass("btn-warning");
          $(this).addClass('btn-outline-secondary');
        }
      });

      // Sends that new date to the backend
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
        .appendTo(select)
        .attr('selected', 'true')
        .text(dateEntered.toString().substr(0, 16));
        // Set the date in the attendance sheet
        selectedSheet = optionDate.text();
        $('#current-date').text(selectedSheet);

    // Show modal saying: "There is already a sheet for that date"
    } else {
      $('#error-existing-sheet-modal').modal('show');
    }

  });

  // Show attendance sheet if they are editing an old one
  $('#previous-sheets').change(function () {
    buildAttendanceSheet();
    $('#attendance-sheet').css('display', 'block');
    // Scroll to the attendance sheet
    $([document.documentElement, document.body]).animate({ scrollTop: $("#attendance-sheet").offset().top }, 750);
    selectedSheet = $("#previous-sheets option:selected").text();
    $('#current-date').text(selectedSheet);
  });

  $("#users-classes").change(function () {
    $('#attendance-sheet').css('display', 'none');
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
        courseName: selectedClass
      },
      success: (data) => {
        attendanceList = data.attendanceList;
        studentList = data.studentList;
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

// Build the attendance sheet with student names and Present/Absent/Late buttons
function buildAttendanceSheet() {
  // Clear body before generating elements
  tbody.empty(); 

  // Build the buttons and student names
  for (i = 0; i < studentList.length; i++) {  
    var tr = $([
      "<tr>",
      " <td>",
        studentList[i],
      " </td>",
      " <td>",
      "   <button id='pres"+ i + "' class='btn btn-outline-secondary' onclick='setAttendance(this.id)'> Present",
      " </td>",
      " <td>",
      "   <button id='abse"+ i + "' class='btn btn-outline-secondary' onclick='setAttendance(this.id)'> Absent",
      " </td>",
      " <td>",
      "   <button id='late"+ i + "' class='btn btn-outline-secondary' onclick='setAttendance(this.id)'> Late",
      " </td>",
      "</tr>"
    ].join("\n"));
    tbody.append(tr);
  }

  // Load previous attendances for the sheet
  $.ajax({
    url: "/reloadAttendanceSheet",
    method: "POST",
    data: {
      courseName: selectedClass
    },
    success: (data) => {
      attendanceList = data.attendanceList;
    
      // Load in the buttons that are selected
      let dateIndex = $("select[name='previous-sheets'] option:selected").index() - 1 // -1 because this index starts at 1
      let numRows = studentList.length;
      
      for (i = 0; i < numRows; i++) {
        if (attendanceList[dateIndex][i] == 0) {
          $("#pres" + i).removeClass("btn-outline-secondary");
          $("#pres" + i).addClass("btn-success");
        } else if (attendanceList[dateIndex][i] == 1) {
          $("#abse" + i).removeClass("btn-outline-secondary");
          $("#abse" + i).addClass("btn-danger");
        } else if (attendanceList[dateIndex][i] == 2) {
          $("#late" + i).removeClass("btn-outline-secondary");
          $("#late" + i).addClass("btn-warning");
        }
      }
    }
  });
  
}

function saveSheet() {
  // Check which buttons have been selected:

  // Get all the buttons that are selected for each row
  var buttonList = [];
  $('button').each(function() {
    if ((this.id.substr(0, 4) == "pres" ||
        this.id.substr(0, 4) == "abse" || 
        this.id.substr(0, 4) == "late")&&
        !this.classList.contains("btn-outline-secondary")) {
      buttonList.push(this);
    }
  });

  // Make sure the user has clicked a button for each student
  if (buttonList.length < studentList.length) {
    $("#saved-sheet-message").html("One or more students is missing their attendance!");
  } else {
    $("#saved-sheet-message").html("Attendance sheet has been saved");
    // Take every button that is selected and put in a list of 0s, 1s, &/or 2s
    // 0 - present, 1 - absent, 2 - late
    var aList = [];
    for (i = 0; i < buttonList.length; i++) {
      if (buttonList[i].id.substr(0, 1) == "p") {
        aList.push(0);
      } else if (buttonList[i].id.substr(0, 1) == "a") {
        aList.push(1);
      } else if (buttonList[i].id.substr(0, 1) == "l") {
        aList.push(2);
      }
    }

    // cannot send list over without stringifying it
    var jsonText = JSON.stringify({ aList });

    // Send that to the backend
    $.ajax({
      url: "/saveSheet",
      method: "POST",
      data: {
        courseName: selectedClass,
        sheetAttendances: jsonText,
        sheetDate: selectedSheet,
      }
    });
  }
  
}

// Set delete message in modal
function showDeleteSheetMessage() {
  let classname = $("#sheetsClassName").text();
  let date = $("#current-date").text();
  $("#delete-sheet-message").html("Are you sure you want to delete the attendance sheet for <strong>" +
   classname + "</strong> on <strong>" + 
   date +'</strong>');
}

function deleteSheet() {
  // Clear table body (sheet)
  tbody.empty(); 
  $('#attendance-sheet').css('display', 'none');

  // Remove option tag of date
  $("#previous-sheets option:contains(" + selectedSheet + ")").remove();

  // Send Class and Date to the backend to delete
  $.ajax({
    url: "/deleteSheet",
    method: "POST",
    data: {
      selectedClass: selectedClass,
      sheetDate: selectedSheet,
    }
  });
}

// Sets Attendance buttons to present, absent, or late when clicked
function setAttendance(id) {
  let attendance = id.substr(0, 4); // present, absent, or late 
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