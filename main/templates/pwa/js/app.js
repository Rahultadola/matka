import {
  gtInterval,
  initRulePage,
  initGamesPage,
  initFundsPage,
  initProfilePage,
  initSettingPage,
  initGameRatesPage,
  initChangePassword,
  initBetFormHandler,
  initBidHistoryPage, 
  initWinHistoryPage,
  initFundRequestPage,
  initBankDetailsPage,
  initFundHistoryPage
} from './pages.js';

import { initRegisterPage, loginHandler } from './login-register.js';

import { 
  addFooter,
  toggleHeader,
  handleLayouts,
  footerToggler,
  navLinkDecoration, 
  addNavEventHandlers, 
  containerOverlayToggler, 
} from './layout.js';

import { getCookie } from './http-request.js';


const bets = [];


export const setLogin = (b, user) => {
  if (b) {
    localStorage.setItem('isUserLoggedin', b)
    localStorage.setItem('appData', JSON.stringify(user))
    window.location.hash = '#khabar-page'
  } else {
    alert('Error Login!')
    window.location.href = '/';
  }  
};

const setLogout = () => {
  localStorage.setItem('isUserLoggedin', false)
  localStorage.setItem('appData', undefined)
  window.location.href = '/';
}


const logoutHandler = () => {
  fetch('/logout/').then((res) => res.json()).then((response) => {
    if (response.status === 200) {
      setLogout();
    }
  })
};

function errorHandler() {
  const container = document.querySelector(".container")
  container.innerHTML = "<h2 style='color:red'>Error occured.</h2>";
  setTimeout(() => {
    window.location.location = '';
  }, 2000)
}


const updateUserData = (mobile) => {
  return fetch(`/user-details/`).then((res) => res.json()).then((response) => {
    localStorage.setItem('appData', JSON.stringify(response))
  }).catch(err => alert(err))
}

const addRefreshBtn = () => {
  const refreshSVG1 = `<svg id="rfs-svg" height="40" viewBox='0 0 100 100'>
    <g stroke='#1e1a1a' fill='#e74c3c' stroke-linejoin='round' stroke-width='3' >
      <path d="M 15 50 C 10 0, 65 0, 75 20 
        l10,-5 l-5,30 l-30,-10l10,-5
        C 50 10, 15 20, 15 50z
        M85 50 C 90 100, 35 100, 25 80
        l-10,5 l5,-30 l 30,10l-10,5
        C 50 90, 85 80, 85 50z"></path>
    </g></svg>`;

  const rfBtn = document.createElement('div');
  rfBtn.id = 'refresh-user-data';
  rfBtn.innerHTML = refreshSVG1;

  document.querySelector('main').append(rfBtn);
  var refInterval;

  const refAnimation = () => {    // const timingFunc = 'cubic-bezier';    // targetEleme_style = rfBtn.style;
    const rfsSVG = document.querySelector('#rfs-svg');
    rfsSVG.style.transitionDuration = '1s';
    rfsSVG.style.transform = 'rotate(360deg)';
    rfsSVG.setAttribute('height', '25');
                                                                
    setTimeout(() => {
      rfsSVG.style.transitionDuration = '0s';
      rfsSVG.style.transform = 'rotate(0deg)';
      rfsSVG.setAttribute('height', '25');

      setTimeout(() => {
        rfsSVG.style.transitionDuration = '1s';
        rfsSVG.style.transform = 'rotate(1080deg)';
        rfsSVG.setAttribute('height', '40');
        

        setTimeout(() => {
          rfsSVG.style.transitionDuration = '0s';     
          rfsSVG.style.transform = 'rotate(0deg)';
          rfsSVG.setAttribute('height', '40');
          
        }, 1000)

      }, 1)

    }, 1000)
  }

  rfBtn.addEventListener('click', (ev) => {
    refAnimation();

    if (!refInterval) {
      refInterval = setInterval(() => {
        refAnimation(); //2120
      }, 2110)
    }
    const mobNumber = JSON.parse(localStorage.getItem('appData')).user.mobile;
    updateUserData(mobNumber).then(() => {
      clearInterval(refInterval);
      refInterval = undefined;
      const currHash = window.location.hash;
      window.location.hash = '';
      window.location.hash = currHash;
    })
  });

};


const routerHandler = () => {
  const hash = location.hash;
  navLinkDecoration();

  var isLogedIn = localStorage.getItem('isUserLoggedin')
  isLogedIn = isLogedIn === 'false' ? false : true;

  var appData = localStorage.getItem('appData');
  appData = appData === 'undefined' ? undefined : appData;

  console.log(isLogedIn, appData)
  if (isLogedIn && appData != undefined) {
    const appContext = JSON.parse(localStorage.getItem('appData'))

    if(!document.querySelector('header').contains(document.getElementById('login-user-header'))) {
      toggleHeader()
    }
    document.getElementById('wallet-balance').innerHTML = `${appContext.wallet.temp_bid_balance}`;
    handleLayouts(appContext.admin)
    
    if (!document.querySelector('main').contains(document.getElementById('side_nav'))) {
      addNavEventHandlers(appContext.user.mobile);
    } else {
      document.getElementById('close-side-nav').click();
    }

    if (!document.querySelector('main').contains(document.getElementById('page-footer'))) {
      addFooter();
    }

    if (!document.querySelector('main').contains(document.getElementById('refresh-user-data'))) {
      addRefreshBtn();
    }

    footerToggler();
    containerOverlayToggler();    

    if(gtInterval){
      clearInterval(gtInterval);
    }

    if (hash.slice(0,9) != '#bet-form') {
      while(bets.length > 0) {
        bets.pop();
      }
    }

    if (hash === '#khabar-page') {
      initGamesPage(appContext.star_line_today, appContext.bet_types, appContext.admin);
    } else if (hash.slice(0,9) === '#bet-form') {
      initBetFormHandler(bets, appContext.user, appContext.wallet.temp_bid_balance, appContext.bet_types, appContext.star_line_today);
    } else if (hash === '#bid-history-page') {
      initBidHistoryPage(appContext.user, appContext.bids);
    } else if (hash === '#win-history-page') {
      initWinHistoryPage(appContext.won_bets);
    } else if (hash.slice(0,11) === '#funds-page') {
      const queryString = window.location.hash.split('?');

      if (queryString[0].length > 0 && queryString[1]) {
        const query = queryString[1].split('=')[1].trim();

        if (query === 'deposite-fund') {
          initFundRequestPage('deposite', appContext.wallet.temp_bid_balance)
        } else if (query === 'withdraw-fund') {
          initFundRequestPage('withdraw', appContext.wallet.temp_bid_balance) 
        } else if (query === 'deposite-history') {
          initFundHistoryPage('d', appContext.transactions.deposite_transactions)
        } else if (query === 'withdraw-history') {
          initFundHistoryPage('w', appContext.transactions.withdraw_transactions)
        } else if (query === 'add-bankdetails') {
          initBankDetailsPage()
        }

      } else {
        initFundsPage(appContext.wallet.temp_bid_balance);
      }

    } else if (hash === '#profile-page') {
      initProfilePage(appContext.user);
    } else if (hash === '#logout' ){
      logoutHandler(setLogin)
    } else if (hash === '#rules-page' ){
      initRulePage()
    } else if (hash === '#game-rates-page') {
      initGameRatesPage(appContext.bet_types)
    } else if (hash === '#settings-page') {
      initSettingPage(appContext.user.notifications)
    } else if (hash === '#change-password') {
      initChangePassword()
    } else { // on error we will redirect to home page
      window.location.hash = '#khabar-page'
    }
  } else {

    if (hash === '#register-page'){
      initRegisterPage(setLogin)
    } else if (hash === '#forgot-password') {

    } else if (hash === '' || hash === '#login-page'){
      loginHandler()      
    } else {
      errorHandler()
      console.log(window.location.hash, ' Unavailable')
    }
  }
};




window.addEventListener('load', routerHandler)
window.addEventListener('hashchange', routerHandler)


// This function is needed because Chrome doesn't accept a base64 encoded string
// as value for applicationServerKey in pushManager.subscribe yet
function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
 
  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);
 
  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}





if ("serviceWorker" in navigator) {
  function install_worker() {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length === 0) {
        navigator.serviceWorker
          .register("/serviceWorker.js")
          .then((registration) => {
            console.log("matka worker registered");
          }).catch(err => console.log("matka worker not registered", err))
      } 
    })
  }

  window.addEventListener("load", install_worker);
  window.addEventListener("hashchange", install_worker)
}
