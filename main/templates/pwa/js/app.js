import {
  gtInterval,
  initBetsPage, 
  initRulePage,
  initGamesPage,
  initFundsPage,
  initProfilePage,
  initSettingPage,
  initGameRatesPage,
  initChangePassword,
  initBetFormHandler,
  initWinHistoryPage,
  initFundRequestPage,
  initBankDetailsPage,
  initFundHistoryPage
} from './pages.js';

import { initRegisterPage, loginHandler } from './login-register.js';

import { 
  addFooter,
  toggleHeader,
  footerToggler,
  navLinkDecoration, 
  addNavEventHandlers, 
  containerOverlayToggler, 
} from './layout.js';



var isUserLoggedin = false;
var userDetails = 'anonymus-user';

const bets = [];


export const setLogin = (b, user) => {
  isUserLoggedin = b;
  if (b) {
    userDetails = user;
    window.location.hash = '#khabar-page'
  } else {
    window.location.hash = ''
  }  
};

const setLogout = () => {
  isUserLoggedin = false;
  userDetails = 'anonymus-user';
  window.location.href = '/'
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
  container.innerHTML = "<h2 style='color:red'>Error occured.</h2>"
}




const updateUserData = (mobile) => {
  return fetch(`/user-details/`).then((res) => res.json()).then((response) => {
    userDetails = res
  }).catch(err => err)
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






    /// Animation Start here    

    // rfBtn.style.transitionDuration = '1s';
    // rfBtn.style.transform = 'rotate(360deg)';
    // rfBtn.style.borderWidth = '10px';
                                                                
    // setTimeout(() => {
    //   rfBtn.style.transitionDuration = '0s';
    //   rfBtn.style.transform = 'rotate(0deg)';
    //   rfBtn.style.borderWidth = '10px';

    //   setTimeout(() => {
    //     rfBtn.style.transitionDuration = '1s';
    //     rfBtn.style.transform = 'rotate(1080deg)';
    //     rfBtn.style.borderWidth = '0px';
        

    //     setTimeout(() => {
    //       rfBtn.style.transitionDuration = '0s';     
    //       rfBtn.style.transform = 'rotate(0deg)';
    //       rfBtn.style.borderWidth = '0px';
          
    //     }, 1000)

    //   }, 1)

    // }, 1000)
    /// Animation code end here
  }

  rfBtn.addEventListener('click', (ev) => {
    refAnimation();

    if (!refInterval) {
      refInterval = setInterval(() => {
        refAnimation();
      }, 2110)//2120
    }

    
    updateUserData(userDetails.user.mobile).then(() => {
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
  
  if (isUserLoggedin && userDetails != 'anonymus-user') {   
    toggleHeader(userDetails.bid_details.wallet_balance, userDetails.admin)
    
    if (!document.querySelector('main').contains(document.getElementById('side_nav'))) {
      addNavEventHandlers(userDetails.user.mobile);
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
      initGamesPage(userDetails.star_line_today, userDetails.bet_types, userDetails.admin);
    } else if (hash === '#bets-page') {
      initBetsPage(userDetails.user, userDetails.bid_details);
    } else if (hash === '#win-history-page') {
      initWinHistoryPage(userDetails.won_bets);
    } else if (hash.slice(0,11) === '#funds-page') {

      const queryString = window.location.hash.split('?');

      if (queryString[0].length > 0 && queryString[1]) {
        const query = queryString[1].split('=')[1].trim();

        if (query === 'deposite-fund') {
          initFundRequestPage('deposite', userDetails.transaction_details.total_amount)
        } else if (query === 'withdraw-fund') {
          initFundRequestPage('withdraw', userDetails.bid_details.wallet_balance) 
        } else if (query === 'deposite-history') {
          initFundHistoryPage('d', userDetails.transaction_details.deposite_transactions)
        } else if (query === 'withdraw-history') {
          initFundHistoryPage('w', userDetails.transaction_details.withdraw_transactions)
        } else if (query === 'add-bankdetails') {
          initBankDetailsPage()
        }

      } else {
        initFundsPage();
      }

    } else if (hash === '#profile-page') {
      initProfilePage(userDetails.user);
    } else if (hash === '#logout' ){
      logoutHandler(setLogin)
    } else if (hash.slice(0,9) === '#bet-form') {
      initBetFormHandler(bets, userDetails.user, userDetails.bid_details.wallet_balance, userDetails.bet_types);
    } else if (hash === '#rules-page' ){
      initRulePage()
    } else if (hash === '#game-rates-page') {
      initGameRatesPage(userDetails.bet_types)
    } else if (hash === '#settings-page') {
      initSettingPage(userDetails.user.notifications)
    } else if (hash === '#change-password') {
      initChangePassword()
    } else { // on error we will redirect to home page
      initGamesPage(userDetails.star_line_today, userDetails.bet_types, userDetails.admin);
      alert("Error  occurred!")
    }
  } else {

    if (hash === '#register-page'){
      initRegisterPage(setLogin)
    } else if (hash === '#forgot-password') {

    } else if (hash === '' || hash === '#login-page'){
      loginHandler()      
    } else if (hash[0] === '?'){
      errorHandler()
    } else {
      console.log(window.location.hash, ' Unavailable')
    }
  }
};




window.addEventListener('load', routerHandler)
window.addEventListener('hashchange', routerHandler)


if ("serviceWorker" in navigator) {
  function install_worker() {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length === 0) {
        navigator.serviceWorker
          .register("/serviceWorker.js")
          .then(res => console.log("matka worker registered"))
          .catch(err => console.log("matka worker not registered", err))
      } 
    })
  }

  window.addEventListener("load", install_worker);
  window.addEventListener("hashchange", install_worker)
}
