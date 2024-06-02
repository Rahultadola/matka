import { httpPostRequest } from './http-request.js';

const container = document.querySelector(".container")

export const bet_formHandler = (ev) => {
    ev.preventDefault();
                                                        // console.log(ev.target.digit, ev.target.amount)
    const row = document.createElement('tr')
    row.className = 'bid-row'
    row.innerHTML = `
      <td>${decodeURI(ev.target.game.value)}</td>
      <td>${decodeURI(ev.target.bidType.value)}</td>
      <td>${ev.target.gameType.value}</td>
      <td>${ev.target.digit.value}</td>
      <td>${ev.target.amount.value}</td>
      <td><span class="remove-row-icon">X</span></td>
    `;

    document.getElementById('bet-list').append(row);
    
    return {
      gameType: ev.target.gameType.value,
      bid: ev.target.digit.value,
      amount: ev.target.amount.value
    };
};


export const bid_submitHandler = (container, bets) => {
    document.getElementById('overlayContent').style.display = 'none';
    container.innerHTML = 'Waiting for server response...';

    if ( bets.length > 0 ) {
        const url = 'add-bid';
        const body = { bids: bets }
        const successHash = '#bets-page';
        const successMessage = 'Successfully placed bids.';
        
        httpPostRequest(url, body, successHash, successMessage)
    } else {
        container.innerHTML = 'No bids to place.'
    }
}