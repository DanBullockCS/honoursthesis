$(document).ready(function() {

  $("#users-classes").change(function() {
    $('#attendance-sheet').css('display', 'block'); // show attenance sheet on change

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
