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
   extended: false
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
   // cookie: {secure: true},
   secret: 'apollo slackware prepositional expectations'
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
   courseName: String,
   studentList: [],
   dateList: [],
   attendanceList: [],
}, {
   collection: 'courses'
});

let User = mongoose.model('user', userSchema);
let Course = mongoose.model('course', courseSchema);

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
         console.log('login: no user found');
         // Error logging in - no such user
         response.render('login', {
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
      title: 'Register'
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
         response.render('account',
            { errorMessage: '' });
      } else {
         response.render('account', {
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
      // Pass studentList back to front end
      response.json({
         studentList: sList,
         dateList: dList,
         attendanceList: aList,
      });
   });
});

app.post('/addingNewAttendanceSheet', async function (request, response) {
   var cName = request.body.courseName;
   var dateEntered = request.body.dateEntered;

   const doc = await Course.findOne({ courseName: cName });
   doc.dateList.push(dateEntered); // adding the entered date
   await doc.save();
});
/************************************************/

app.get('/groupMaker', function (request, response) {
   // User not logged in redirect them
   if (!request.session.username) { response.redirect("/"); }

   response.render('groupMaker', {
      title: 'Group Maker'
   });
});

app.get('/logout', function (request, response) {
   request.session.username = '';
   response.redirect('/');
});

// Web listener
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function () {
   console.log('ClassroomCompanion Server listening on port ' + app.get('port'));
});
