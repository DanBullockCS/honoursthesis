$(document).ready(function () {
    var selectedPresentation;

    // Changing the url of the button based on checkbox
    $("#pdfCheckbox").change(function () {
        let _href = $("#openSlidesBtn").attr("href");
        if ($(this).is(':checked')) {
            $("#openSlidesBtn").attr("href", _href + "&?print-pdf");
        } else {
            $("#openSlidesBtn").attr("href", "presentation?name=" + selectedPresentation);
        }
    });

    // Remove the disabled property when the file is uploaded
    $("#uploadBtn").change(function () {
        $('#download-reveal-btn').prop('disabled', false);
        $('#download-reveal-btn').removeClass("disabled");
    });

    // After file is uploaded, clear from the input
    $('#download-reveal-btn').click(function () {
        let tempFileName = document.getElementById("uploadBtn").files[0].name; 
        $("#uploadBtn").val(""); // Clear the uploaded slides from the upload button
        $('#download-reveal-btn').prop('disabled', true);
        $('#download-reveal-btn').addClass("disabled");

        // Activate open slides button with the uploaded files name
        $("#openSlidesBtn").prop('disabled', false);
        $('#openSlidesBtn').removeClass("disabled");
        $("#openSlidesBtn").attr("href", "presentation?name=" + tempFileName);
    });

    // Save the selected presentation and activate the open slides button
    $("#presentations").change(function () {
        // Uncheck the open as pdf format checkbox
        $("#pdfCheckbox").prop('checked', false);
        
        // Activate open slides button
        $("#openSlidesBtn").prop('disabled', false);
        $('#openSlidesBtn').removeClass("disabled");
        
        selectedPresentation = $(this).children("option:selected").val();
        $("#openSlidesBtn").attr("href", "presentation?name=" + selectedPresentation);

        // Toggle delete button
        if (selectedPresentation) {
            $("#delete-slides").prop('disabled', false);
            $('#delete-slides').removeClass("disabled");
        } else {
            $("#delete-slides").prop('disabled', true);
            $('#delete-slides').addClass("disabled");
        }
        
    });
});

function deleteSlides() {
    selectedPresentation = $("#presentations").children("option:selected").val();
    // Remove option tag of slides
    $("#presentations option:contains(" + selectedPresentation + ")").remove();

    // Send selected presentation to the backend to delete
    $.ajax({
        url: "/deleteSlides",
        method: "POST",
        data: {
            selectedPresentation: selectedPresentation,
        }
    });
}