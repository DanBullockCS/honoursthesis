// Check if password matches confirm password in register
var check = function() {
  if(document.getElementById('pwd').value == document.getElementById('confirm_pwd').value) {
    document.getElementById('confirm_pwd').classList.remove("is-invalid");
    document.getElementById('register_btn').disabled = false;
    document.getElementById('pwd_match').innerText = "";
  } else {
    document.getElementById('confirm_pwd').classList.add("is-invalid");
    document.getElementById('register_btn').disabled = true;
    document.getElementById('pwd_match').innerText = "Passwords do not match";
  }
}

// Check that the email inputted is valid
function validateEmail(input) {
  var mail_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(input.value.match(mail_regex)) {
    document.register_form.email.classList.remove("is-invalid");
    document.getElementById('email_format').innerText = "";
  } else {
    document.register_form.email.classList.add("is-invalid");
    document.getElementById('email_format').innerText = "Inproper email format, please double check your email";
  }
}

// Check that the username doesn't exist in the Database
function validateUsername(input) {
  let usernames = [];
  for (let i = 0; i < usernames.length; i++) {
     if (usernames[i] === input.value) {
        document.register_form.username.classList.add("is-invalid");
        document.getElementById('username_valid').innerText = "Username already exists";
        return true;
     }
  }
  document.register_form.username.classList.remove("is-invalid");
  document.getElementById('username_valid').innerText = "";
  return false;
}

// Hiding and showing pastebox or upload file input (Account settings page)
$(function() {
  $('#paste-or-excel').change(function(){
    if($('#excel-input').css('display') == 'none') {
      $('#paste-input').hide();
      $('#excel-input').show();
    } else {
      $('#excel-input').hide();
      $('#paste-input').show();
    }
  });
});
