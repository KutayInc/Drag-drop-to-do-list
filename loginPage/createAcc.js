Parse.initialize(
  "tlptR5EO96el5zQ9H9VFNaiv00rm2emcw1iFajjB",
  "Ek6IpmwnApwNtNf73F5VAD5YMv0oSXDgSuCk3J2G"
);
Parse.serverURL = "https://parseapi.back4app.com/";

const validateEmailRegex = /^\S+@\S+\.\S+$/;

async function createParseUser(username, email, password) {
  // Creates a new Parse "User" object, which is created by default in your Parse app
  let user = new Parse.User();
  user.set("username", username);
  user.set("email", email);
  user.set("password", password);
  try {
    // Call the save method, which returns the saved object if successful
    user = await user.save();
    if (user !== null) {
      // Notify the success by getting the attributes from the "User" object, by using the get method (the id attribute needs to be accessed directly, though)
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `New Account created. Welcome ${user.get("username")}`,
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
  }
}

document.getElementById("signUp").addEventListener("click", async function () {
  var username = document.getElementById("username").value;
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  if (!validateEmailRegex.test(email)) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Invalid Email",
    });
    return;
  }
  if (username.length >= 3 && password.length >= 3) {
    createParseUser(username, email, password);
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Something went wrong!",
    });
  }
});
