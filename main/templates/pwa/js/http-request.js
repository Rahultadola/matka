const overlay = document.getElementById('overlayContent');

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


export const httpPostRequest = (url, boody, successHash, successMessage) => {
	const csrftoken = getCookie('csrftoken');

    fetch(`http://${window.location.host}/${url}/`,
      	{
	        method: "POST",
	        body: JSON.stringify(boody),
	        headers: {
	          "Content-type": "application/x-www-form-urlencoded",
	          'X-CSRFToken': csrftoken
	        },
	        mode: 'same-origin'
        }).then((res) => res.json()).then((response) => {
          if (response.success){

            overlay.style.backgroundColor = '#aaff00';
            overlay.innerHTML = successMessage;
            overlay.style.display = 'block'; 

            setTimeout(() => {
              overlay.style.transform = 'translateY(-20px)';
              overlay.style.display = 'none'; 
              window.location.hash = successHash;
            }, 1500)
          }

          if (response.error) {
            overlay.style.backgroundColor = '#ff3a3a';
            overlay.innerHTML = response.error;
            setTimeout(() => {
              overlay.style.transform = 'translateY(-30px)';
            }, 1500)
          }
    }).catch((err) => {
      overlay.style.backgroundColor = '#ff3a3a';
      overlay.innerHTML = 'Request failed! please retry.'
      // window.location.reload();
    })
};