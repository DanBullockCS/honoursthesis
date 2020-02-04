$(document).ready(function() {
    // Changing the url of the button based on checkbox
    $("#pdfCheckbox").change (function() {
        if ($(this).is(':checked')) {
            $("#openSlidesBtn").attr("href", "presentation/?print-pdf");
        } else {
            $("#openSlidesBtn").attr("href", "presentation");
        }
    }); 
});