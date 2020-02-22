$(document).ready(function() {
    // Changing the url of the button based on checkbox
    $("#pdfCheckbox").change (function() {
        if ($(this).is(':checked')) {
            $("#openSlidesBtn").attr("href", "presentation/?print-pdf");
        } else {
            $("#openSlidesBtn").attr("href", "presentation");
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
});