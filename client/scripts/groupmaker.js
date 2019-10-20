// Make sure number inputs are numbers
var number = document.getElementsByClassName('number-input');
number.onkeydown = function(e) {
    if(!((e.keyCode > 95 && e.keyCode < 106)
      || (e.keyCode > 47 && e.keyCode < 58)
      || e.keyCode == 8)) {
        return false;
    }
}

// Put array of student into groups
function putIntoGroups(arr, size) {
  let results = [];
  while (arr.length) {
    results.push(arr.splice(0, size))
  }
  return results;
}

// Shuffle the groups
function reshuffle() {
  var studentArr = document.getElementById("student-list").value.split("\n");
  var groupSize = document.getElementById("group-size").value;

  // Delete any unintended newline or whitespace entrys
  for (let i = 0; i < studentArr.length; i++) {
    if (!studentArr[i].trim()) {
      studentArr.splice(i);
    }
  }

  // Shuffle around the student array randomly
  studentArr.sort(function() { return 0.5 - Math.random() });

  // Put array into groupNum groups
  studentArr = putIntoGroups(studentArr, groupSize);

  var numberOfGroups = studentArr.length;

  var table = document.getElementById("group-table");
  table.innerHTML = ""; // clear table initially

  // Put array into table
  for (let i = 0; i < numberOfGroups; i++) {
    // Add rows with group labels
    var row = table.insertRow(i);
    var titleCell = row.insertCell(0);
    titleCell.innerHTML = "<b>Group " + (i+1) + ":</b>";
    // Add group of students
    for (let j = 0; j < studentArr[0].length; j++) {
      var groupCell = row.insertCell(j+1);
      groupCell.innerText = studentArr[i][j];
      // If groups do not distribute evenly, it returns undefined, delete that undefined
      if(groupCell.innerText == "undefined") {
        groupCell.innerText = "";
      }
    }
  }
}

// Empty list of students
function clearList() {
  document.getElementById("student-list").value = "";
}
