var tbody, studentList, gradesList, selectedClass;

$(document).ready(function () {
    // declare the tbody
    tbody = $("#sheet-body");

    // arrow-table plugin from https://github.com/garygreen/arrow-table
    $('#grades-table').arrowTable({
        enabledKeys: ['left', 'right', 'up', 'down'],
        listenTarget: 'input',
        focusTarget: 'input'
    });

    // Show the grades sheet
    $('#users-classes').change(function () {
        $('#grades-sheet').css('display', 'block');
        selectedClass = $("#users-classes option:selected").text();
        $('#sheetsClassName').text(selectedClass);

        $.ajax({
            url: "/reloadGradeSheet",
            method: "POST",
            data: {
                courseName: selectedClass
            },
            success: (data) => {
                studentList = data.studentList;
                gradesList = data.gradesList;

                buildGradeSheet();
            }
        });
    });

    // Add new column button
    $('#add-grade-col-btn').click(function () {
        let gradeColName = $('#newGradeColumnName').val();
        $('#gradeTypesRow').append(`<th class='thead-dark'>${gradeColName}</th>`);
        $("tr").not(".isHeader").append("<td><input class='form-control'></td>");
    });
    // Delete column button
    $('#del-grade-col-btn').click(function () {
        if ($("tr input").length != 0) {
            $("tbody tr th:last-child").remove();
            $("tbody tr td:last-child").remove();
        }
    });
    // Autofocussing the add column inputbox (Modal code)
    $('#add-column-modal').on('shown.bs.modal', function () {
        $('#newGradeColumnName').val('');
        $('#newGradeColumnName').focus();
    });

});

// Build the grade sheet
function buildGradeSheet() {
    // Clear body before generating elements
    tbody.empty();

    // Name and grades tr
    let tr = $([
        "<tr class='thead-dark isHeader' id='gradeTypesRow'>",
        "<th>",
        "Student Names",
        " </th>",
        "</tr>"
    ].join("\n"));

    // no grades exist yet
    if (gradesList.length == 0) {
        tbody.append(tr);
        // Build the cells and student names
        for (let i = 0; i < studentList.length; i++) {
            let nextTr = $([
                "<tr>",
                " <td>",
                studentList[i],
                " </td>",
                "</tr>"
            ].join("\n"));
            tbody.append(nextTr);
        }
    } else {
        // there are already grades in the system
        for (let i = 0; i < gradesList[0].length; i++) {
            let headers = $([
                "<th>",
                gradesList[0][i],
                " </th>",
                "</tr>"
            ].join("\n"));
            tr.append(headers);
            tbody.append(tr);
        }
        for (i = 0; i < studentList.length; i++) {
            let tr = $([
                "<tr>",
                " <td>",
                studentList[i],
                " </td>",
                "</tr>"
            ].join("\n"));
            for (let j = 1; j < gradesList.length; j++) {
                tr.append(`<td><input class='form-control' value=${gradesList[j][i]}></td>`);
            }
            tbody.append(tr);
        }
    }

    // Focus the first grade
    $("#firstInput").focus();
}

// Save the sheet to the backend
function saveSheet() {
    // Make sure the user has clicked a button for each student
    $("#saved-sheet-message").html("Grade sheet has been saved");

    // Get Header names (Grade types)
    var gradesList = [[]];
    let firstIndex = 0;
    $("#grades-table > tbody > tr").each(function () {
        $(this).closest('tr').find('th').each(function (i) {
            firstIndex++;
            if (firstIndex != 1) { // Don't push the "Student Names TH"
                gradesList[0].push($(this).text());
            }
        });
    });
    
    var numCols = gradesList[0].length; // Used for the number of columns the grade sheet has
    for (let i = 0; i < numCols; i++) {
        gradesList.push([]);
    }

    // Get Actual grades
    var tempGradesList = [];
    var isSheetComplete = true;
    $("#grades-table input").each(function () {
        $(this).removeClass("bg-danger");
        $(this).removeClass("text-white");

        if ($(this).val() === "") {
            // No grade entered; so highlight cell in red
            $(this).addClass("bg-danger");
            $(this).addClass("text-white");
            isSheetComplete = false;
        } else {
            tempGradesList.push($(this).val());
        }
    });

    // Put those grades into the gradeList
    for (let i = 0; i < tempGradesList.length; i++) {
        for (let j = 1; j < gradesList.length; j++) {
            if (i % numCols-j+1 == 0) {
                gradesList[j].push(tempGradesList[i]);
            }
        }
    }
    // If there are no empty mark cells in the sheet, send to backend
    if (isSheetComplete) {
        // Cannot send list over without stringifying it
        var jsonText = JSON.stringify({ gradesList });

        //Send that to the backend
        $.ajax({
            url: "/saveGradeSheet",
            method: "POST",
            data: {
                courseName: selectedClass,
                studentGrades: jsonText,
            }
        });
    }
}

// Clear all the input elements on the page (and highlight their bg for 500ms)
function clearSheet() {
    $("td input").val("");
    $("td input").addClass("bg-warning").delay(500).queue(function(){
        $(this).removeClass("bg-warning").dequeue();
    });
}