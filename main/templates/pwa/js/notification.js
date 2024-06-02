document.addEventListener('scroll', (ev) => {

  Notification.requestPermission().then((result) => {
    if (result === "granted") {
      new Notification('Thank you!', { body: 'we will notify you whenever new event occurs.', icon: '/icon-72x72.png'})
    }
  })

  navigator.serviceWorker.getRegistration().then(registration => {
    return registration.pushManager.getSubscription()
      .then(async (subscription) => {
        if (subscription) {
          return subscription;
        }

        const response = await fetch('/notification-public-key/');
        const publicKey = await response.json();
        const convertedPublicKey = urlBase64ToUint8Array(publicKey);

        console.log('Public Key: ', convertedPublicKey)

        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey
        })

      }).then((subscription) => { 

        fetch('/notification-register/', {
          method: 'post',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({ subscription})
        
        }).then(() => {
          setInterval(() => {
            fetch('/send-notification/', {
              method: 'post',
              headers: {
                'Content-type': 'application/json',
              },
              body: JSON.stringify({
                subscription,
              })
            })
          }, 5*60*1000);
        })

    });

  })
});




            