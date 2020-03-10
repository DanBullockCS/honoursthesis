// Note: classes are called "courses" on the backend

// JS libraries
let express = require('express');
let app = express();
let session = require('express-session');
let bodyParser = require('body-parser');
let uuid = require('uuid/v1');
let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');

// Set the root directory to client folder to find images etc
app.use(express.static(__dirname + '/client'));

// Database config
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/classroomcompanion', {
   useUnifiedTopology: true,
   useNewUrlParser: true
},
   function (error) {
      if (error) {
         return console.error('Unable to connect:', error);
      }
   });
mongoose.set('useCreateIndex', true);

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
   limit: '100mb', // Limiting for uploading pptx slides
   extended: true,
}));

// Configure Pug templating
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// Configure sessions
app.use(session({
   genid: function (request) {
      return uuid();
   },
   resave: false,
   saveUninitialized: false,
   secret: 'ssbu discord equator amdradeonr9'
}));

// Database Schemas
let Schema = mongoose.Schema;
let userSchema = new Schema({
   username: {
      type: String,
      unique: true,
      index: true
   },
   email: String,
   hashedPassword: String,
}, {
   collection: 'users'
});

let courseSchema = new Schema({
   ownerName: String,
   courseName: {
      type: String,
      unique: true,
      index: true
   },
   studentList: [],
   dateList: [],
   gradeCategories: [],
   grades: [[]],
   attendanceList: [[]],
}, {
   collection: 'courses'
});

let presentationSchema = new Schema({
   ownerName: String,
   fileName: {
      type: String,
      unique: true,
      index: true,
   },
   fileContent: String,
}, {
   collection: 'presentations'
});

let User = mongoose.model('user', userSchema);
let Course = mongoose.model('course', courseSchema);
let Presentation = mongoose.model('presentation', presentationSchema);

/**************** Routes ****************/
app.get('/', function (request, response) {
   username = request.session.username;
   response.render('index', {
      title: 'Home',
      description: 'Welcome to Classroom Companion! The website is currently under construction.',
      username: username
   });
});

app.get('/login', function (request, response) {
   response.render('login', {
      title: 'Login Page',
      errorMessage: ''
   });
});

app.post('/processLogin', function (request, response) {
   username = request.body.username;
   password = request.body.password;

   User.find({ username: username }).then(function (results) {
      if (results.length != 1) {
         // Error logging in - no such user
         response.render('login', {
            username: "", // Make sure the navbar doesn't show logged in features
            errorMessage: 'Login Incorrect'
         });
      } else {
         // User was found, now check the password
         console.log('login password:', results[0].hashedPassword);
         if (bcrypt.compareSync(password, results[0].hashedPassword)) {
            // Password match - successful login
            request.session.username = username;
            response.render('loginConfirm', {
               username: username,
               title: 'Login Success'
            });
         } else {
            console.log('login: password is not a match');
            // Error logging in - invalid password
            response.render('login', {
               errorMessage: 'Login Incorrect'
            });
         }
      }
   }).catch(function (error) {
      // Error logging in - no such user
      console.log('login: catch');
      response.render('login', {
         errorMessage: 'Login Incorrect'
      });
   });
});

app.get('/register', function (request, response) {
   response.render('register', {
      title: 'Register',
   });
});

app.post('/processRegistration', function (request, response) {
   username = request.body.username;
   email = request.body.email;
   password = request.body.pwd;

   hashedPassword = bcrypt.hashSync(password);
   console.log('register password:', hashedPassword);

   newUser = new User({
      username: username,
      email: email,
      hashedPassword: hashedPassword
   });

   newUser.save(function (error) {
      if (error) {
         response.render('register',
            { errorMessage: 'Invalid registration data' });
      } else {
         request.session.username = username; // Logged in
         response.render('registerConfirm', {
            username: username,
            title: 'Welcome to ClassroomCompanion!'
         });
      }
   });
});

/**************** MyCourses page ****************/
app.get('/myclasses', function (request, response) {
   // User not logged in redirect them
   if (!request.session.username) { response.redirect("/"); }

   Course.find({ ownerName: request.session.username }).then(function (results) {
      var courseNames = [];
      for (i = 0; i < results.length; i++) {
         courseNames.push(results[i].courseName);
      }

      response.render('courses', {
         title: 'My Classes',
         courseName: courseNames,
      });
   }).catch(function (error) {
      // error finding courses or you haven't created any
      console.log('catch: User does not have any courses and is loading course page');
      response.render('courses', {
         errorMessage: 'Error: no courses created! Create a course on the account settings page;'
      });
   });
});

app.post('/reloadStudentList', function (request, response) {
   var cName = request.body.courseName;
   Course.find({ courseName: cName }).then(function (results) {
      var sList = results[0].studentList;
      // Pass studentList back to front end
      response.json({ studentList: sList });
   }).catch(function (error) {
      // Error finding courses or you haven't created any
      console.log('catch: User does not have any courses and is loading course page');
      response.render('courses', {
         errorMessage: 'Error: no courses created! Create a course on the account settings page;'
      });
   });
});

app.post('/deleteClass', function (request, response) {
   var cName = request.body.courseName;
   Course.deleteOne({ courseName: cName }, function (error) {
      if (error) {
         console.log("Error deleting class!");
      } else {
         console.log(cName, " was deleted");
      }
   });
});

app.post('/deleteStudent', async function (request, response) {
   var cName = request.body.courseName;
   var sIndex = request.body.sIndex;

   const doc = await Course.findOne({ courseName: cName });
   doc.studentList.splice(sIndex, 1); // deleting student at index sIndex
   await doc.save();
});

app.post('/addingStudent', async function (request, response) {
   var cName = request.body.courseName;
   var newStudentName = request.body.newStudentName;

   const doc = await Course.findOne({ courseName: cName });
   doc.studentList.push(newStudentName); // adding student
   await doc.save();
});
/************************************************/

/**************** Account Page ****************/
app.get('/account', function (request, response) {
   // User not logged in redirect them
   if (!request.session.username) { response.redirect("/"); }

   User.find({ username: username }).then(function (results) {
      username = results[0].username;
      email = results[0].email;

      response.render('account', {
         title: 'Account Settings',
         username: username,
         email: email,
      });
   });
});

app.post('/createClass', function (request, response) {
   ownername = request.session.username;
   course_name = request.body.enter_class_name;
   student_list = request.body.enter_student_names.split("\n");

   newCourse = new Course({
      ownerName: ownername,
      courseName: course_name,
      studentList: student_list,
   });

   newCourse.save(function (error) {
      if (error) {
         response.render('account', {
            errorMessage: "That Class already exists!",
            title: 'Account Settings',
            username: username,
            email: email,
         });
      } else {
         response.render('account', {
            errorMessage: "Class Created!",
            title: 'Account Settings',
            username: username,
            email: email,
         });
      }
   });
});
/************************************************/

/**************** Attendance Page ****************/
app.get('/attendance', function (request, response) {
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

app.post('/reloadAttendanceSheet', function (request, response) {
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

app.post('/addingNewAttendanceSheet', async function (request, response) {
   let cName = request.body.courseName;
   let dateEntered = request.body.dateEntered;

   const doc = await Course.findOne({ courseName: cName });
   doc.dateList.push(dateEntered); // adding the entered date
   await doc.save();
});

app.post('/deleteSheet', async function (request, response) {
   let sClass = request.body.selectedClass;
   let sDate = request.body.sheetDate;

   const doc = await Course.findOne({ courseName: sClass });
   doc.dateList.splice(doc.dateList.indexOf(sDate), 1);
   await doc.save();
});

app.post('/saveSheet', async function (request, response) {
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

/************************************************/

/**************** GroupMaker Page ****************/
app.get('/groupMaker', function (request, response) {
   // User not logged in redirect them
   if (!request.session.username) { response.redirect("/"); }

   response.render('groupMaker', {
      title: 'Group Maker'
   });
});

/************************************************/

/**************** Whiteboard Page ****************/
app.get('/whiteboard', function (request, response) {
   // User not logged in redirect them
   if (!request.session.username) { response.redirect("/"); }

   Presentation.find({ ownerName: username }).then(function (results) {
      if (results.length === 0) {
         response.render('whiteboard', {
            title: 'Whiteboard Slides',
            presentationNames: [],
         });
      } else {
         var presentationNames = [];
         for (i = 0; i < results.length; i++) {
            presentationNames.push(results[i].fileName);
         }
         response.render('whiteboard', {
            title: 'Whiteboard Slides',
            presentationNames: presentationNames,
         });
      }
   });

});

// Uploading a new slideshow
app.post('/uploadWhiteboard', async function (request, response) {
   var slides = request.body.html;
   var fname = request.body.fileName;

   // Saving the uploaded presentation
   newPres = new Presentation({
      ownerName: username,
      fileName: fname,
      fileContent: slides,
   });
   newPres.save(function (error) {
      // Loading all the users presentations
      Presentation.find({ ownerName: username }).then(function (results) {
         var presentationNames = [];
         for (i = 0; i < results.length; i++) {
            presentationNames.push(results[i].fileName);
         }
         if (error) {
            response.json({
               errorMessage: 'Could not create presentation, file name already exists in your presentations',
               presentationNames: presentationNames,
            });
         } else {
            response.json({
               presentationNames: presentationNames,
            });
         }
      });
   });
});

/***************************************************/

/**************** Presentation Page ****************/
app.get('/presentation', function (request, response) {
   // User not logged in redirect them
   if (!request.session.username) { response.redirect("/"); }
   var fileName = request.query.name;

   Presentation.findOne({ ownerName: username, fileName: fileName }).then(function (results) {
      response.render('presentation', {
         title: 'Your Presentation',
         fileContent: results.fileContent,
      });
   });

});

/************************************************/

/**************** Presentation Page ****************/
app.get('/performancetracker', function (request, response) {
   // User not logged in redirect them
   if (!request.session.username) { response.redirect("/"); }

   response.render('performance', {
      title: 'Student Performance Tracker',
   });

});
/************************************************/

/**************** Logout Page ****************/
app.get('/logout', function (request, response) {
   request.session.username = '';
   response.redirect('/');
});
/************************************************/

// Web listener
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function () {
   console.log('ClassroomCompanion Server listening on port ' + app.get('port'));
});
