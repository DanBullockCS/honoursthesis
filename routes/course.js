// Contains Course Related Routes
const express = require('express');
const router = express.Router();

let Course = require('../models/course_model.js');

/**************** Attendance Page ****************/
router.get('/attendance', function (request, response) {
    // User not logged in redirect them
    if (!request.session.username) { response.redirect("/"); }
 
    Course.find({ ownerName: request.session.username }).then(function (results) {
       var courseNames = [];
       for (i = 0; i < results.length; i++) {
          courseNames.push(results[i].courseName);
       }
 
       response.render('attendance', {
          title: 'Attendance Tracker',
          courseName: courseNames,
       });
    });
 });
 
 router.post('/reloadAttendanceSheet', function (request, response) {
    var cName = request.body.courseName;
    Course.find({ courseName: cName }).then(function (results) {
       var sList = results[0].studentList;
       var dList = results[0].dateList;
       var aList = results[0].attendanceList;
       // Pass lists back to the front end
       response.json({
          studentList: sList,
          dateList: dList,
          attendanceList: aList,
       });
    });
 });
 
 router.post('/addingNewAttendanceSheet', async function (request, response) {
    let cName = request.body.courseName;
    let dateEntered = request.body.dateEntered;
 
    const doc = await Course.findOne({ courseName: cName });
    doc.dateList.push(dateEntered); // adding the entered date
    await doc.save();
 });
 
 router.post('/deleteSheet', async function (request, response) {
    let sClass = request.body.selectedClass;
    let sDate = request.body.sheetDate;
 
    const doc = await Course.findOne({ courseName: sClass });
    doc.dateList.splice(doc.dateList.indexOf(sDate), 1);
    await doc.save();
 });
 
 router.post('/saveSheet', async function (request, response) {
    let sClass = request.body.courseName;
    let sDate = request.body.sheetDate;
    let sAttendances = JSON.parse(request.body.sheetAttendances);
 
    const doc = await Course.findOne({ courseName: sClass });
    // Find the index of the selectedDate
    let index = 0;
    for (let i = 0; i < doc.dateList.length; i++) {
       if (doc.dateList[i] == sDate) { index = i; }
    }
 
    // Use that dates index to replace the default attendance in the attendance list
    for (let i = 0; i < sAttendances.aList.length; i++) {
       doc.attendanceList.splice(index, 1, sAttendances.aList);
    }
    await doc.save();
 });

 
/*********** Grades Page ***********/
router.get('/grades', function (request, response) {
    // User not logged in redirect them
    if (!request.session.username) { response.redirect("/"); }
 
    Course.find({ ownerName: request.session.username }).then(function (results) {
       var courseNames = [];
       for (i = 0; i < results.length; i++) {
          courseNames.push(results[i].courseName);
       }
 
       response.render('grades', {
          title: 'Grade Tracker',
          courseNames: courseNames,
       });
    });
 
 });
 
 router.post('/reloadGradeSheet', function (request, response) {
    var cName = request.body.courseName;
    Course.find({ courseName: cName }).then(function (results) {
       var sList = results[0].studentList;
       var gList = results[0].gradesList;
       // Pass lists back to the front end
       response.json({
          studentList: sList,
          gradesList: gList,
       });
    });
 });
 
 router.post('/saveGradeSheet', async function (request, response) {
    let sClass = request.body.courseName;
    let sGrades = JSON.parse(request.body.studentGrades);
 
    try {
       const doc = await Course.findOne({ courseName: sClass });
       doc.gradesList = sGrades.gradesList;
       await doc.save();
    } catch (err) {
       console.log(err.stack);
    }
 });

 /*********** Performance Tracker Page ***********/
 router.get('/performance', function (request, response) {
    // User not logged in redirect them
    if (!request.session.username) { response.redirect("/"); }
 
    Course.find({ ownerName: request.session.username }).then(function (results) {
       var courseNames = [];
       for (i = 0; i < results.length; i++) {
          courseNames.push(results[i].courseName);
       }
 
       response.render('performance', {
          title: 'Student Performance Tracker',
          courseNames: courseNames,
       });
    });
 
 });
 
 router.post('/reloadPerformance', function (request, response) {
    var cName = request.body.courseName;
    Course.find({ courseName: cName }).then(function (results) {
       var sList = results[0].studentList;
       var gList = results[0].gradesList;
       // Pass lists back to the front end
       response.json({
          studentList: sList,
          gradesList: gList,
       });
    });
 });
 /************************************************/

 module.exports = router;