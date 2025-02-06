// sign-up
const apiUrl = "http://localhost:3000";
const SignUpUser = async (event) => {
     event.preventDefault();
     const inputs = Array.from(document.querySelectorAll('form input'));
     const obj = {
          "reg-no": inputs[0].value,
          "full-name": inputs[1].value,
          "mnnit-mail-id": inputs[2].value,
          "password": inputs[4].value,
     };
     const res = await fetch(`${apiUrl}/signup-user`, {
          method: "POST",
          headers:  {'Content-Type': 'application/json'},
          body: JSON.stringify(obj),
     })
     sessionStorage.setItem("profile", JSON.stringify(obj));
     console.log(res.json());
}
// document.querySelector('input[type="submit"]').addEventListener('click', SignUpUser);

// log-in
const LogInUser = async (event) => {
     event.preventDefault();
     const inputs = Array.from(document.querySelectorAll('form input'));
     const credentials = {};
     credentials['password'] = inputs[1].value;
     if (isNaN(inputs[0].value)){
          credentials['identifier'] = inputs[0].value;
     } else {
          credentials['identifier'] = Number(inputs[0].value);
     }
     const res = await fetch(`${apiUrl}/login-user`, {
          method: "POST",
          headers:  {'Content-Type': 'application/json'},
          body: JSON.stringify(credentials),
     })
     console.log(res.status);
}
document.querySelector('input[type="submit"]').addEventListener('click', LogInUser);
