$(document).ready(function() {
    var selectedPresentation;

    // Changing the url of the button based on checkbox
    $("#pdfCheckbox").change (function() {
        let _href = $("#openSlidesBtn").attr("href");
        if ($(this).is(':checked')) {
            $("#openSlidesBtn").attr("href", _href + "?print-pdf");
        } else {
            $("#openSlidesBtn").attr("href", "presentation?name=" + selectedPresentation);
        }
    });
    
    // Remove the disabled property when the file is uploaded
    $("#uploadBtn").change(function() {
        $('#download-reveal-btn').prop('disabled', false);
        $('#download-reveal-btn').removeClass("disabled");
    });

    // After file is uploaded, clear from the input
    $('#download-reveal-btn').click(function() {
        $("#uploadBtn").val("");
        $('#download-reveal-btn').prop('disabled', true);
        $('#download-reveal-btn').addClass("disabled");
    });
    
    $("#presentations").change(function() {
        selectedPresentation = $(this).children("option:selected").val();
        $("#openSlidesBtn").attr("href", "presentation?name=" + selectedPresentation);
    });

    
});