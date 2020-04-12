var selectedClass, gradesAsNums, headerNames, studentList, selectedStudentsGrades, classAvgs;
var showClassAvgs = false;

// Preprocessing data
$(document).ready(function () {
    $('#users-classes').change(function () {
        selectedClass = $("#users-classes option:selected").text();
        $('#sheetsClassName').text(selectedClass);

        $.ajax({
            url: "/reloadPerformance",
            method: "POST",
            data: {
                courseName: selectedClass
            },
            success: (data) => {
                studentList = data.studentList;
                gradesList = data.gradesList;

                // Turn the grades into integers
                let grades = gradesList.splice(1, gradesList.length);
                gradesAsNums = grades.map(function (index) {
                    let temp = [];
                    for (let i = 0; i < index.length; i++) { temp.push(parseInt(index[i])); }
                    return temp;
                });

                // Save the headerNames from the list
                headerNames = gradesList[0];

                // Populate the student select tag and display it
                $('#students-select').empty();
                $('#students-select').append($(`<option class="disabled selected value" style="display: none;"> -- select a student -- </option>`));
                $.each(studentList, function (i, p) {
                    $('#students-select').append($(`<option id="${i}"></option>`).val(p).html(p));
                });
                $("#students-select-div").css("display", "block");
            }
        });
    });

    $('#students-select').change(function () {
        selectedStudentsGrades = [];
        classAvgs = [];
        let selectedStudentIndex = $(this).children(":selected").attr("id");
        // Finding the selected students grades
        for (let i = 0; i < gradesAsNums.length; i++) {
            selectedStudentsGrades.push(gradesAsNums[i][selectedStudentIndex]);
        }
        // Finding the average of each grade column
        for (let i = 0; i < gradesAsNums.length; i++) {
            let temp = 0;
            for (let j = 0; j < gradesAsNums[0].length; j++) {
                temp += gradesAsNums[i][j];
            }
            classAvgs.push(temp / gradesAsNums[0].length);
        }

        plot();
    });

    // saveSvgAsPng plugin from https://github.com/exupero/saveSvgAsPng
    $("#download-chart").click(function () {
        selectedClass = $("#users-classes option:selected").text();
        fileName = selectedClass + "_" + $("#students-select option:selected").text() + ".png";
        saveSvgAsPng(document.getElementsByTagName("svg")[0], fileName, { backgroundColor: "#FFFFFF" });
    });

    // Checkbox code checked code
    $('#classAvgCheckbox').click(function () {
        $("#txtClassAvg").toggleClass("checked");
    });
    $("#classAvgCheckbox").change(function () {
        if ($("#txtClassAvg").hasClass("checked")) {
            showClassAvgs = true;
        } else {
            showClassAvgs = false;
        }
        plot();
    });
});

// D3 Code
function plot() {
    var margin = { top: 100, right: 100, bottom: 100, left: 100 }
        , width = window.innerWidth/2 - margin.left - margin.right    // Use the window's width 
        , height = window.innerHeight/2 - margin.top - margin.bottom; // Use the window's height
    var offset = 25;

    // Data preparation
    data = [];
    for (let i = 0; i < headerNames.length; i++) {
        tempDict = {};
        tempDict["GradeColumns"] = headerNames[i];
        tempDict["studentGrades"] = selectedStudentsGrades[i];
        tempDict["ClassAverage"] = classAvgs[i];
        data.push(tempDict);
    }

    const svg = d3.selectAll("#chart").html("")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scaleBand()
        .domain(headerNames)
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    const xaxis = d3.axisBottom().scale(xScale);
    const yaxis = d3.axisLeft().scale(yScale);

    // Define the lines
    var valueline = d3.line()
        .x(function (d) { return xScale(d.GradeColumns) + margin.top/2 + 20 })
        .y(function (d) { return yScale(d.studentGrades); })
        .curve(d3.curveMonotoneX);   // Line smoothing
    
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis);
    svg.append("g")
        .attr("class", "axis")
        .call(yaxis);

    // Add the Selected students path.
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    svg.selectAll(".dot2")
        .data(data)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dotStudent") // Assign a class for styling
        .attr("cx", function (d) { return xScale(d.GradeColumns) + margin.top/2 + 20; })
        .attr("cy", function (d) { return yScale(d.studentGrades); })
        .attr("r", 5);

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + offset*2)
        .text("Grade Type");
    // Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + offset)
        .attr("x", -margin.top + 100)
        .text("Percentage Grade");

    // If checkbox to show class average
    if (showClassAvgs) {
        var valueline2 = d3.line()
            .x(function (d) { return xScale(d.GradeColumns) + margin.top/2 + 20; })
            .y(function (d) { return yScale(d.ClassAverage); })
            .curve(d3.curveMonotoneX);

        // Add the Class Average path.
        svg.append("path")
            .data([data])
            .attr("class", "line")
            .style("stroke", "#E75D2A")
            .attr("d", valueline2);

        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dotClass") // Assign a class for styling
            .attr("cx", function (d) { return xScale(d.GradeColumns) + margin.top/2 + 20; })
            .attr("cy", function (d) { return yScale(d.ClassAverage); })
            .attr("r", 5);
    }
}