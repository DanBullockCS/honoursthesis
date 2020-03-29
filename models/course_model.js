// Mongoose Course
let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let courseSchema = new Schema({
    ownerName: String,
    courseName: {
       type: String,
       unique: true,
       index: true
    },
    studentList: [],
    dateList: [],
    gradesList: [],
    attendanceList: [[]],
 }, {
    collection: 'courses'
 });

 let Course = mongoose.model('course', courseSchema);

 module.exports = Course;