var tbody, studentList, gradesList, gradeCategories, firstTD;

$(document).ready(function () {
    tbody = $("#sheet-body");

    // D3 Code for later:
    var margin = { top: 50, right: 50, bottom: 50, left: 50 }
        , width = window.innerWidth - margin.left - margin.right    // Use the window's width 
        , height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

    // Number of datapoints
    var n = 21;

    var xScale = d3.scaleLinear()
        .domain([0, n - 1])
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);

    var line = d3.line()
        .x(function (d, i) { return xScale(i); })
        .y(function (d) { return yScale(d.y); })
        .curve(d3.curveMonotoneX);

    // An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
    var dataset = d3.range(n).map(function (d) { return { "y": d3.randomUniform(1)() } });

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    svg.append("path")
        .datum(dataset)
        .attr("class", "line")
        .attr("d", line);

    svg.selectAll(".dot")
        .data(dataset)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", function (d, i) { return xScale(i) })
        .attr("cy", function (d) { return yScale(d.y) })
        .attr("r", 5);

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
                gradeCategories = data.gradeCategories;

                buildGradeSheet();
            }
        });
    });
});

// Build the grade sheet
function buildGradeSheet() {
    // Clear body before generating elements
    tbody.empty();

    // Build the buttons and student names
    for (i = 0; i < studentList.length; i++) {
        if (i == 0) { // Just so the first td element has the firstTD id
            var tr = $([
                "<tr>",
                " <th>",
                studentList[i],
                " </th>",
                " <td contenteditable='true' id='firstTD'>",
                "87",
                " </td>",
                " <td contenteditable='true'>",
                "86",
                " </td>",
                "</tr>"
            ].join("\n"));
            tbody.append(tr);
        } else {
            var tr = $([
                "<tr>",
                " <th>",
                studentList[i],
                " </th>",
                " <td contenteditable='true'>",
                "95",
                " </td>",
                " <td contenteditable='true'>",
                "78",
                " </td>",
                "</tr>"
            ].join("\n"));
            tbody.append(tr);
        }
    }

    // Highlight the first TD element in the list
    firstTD = document.getElementById('firstTD');
    firstTD.focus();
    firstTD.style.backgroundColor = '#5CB85C';
    firstTD.style.color = 'white';

}

// Arrowkey code to move around a selected element
function dotheneedful(sibling) {
    if (sibling != null) {
        firstTD.focus();
        firstTD.style.backgroundColor = '';
        firstTD.style.color = '';
        sibling.focus();
        sibling.style.backgroundColor = '#5CB85C';
        sibling.style.color = 'white';
        firstTD = sibling;
    }
}

document.onkeydown = checkKey;

function checkKey(e) {
    e = e || window.event;
    if (e.keyCode == '38') {
        // Up arrow
        var index = firstTD.cellIndex;
        var nextrow = firstTD.parentElement.previousElementSibling;
        if (nextrow != null) {
            var sibling = nextrow.cells[index];
            dotheneedful(sibling);
        }
    } else if (e.keyCode == '40') {
        // Down arrow
        var index = firstTD.cellIndex;
        var nextrow = firstTD.parentElement.nextElementSibling;
        if (nextrow != null) {
            var sibling = nextrow.cells[index];
            dotheneedful(sibling);
        }
    } else if (e.keyCode == '37') {
        // Left arrow
        var sibling = firstTD.previousElementSibling;
        if (sibling.isContentEditable) {
            dotheneedful(sibling);
        }
    } else if (e.keyCode == '39') {
        // Right arrow
        var sibling = firstTD.nextElementSibling;
        dotheneedful(sibling);
    }
}
