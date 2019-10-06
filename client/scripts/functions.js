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
    document.getElementById('email_format').innerText = "Inproper email format\n(e.g. Leonard@ClassroomCompanion.ca)";
  }
}
