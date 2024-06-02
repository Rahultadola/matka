import { setLogin } from './app.js'



export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

const csrftoken = getCookie('csrftoken');

export const loginHandler = () => {
  let buttonClickCount = 0;
  const container = document.querySelector(".container");
  const loginBlock = document.getElementById('login');
  const registerBlock = document.getElementById('register');
  
  registerBlock.style.display = "none";
  loginBlock.style.display = "block";

  const form = document.getElementById('login-form');  
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    
    
    if (buttonClickCount === 0) {
      buttonClickCount = buttonClickCount + 1      
      const submitBtn = document.getElementById('lg-submit');
      submitBtn.setAttribute('disabled', true);

  
      fetch(
        `http://127.0.0.1:8000/login/`, 
        {
          method: "POST",
          body: JSON.stringify({
            mobile: document.getElementById('mobile').value,
            pass: document.getElementById('pass').value
          }),
          headers: {
            "Content-type": "application/x-www-form-urlencoded",
            'X-CSRFToken': csrftoken
          },
          mode: 'same-origin'
        }).then((res) => res.json()).then((response) => {
          if (response.user){
            setLogin(true, response);
          }

          if (response.error) {
            container.innerHTML = response.error
          }
        }).catch((err) => {
          alert('Login failed! retry.')
          window.location.href = ''
        })
      container.innerHTML = "Loading resources...";
    }
  });  
};


export const initRegisterPage = (setlogin) => {
  const container = document.querySelector(".container");
  const loginBlock = document.getElementById('login');
  const registerBlock = document.getElementById('register');

  let buttonClickCount = 0;
  loginBlock.style.display = "none";
  registerBlock.style.display = "block";

  const form = document.getElementById('register-form')
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (buttonClickCount == 0) {
      buttonClickCount = buttonClickCount + 1
      const mob = document.getElementById('register-mobile');
      const username = document.getElementById('register-username');
      const pass = document.getElementById('register-pass');
      const user_mobile = mob.value;
      const user_name = username.value;
      const user_pass = pass.value;
      mob.value = ''
      pass.value = ''
      username.value = ''
      const submitBtn = document.getElementById('rg-submit');
      submitBtn.setAttribute('disabled', true);

      const reQ = new Request(`http://127.0.0.1:8000/register/`, {
          method: "POST",
          body: JSON.stringify({
            mobile: user_mobile,
            username: user_name,
            pass: user_pass
          }),
          headers: {
            "Content-type": "application/x-www-form-urlencoded",//application/json; charset=UTF-8
            'X-CSRFToken': csrftoken
          },
          mode: 'same-origin'
        })

      fetch(reQ).then((res) => res.json()).then((response) => {
          if (response.user){
            setLogin(true, response);
          }

          if (response.error) {
            container.innerHTML = response.error
            return false
          }
        }).catch((err) => {
          container.innerHTML = 'Registration failed! retry.'
          window.location.hash='/#register-page'
        })

      container.innerHTML = "Loading resources..."
      
    }

  })
}