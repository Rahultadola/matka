import { getCookie } from './login-register.js';
import { httpPostRequest } from './http-request.js';
import { execute_gpay } from '/gpay__init__.js';
import { bet_formHandler, bid_submitHandler } from '/events.js';
import { 
  gamePageHTML, 
  bet_formHTML, 
  bet_pageHTML,
  rulesPageHTML, 
  fundOptionHTML,
  money_formHTML,
  transaction_HTML, 
  gameTypesRateHTML, 
  changePasswordHTML,
  bankDetailsFormHTML, 
  transactionEntryHTML, 
} from '/str_html.js';                  // ➺➤➧


export var gtInterval = null;

let output = '';
const container = document.querySelector(".container");
const overlay = document.getElementById('overlayContent');

const game_status_slogen = ['Betting Closed for Today', 'Running for close', 'Running Now'];


export const initBetFormHandler = (bets, user, wallet_balance, bet_types) => {
  const gameList = document.getElementById('game-list');
  for ( let link of gameList.children) {
    if ( link.getAttribute('href').slice(1) === window.location.hash) {
      link.style.border = '1px solid aqua';
      link.style.borderRadius = '5px';
      link.style.color = '#ddd';
    } else {
      link.style.border = 'none';
      link.style.color = '#aaa';
    }
  }

  const addEventListenerForTableRemoveBtn = () => {
    document.querySelectorAll('.remove-row-icon').forEach((rmBTN) => {
      rmBTN.addEventListener('click', (ev) => {
        const row = ev.target.parentElement.parentElement;
        const tableBody = ev.target.parentElement.parentElement.parentElement;
        
        const rowIndex = bets.findIndex((bt) => (
          bt.game === row.children[0].innerHTML &&
          bt.bidType === row.children[1].innerHTML &&
          bt.gameType === row.children[2].innerHTML &&
          bt.bid === row.children[3].innerHTML &&
          bt.amount === row.children[4].innerHTML
        ));
        console.log("Found Row :", rowIndex)

        bets.splice(rowIndex, 1);
        tableBody.removeChild(row);
      })
    })
  };

  let queryParams = null;
  const queryString = window.location.hash.split('?');

  if (queryString[0].length > 0 && queryString[1].length > 0) {
    queryParams = queryString[1].split('&').map((s) => s.split('=').map((qp) => decodeURIComponent(qp.trim())));    // console.log(queryParams);
  }

  const curr_betType = bet_types.filter((bt) => bt.title === queryParams[1][1])[0];

  container.innerHTML = bet_formHTML(bets, queryParams[0][1], curr_betType, wallet_balance);
  addEventListenerForTableRemoveBtn();

  document.getElementById('bet-form').digit.addEventListener('input', (ev) => {
    ev.target.value = ev.target.value.split('').slice(0, parseInt(curr_betType.digit_count)).join('');
  });

  document.getElementById('bet-form').amount.addEventListener('input', (ev) => {
    if (parseInt(ev.target.value) > parseInt(wallet_balance)) {
      ev.target.value = ev.target.value.split('').slice(0, ev.target.value.length - 1).join('');
    }
  });

  document.getElementById('bet-form').addEventListener('submit', (ev) => {
    bets.push({
      game: decodeURIComponent(queryParams[0][1]),
      bidType: decodeURIComponent(queryParams[1][1]),
      ...bet_formHandler(ev)
    })

    ev.target.digit.value = '';
    ev.target.amount.value = '';

    addEventListenerForTableRemoveBtn();    
  });

  document.getElementById('bid-submit-btn').addEventListener('click', (ev) => {
    bid_submitHandler(container, bets);
  });
};


export const initGamesPage = (games, betTypes, admin) => {    
  const gms = games.map(gamePageHTML)  
  container.innerHTML = gms.join('');
  console.log('Games added.')

  overlay.style.transform = 'translateY(0)';
  overlay.style.backgroundColor = '#0000';


  // if(!gtInterval) {
    gtInterval = setInterval(() => {
      document.querySelectorAll('.time-cont-inner').forEach((tci) => {
        tci.style.transitionDuration = '1s';
        tci.style.transform = "translateY(-2rem)";


        setTimeout(() => {
          tci.style.transitionDuration = '0s';
          tci.style.transform = "translateY(0)";
          const childF = tci.children[0];
          const childS = tci.children[1];

          tci.removeChild(childF)
          tci.appendChild(childF)
          tci.removeChild(childS)        
          tci.appendChild(childS)
        }, 1000)
      })
    }, 5*1000)
  // } 


  const activeGames = document.getElementsByClassName('link-open')
  for (var slGame of activeGames) {
    slGame.addEventListener('click', (ev) => {
      let targetPlayButton = ev.target;

      if( ev.target.tagName === "SPAN"){
        targetPlayButton = ev.target.parentElement
      }

      if( ev.target.tagName === "path" || ev.target.tagName === "g"){
        targetPlayButton = ev.target.ownerSVGElement.parentElement
      }
      
      // console.log(targetPlayButton.getAttribute('data-slname'), targetPlayButton.getAttribute('data-slopen'), targetPlayButton.getAttribute('data-slclose'));

      const game = decodeURIComponent(targetPlayButton.getAttribute('data-slname'))
      output = '';
      if(game != null) {
        const betHTML_List = betTypes.map((type, i) => (`
          <a href="/#bet-form?game=${encodeURI(targetPlayButton.getAttribute('data-slname'))}&type=${encodeURI(type.title)}" 
            <img src="" />
            <span>${type.title}</span>
          </a>`));

        overlay.innerHTML = `<h2>${game}</h2><div id="game-list" class="game-type-list">${betHTML_List.join('')}</div>`;
        overlay.style.display = 'block';
        container.innerHTML = ''
      } else {
        overlay.style.display = 'none';
      }
    })
  }
}



export const initBetsPage = (user, bidDetails) => {
  const bid_HTML_List = bidDetails.bids.map(bet_pageHTML)
  container.innerHTML = bid_HTML_List.join('')

  if (bidDetails.bids.length === 0) {
    container.innerHTML = `<h3>Enjoy playing have fun<br>Play Daily, Win Daily<br>No games played yet.</h3>`
  }
  console.log('Bets added.')
};


export const initWinHistoryPage = (wonBets) => {
  const bid_HTML_List = wonBets.map(bet_pageHTML)
  container.innerHTML = bid_HTML_List.join('')

  if (wonBets.length === 0) {
    container.innerHTML = `<h3>You are about to win one<br>Today is your lucky day.</h3>`
  }
  console.log('Winning Bets added.')
};



export const initFundsPage = () => {
  const options = [
    {
      title: 'Add Fund',
      description: 'Add fund to wallet before bidding',
      action: 'deposite-fund'
    },
    {
      title: 'Withdraw Fund', 
      description: 'Withdraw your winning amounts',
      action: 'withdraw-fund'
    },
    {
      title: 'Add Bank Details',
      description: 'Add bank details for withdrawl',
      action: 'add-bankdetails'
    },
    {
      title: 'Fund Deposite History',
      description: 'See your entire deposite history',
      action: 'deposite-history'
    },
    {
      title: 'Fund Withdraw History',
      description:'See your entire withdraw history',
      action: 'withdraw-history'
    }
  ]

  const opts = options.map(fundOptionHTML)
  container.innerHTML = opts.join(' ')

};



export const initFundRequestPage = (reqType, totalAmount) => {
  const depositeSuccessMessage = '<h3>Request placed successfully!<br>You can pay via any method and contact admin</h3>'
  const withdrawSuccessMessage = '<h3>Request placed successfully!<br>You will recieve payment contact admin</h3>'

  container.innerHTML = `<div class="fund-detail">
    <h2>Balance : &#x20b9; ${totalAmount}</h2>
  </div>`;

  const fundReqForm = document.createElement('form');
  fundReqForm.id = `${reqType}-form`;
  fundReqForm.innerHTML = money_formHTML(reqType);

  container.append(fundReqForm);

  document.getElementById(`${reqType}-form`).addEventListener('submit', (ev) => {
    ev.preventDefault();
    const inputAmount = ev.target.amount.value;
    
    const url = `${reqType}-request`;
    const body = { amount: inputAmount }
    const successHash = `#funds-page?action=${reqType}-history`;
    const successMessage = `${reqType === 'deposite' ? depositeSuccessMessage : withdrawSuccessMessage }`
    // console.log(successHash, successMessage)
    httpPostRequest(url, body, successHash, successMessage)
  })
};



export const initFundHistoryPage = (type, trans) => {
  overlay.innerHTML = `<h3>Fund ${type === 'd'? 'Deposite' : 'Withdraw'} History</h3>`;
  container.innerHTML = trans.map(transactionEntryHTML).join('');

  if (trans.length === 0) {
    container.innerHTML += '<h3>Waiting for your action,<br>No history found</h3>'
  }
};


export const initBankDetailsPage = () => {
  overlay.innerHTML = '<h3>Add your bank details for withdrawl purpose.</h3>'
  container.innerHTML = bankDetailsFormHTML();

  document.getElementById('bank-details-form').addEventListener('submit', (ev) => {
    ev.preventDefault();

    const submitBtn = document.getElementById('bd-submit');
    submitBtn.setAttribute('disabled', true);

    const url = 'add-bank-details';
    const body = {
        bank_name: ev.target.bank_name.value,
        ifs_code: ev.target.ifs_code.value,
        acc_hold_name: ev.target.acc_hold_name.value,
        account_number: ev.target.account_number.value
      }

    const successMessage = 'Your bank details submitted successfully.'
    const successHash = false;

    httpPostRequest(url, body, successHash, successMessage)

    overlay.innerHTML = "Waiting for response from server...";
    overlay.style.display = 'block';

  });

};


export const initProfilePage = (profile) => {
  container.innerHTML = `<div class="card">
      <h6>Username : ${profile.username}</h6>
      <h1 class="card--title">${profile.mobile}</h1>
    </div>`
  console.log('Transactions added added.')
}


export const initSettingPage = (settings) => {  
  const settList = settings.map((s) => (`
    <li data-value=${s.value} style="display: flex; justify-content: space-between; align-items: center;">
      <span>${s.title.split('-').map((t) => t[0].toUpperCase()+t.slice(1,t.length)).join(' ')}</span>
      <div id="${s.title}" class="sett-inp-outer-div ${ s.value ? "sett-out-active" : "sett-out-inactive"}">
        <div class="sett-inp-inner-div ${s.value ? "sett-inn-active" : "sett-inn-inactive"}">
        </div>
      </div>
    </li>`));

  container.innerHTML = `<div class="card" style="width:22rem ; height: 15rem">
    <h4>Notification Settings</h4>
    <ul id="setting-notification" class="sett-list">
      ${settList.join('')}
    </ul>
  </div>`;
};



export const initGameRatesPage = (gameTypes) => {
  const gameRates = gameTypes.map(gameTypesRateHTML)  
  container.innerHTML = gameRates.join('');
};


export const initRulePage = () => {
  container.innerHTML = rulesPageHTML;
};



export const initChangePassword = () => {
  const csrftoken = getCookie('csrftoken');

  container.innerHTML = changePasswordHTML;

  document.getElementById('change-password').addEventListener('submit', (ev) => {
    ev.preventDefault();

    const submitBtn = document.getElementById('cp-submit');
    submitBtn.setAttribute('disabled', true);

    const url = 'change-password';
    const successMessage = 'Password changed successfully.'
    const successHash = '#khabar-page';
    const body = {
      new_password: ev.target.new_password.value,
      confirm_password: ev.target.confirm_password.value
    }

    httpPostRequest(url, body, successHash, successMessage)

    container.innerHTML = "Waiting for response from server...";
    // overlay.style.display = 'block';
  }); 
}

