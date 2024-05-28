let output = "";
const game_status_slogen = ['Betting Closed for Today', 'Running for close', 'Running Now']

const clock_svg = "<svg width='30' height='30' viewBox='5 10 90 70'><g stroke='#e74c3c' fill='none' stroke-width='4'><circle cx='50' cy='50' r='30'/><path d='m50,30v20h20' /><path d='m30,72l-10,10' /> <path d='m70,72l10,10' /><path d='m35,15A10,10,0,1,0,15,35z' /> <path d='m85,35A10,10,0,0,0,65,15z' /></g></svg>";
const play_svg = "<svg width='30' height='30' viewBox='0 0 100 100' style='margin-right: 0.5rem'><g stroke='#fff' stroke-linejoin='round' stroke-width='4'><path d='m30, 20v60l55,-30z' fill='#fff'/></g></svg>";


export const gamePageHTML = (g, i) => (`
	<div class="card">
		<h3 class="sl-title">${g.name}</h3>
		<hr style="margin-top:0.25rem;box-shadow: 0px -3px 5px #bbb;">
		<div class="result">
			<div class="r-first">
				<h2 class="r-f-pair">${g.first_pair}</h2>
				<h1 class="r-f-digit">${g.first_digit}</h1>
			</div>

			<div class="r-second">
				<h1 class="r-s-digit">${g.second_digit}</h1>
				<h2 class="r-s-pair">${g.second_pair}</h2>
			</div>
		</div>
		<hr style="margin-bottom:0.25rem;box-shadow: 0px 3px 5px #bbb;">
		
		<!--span style="font-size: 0.8rem;transition: all 1s;color: #f08;transform: translateX(-40px);width: 25rem;">Open Result Time - 10:45 AM, Close Result Time - 12:45 PM</span-->
		<div class="row-flx game-time">
			<div class="col-flx">
				<span class="bt-title">Open</span>
				<div class="time-cont-outer">
					<div class="time-cont-inner">
						<span class="rt">Result Time</span>
						<span class="rt">${g.open_result_time}</span>
						<span class="bt">Last Bid Time</span>
						<span class="bt">${g.open_bid_last_time}</span>
					</div>
				</div>
			</div>
			${clock_svg}
			<div class="col-flx">
				<span class="bt-title">Close</span>
				<div class="time-cont-outer">
					<div class="time-cont-inner">
						<span class="rt">Result Time</span>
						<span class="rt">${g.close_result_time}</span>
						<span class="bt">Last Bid Time</span>
						<span class="bt">${g.close_bid_last_time}</span>
					</div>
				</div>
			</div>
		</div>
		<p style="font-size: 0.8rem;margin: 0.25rem auto;">${game_status_slogen[0]}</p>
		<div class="card--link row-flx ${ i%2===0 ? 'link-open': 'link-close'}" data-slname="${encodeURI(g.name)}" data-slopen="${g.open_time}" data-slclose="${g.close_time}">${play_svg}<span>Play</span></div>
	</div>`);

export const gameTypesRateHTML = (gt) => (`
	<div class="card">
		<img src="${gt.img}" alt="${gt.title}"/>
		<h3 style="color:#000088">${gt.title}</h3>
		<span>${gt.unitBetAmount} ⟶ ${gt.winAmount}</span>
	</div>`)


export const bet_pageHTML = (g) => ( `
	<div class="card">
		<h6 class="card--title">${g.bid_type}</h6>
		<h4 class="card--avatar">${g.bid_digit}</h4>
		<h3>${g.game}</h3>
		<h4 class="">${g.time_start}</h4>
		<h3>${g.time_update}</h3>
		<span>Active : ${g.verified}</span>
		<span>Won : ${g.is_win}</span>
		<span>Paid : ${g.paid}</span>
	</div>
`);



export const transaction_HTML = (g, i) => (
      output += `
	      <div class="card">
	        <h6>${i+1}</h6>
	        <h4 class="card--avatar">${g.amount}</h4>
	        <h1 class="card--title">${g.tr_type}</h1>
	        <h4 class="card--avatar">${g.date}</h4>
	        <span class="">${g.verified}</span>

	      </div>
      `)

export const transactionEntryHTML = (tr) => (`<div class="card" style="width: 50%; min-width: 20rem; flex-direction: row">
    <div style="display:flex; flex-direction: column;align-items:center; justify-content: space-between">
      <span>Amount</span>
      <h3>&#x20b9; ${tr.amount}</h3>
    </div>
    <div style="display:flex; flex-direction: column; align-items:center">
    	<div>
    		<span>${tr.tr_type === 'D'? 'Deposite': 'Withdraw'} request</span>
    		<span>is ${tr.is_paid ? 'paid' : 'unpaid'} ${tr.comleted_on ? 'on'+ tr.comleted_on.toString() : ''}</span>
    	</div>
	    <div>
	      ${tr.is_paid ? `<span>via ${tr.method}</span>` : '<a href="upi://pay?pa=UPIID@oksbi&amp;pn=FNAME SNAME&amp;cu="INR">Pay Now !</a>'} </span>
	            
	    </div>
	</div>
    <div>
      <span>${tr.verified ? 'Admin Verified': 'Waiting...'}</span>
    </div>
  </div>`);


export const bet_formHTML = (bets, game, bet_type, wallet_balance) => {
	let btRows = '';

	for (let bt of bets){
		btRows +=`<tr>
			<td>${bt.game}</td>
			<td>${bt.bidType}</td>
			<td>${bt.gameType}</td>
			<td>${bt.bid}</td>
			<td>${bt.amount}</td>
			<td><span class="remove-row-icon">X</span></td>
		</tr>`;
	}

	return (`
    <form id="bet-form" style="width: 50%;  min-width: 20rem;">
      <input type="hidden" name="game" value="${game}"  />
      <h4 >${bet_type.title}</h4> <input type="hidden" name="bidType" value="${encodeURI(bet_type.title)}" />
      
	  <fieldset class="inputs" style="flex-direction:row">
	    <p>Game Type :</p>
    	<div>
    		<div style="width: 100%; display: flex; align-items: center;">
    			<input type="radio" id="gtChoice1" name="gameType" value="open" checked /> 
    			<label for="gtChoice1">Open</label>
    		</div>
		    <div style="width: 100%; display: flex; align-items: center;">
		    	<input type="radio" id="gtChoice2" name="gameType" value="close" /> 
		    	<label for="gtChoice2">Close</label>
		    </div>
		</div>
	  </fieldset>
   
      <div class="inputs bet-inputs">
      	<label>Digit</label>
      	<input name="digit" type="number" min=0 max=${ Math.pow(10, bet_type.digit_count) - 1 } style="width: 75%; text-align: center"/>
      </div>
      <div class="inputs bet-inputs">
      	<label>Token</label>
      	<input name="amount" type="number" style="width: 75%; text-align:center" min=10 max=${wallet_balance} />
      </div>
      <input style="margin:auto" class="form-submit" type=submit value="Add Bid" />
    </form>
    <table id="bet-list">
      <thead class="bet-col-title">
      	<th>Game</th>
        <th>Bid Type</th>
        <th>Game Type</th>
        <th>Digit</th>
        <th>Amount</th>
        <th>-</th>
      </thead>
      <tbody>
      	${btRows}
      </tbody>
    </table>
    <a id="bid-submit-btn" href="javascript:void(0)">Submit Bids</a>
  `)};


export const fundOptionHTML = (opt) => (`<div class="card" style="flex-direction: row; width: 90%; justify-content: space-between; align-items: center;">
	<img src="" alt="${opt.title.split(' ').map((s) => s[0]).join('')}" style="width: 3rem; height: 3rem; overflow: hidden;  background-color: #423f3f;"/>
	<div style="display: flex; justify-content: space-between; width: 85%; margin-left: 0.5rem; align-items: center;">
		<div style="text-align: start;">
			<h4>${opt.title}</h4>
			<span style="font-size: 0.7rem; color: #077;">${opt.description}</span>
		</div>
		<a class="fund-card-link" href="/#funds-page?action=${opt.action}">➺</a>
	</div>
</div>`);


export const money_formHTML = (reqType) =>` 
    <div class="inputs">
        <label for='amount'>Amount</label>
        <input 
        	id="amount" 
        	name="amount" 
        	type="number" 
        	placeholder="${reqType === 'deposite'? 500 : 1000 }" 
        	min="${reqType === 'deposite'? 500 : 1000 }"   
        	max="${reqType === 'deposite'? 10000000 : 25000}"  />
    </div>
    <div>
        <input style="width:auto" class="form-submit" type='submit' value="ADD" />
    </div>
`;


export const bankDetailsFormHTML = () => (`<div>
	<h1 class="card--title form-title">Fill the details below</h1>
    <form id="bank-details-form" class="card">
      <h1 class="card--title form-heading">Bank Details</h1>
      <div class="inputs">
        <label for="bank-name">Bank Name :</label>
        <input id="bank-name" name="bank_name" type="text" placeholder="State Bank of India" required />
      </div>

      <div class="inputs">
        <label for="ifs-code">IFS Code :</label>
        <input id="ifs-code" name="ifs_code" type="text" placeholder="SBINXXXX00" required />
      </div>

      <div class="inputs">
        <label for="acc-hold-name">Account Holder Name :</label>
        <input id="acc-hold-name" name="acc_hold_name" type="text" placeholder="Matka King" required />
      </div>

      <div class="inputs">
        <label for="account-number">Account Number :</label>
        <input id="account-number" name="account_number" type="text" placeholder="XXXXXXXXXXX" required />
      </div>

      <input id="bd-submit" type=submit value="Submit" />
    </form>
  </div>`);

export const changePasswordHTML = `<div id="change-password">
    <form id="change-password-form" class="card">
      <h1 class="card--title form-heading">Change Password</h1>
      <div class="inputs">
        <label for="new-password">New Password :</label>
        <input id="new-password" name="new_password" type="password" placeholder="*******" required/>
      </div>

      <div class="inputs">
        <label for="confirm-password">Confirm New Password :</label>
        <input id="confirm-password" name="confirm_password" type="password" placeholder="*******" required/>
      </div>
      <input id="cp-submit" type=submit value="Submit" />
    </form>
  </div>`;

export const rulesPageHTML = `<div class="card" style="width:auto"><h2>Good Morning</h2><h3>!! Welcome To Matka King !!</h3></div>
    <div class="card" style="width:auto"><h3>-- MONDAY TO SATURDAY --</h3><p>*Withdraw Time*</p><h4>9:00 AM to 11:00 AM</h4>
    <url>https://matka_king.com</url></div>

    <div class="card" style="width:auto"><h4>Payment Rules</h4>
      <ul style="flex-direction: column; align-items: flex-start; list-style: devanagari;">
        <li>Minimum Deposite >> &#x20b9; 500 /-</li>
        <li>Minimum Withdraw >> &#x20b9; 1000 /-</li>
        <li>Daily Withdraw Limit >> &#x20b9; 25000 /-</li>
      </ul>
    </div>

    <div class="card" style="width:auto">
      <h4>Accepted Payment Methods</h4>
      <ul style="flex-direction: column; align-items: flex-start; list-style: devanagari;">
        <li>Google Pay </li><li>Phone Pay</li><li>Paytm</li></ul></div>

    <div class="card" style="width:auto"><p>You can pay via scanning this QR code</p><img alt="Payment QR Code" src="payment_accept_QR.jpeg" /></div>

    <div class="card" style="width:auto"><h5> - Whatsapp Payments - <br>Not Accepted</h5><hr>
      <h5>व्हाट्सएप पै(Pay) के जरिए किया गया भुगतान हम तक नहीं पहुंचता।<br> कृपया व्हाट्सएप से भुगतान न करें।</h5>
      <h5>जमा करने के लिए Google Pay, PhonePe, Paytm का उपयोग करें। </h5><hr>
  </div>`;


export const loginHeader = `
          <div id="mtk-menu" style="display: flex;align-items: center;">
            <svg id="menu" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="30" viewBox="0 0 48 48">
              <path fill="none" stroke="#e74c3c" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M36.1,7.5h2.4c1.1,0,2,0.9,2,2v3c0,1.1-0.9,2-2,2H18"></path>
              <path fill="none" stroke="#e74c3c" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M13,14.5H9.5c-1.1,0-2-0.9-2-2v-3c0-1.1,0.9-2,2-2h21.3"></path>
              <path fill="none" stroke="#e74c3c" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M13.3,27.5H9.5c-1.1,0-2-0.9-2-2v-3c0-1.1,0.9-2,2-2h20"></path>
              <path fill="none" stroke="#e74c3c" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M35,20.5h3.5c1.1,0,2,0.9,2,2v3c0,1.1-0.9,2-2,2h-20"></path>
              <path fill="none" stroke="#e74c3c" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M13.5,40.5h-4c-1.1,0-2-0.9-2-2v-3c0-1.1,0.9-2,2-2h19.6"></path>
              <path fill="none" stroke="#e74c3c" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M34.2,33.5h4.3c1.1,0,2,0.9,2,2v3c0,1.1-0.9,2-2,2h-20"></path>
            </svg>
            <h1>-rt-</h1>
          </div>

          <ul style="align-items: center;">           
            <li class="wallet">              
              <svg width="40" height="35" viewBox="20 20 60 70">
                <g stroke="#e74c3c">
                  <rect x="20" y="40" rx="10" ry="10" width="60" height="40" fill="transparent" stroke-width="2"/>
                  <path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M20,50c0,-15,5,-15,15,-18l20,-5c15,-5,10,10,11,10"></path>
                  <polygon points="80 65 70 65 65 60 70 55 80 55" fill="transparent" stroke-width="2"/>
                  <circle cx="75" cy="60" r="2" stroke-width="2"/>
                  <circle cx="45" cy="60" r="15" fill="transparent" stroke-width="2"/>
                  <text x="39" y="68" fill="#e74c3c" font-size="25">&#x20b9;</text>
                </g>
              </svg>
              <span id="wallet-balance" style="color: #aliceblue;">9000000000000</span>             
            </li>
            <li style="margin: 0 5px">
              <svg width="40" height="35" viewBox="10 0 90 100">
                <g stroke="#e74c3c">
                  <path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="3" d="M20,70c18,-18,3,-40,25,-48c0,-10,10,-10,10,0c25,5,15,40,25,45c10,5,10,20,-40,18c-30,-5,-10,-25,15,-20c20,5,5,40,-10,20c-10,-15,10,-20,0,-5"></path></g>
              </svg>
            </li>
          </ul>`;




export const sideNavigationHTML = `<div class="nav-content">
          <a href="/#profile-page" style="display: flex; width: 100%;">
            <svg style="margin: auto 1rem;" width="40" height="40" viewBox="0 0 100 100">
                  <g stroke="#9ecc4b" fill="#9ecc4b">
                    <circle cx="50" cy="30" r="20" stroke-width="1"/>
                    <path d="M10,70 A 45, 45, 0, 0, 0, 90 ,70 A 45, 45, 0, 0, 0, 70 ,50 A 40, 60 0, 0, 1, 30 ,50 A 45, 45, 0, 0, 0, 10 ,70z " />                  
                  </g>
          </svg>
            <div style="display: flex; flex-direction: column; align-items: flex-start;">
              <h4 id="nav-username">Matka_king</h4>
              <h2 id="nav-mobile"></h2>
            </div>
          </a>        
          <ul class="nav-menu">
            <li><a href="/#khabar-page"><img /><span class="nav_title">Home</span></a></li>
            <li><a href="/#bets-page"><img /><span class="nav_title">Bid History</span></a></li>
            <li><a href="/#win-history-page"><img /><span class="nav_title">Win History</span></a></li>
            <li><a href="/#funds-page"><img /><span class="nav_title">Funds</span></a></li>
            <li><a href="/#rules-page"><img /><span class="nav_title">Rules & Regulations</span></a></li>
            <li><a href="/#game-rates-page"><img /><span class="nav_title">Game Rates</span></a></li>
            <li><a href="/#settings-page"><img /><span class="nav_title">Settings</span></a></li>
            <li><div id="app-share-btn"><img /><span class="nav_title" style="color: #9ecc4b;">Share Application</span></div></li>
            <li><a href="/#change-password"><img /><span class="nav_title">Change Password</span></a></li>
            <li><a href="/#logout"><img /><span class="nav_title">Logout</span></a></li>
          </ul>
        </div>

        <div id="close-side-nav"></div>`;

export const footerHTML = `
        <a href="/#bets-page" class="footer-links">
          <svg class="footer-svg" viewBox="0 0 100 100">
                  <g stroke="#d4cbc7" fill="#d4cbc7">
                    <!-- thumb -->
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1" d="M20,100l10,-16c10,-15,-13,-30,5,-50c15,-5,10,-18,12,-2c2,10,-6,10,-6,20l15,15c8,15,-40,30,5,83"></path>

                    <!-- palm end -->
                    <path stroke="#1e1a1a" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="3" d="M35,80c1,-1,8,3,9,5"></path>

                    <!-- cash 1 upper -->
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1" d="M28,38l1,-2l-8, -4l-1,5l7.8,1.6"></path>
                    
                    <!--  cash 2 upper -->
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1" d="M32,33l-12,-12l-8,-2l1,5l19,9"></path>

                    <!-- cash 3 upper -->
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1" d="M35,30l8,-8l-8,-12l-15,5l15,15"></path>
          
                    <!-- finger 1 -->
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1" d="M45,50l10,-18l-3,-2c-1, 5, 3, 5, -8, 18l1,2"></path>
                    
                    <!-- finger 2 -->
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1" d="M50,55c4, -5, 8, -7, 12, -16l-1,-2l-4,0c-6, 5, -6, 5, -10, 15l3,3"></path>
                    
                    <!-- finger 3 -->
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1" d="M55,61c3, -5, 5, -7, 12, -15l-1,-2l-2,-1c-6, 9, -4, 6, -12, 15l3,3"></path>
                    
                    <!--  finger 4 -->
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1" d="M60,66l12,-14l-2,-3c-2, -2, -8, 6, -12, 14l2,3"></path>

                    <!-- cash 1 lower -->
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1" d="M59,69l14,16l10,-5c-2, -3, -10, -8, -24, -12"></path>

                    <!-- cash 2 lower -->
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1" d="M64,66c10, 3, 12, 3, 20, 10l10, -16l-21, -5l-9, 10"></path>
                  </g>
          </svg>
          <span>Bids</span>
        </a>
        <a href="/#game-rates-page" class="footer-links">
          <svg class="footer-svg" viewBox="0 0 100 100">
                  <g stroke="#d4cbc7" fill="#d4cbc7">
                    <circle cx="50" cy="50" r="40" stroke-dasharray="15,5"fill="transparent" stroke-width="5"/>
                    <circle cx="50" cy="50" r="35" stroke-width="1"/>
                    <text fill="#1e1a1a" stroke="#1e1a1a" x="20" y="65"font-size="35">500</text>
                  </g>
          </svg>
          <span>Game Rates</span>
        </div>
        <a href="/#khabar-page" id="homeBtn" class="footer-home"><!--path d="M 20,80 
                            v-40 
                            c-5,5,-10,0,-5,-5 
                            l35,-30
                            l35,30
                            c5, 5, 0,10, -5, 5
                     v 40 h-20  v -30 h-20 v 30 z" /-->
          <svg width="35" height="35" viewBox="0 0 100 90">
                  <g stroke="#1e1a1a" fill="#1e1a1a">
                  <text stroke-width="5" font-size="50" x="12.5" y="65">-rt-</text>
                   
          </svg>
        </div>
        <a href="/#funds-page" class="footer-links">        
          <svg class="footer-svg" viewBox="0 0 100 100">
                  <g stroke="#d4cbc7" fill="#d4cbc7" stroke-width="1">
                    <rect x="10" y="80" rx="2" ry="2" width="80" height="10"></rect>
                    <rect x="15" y="73" rx="2" ry="2" width="20" height="4"></rect>
                    <rect x="65" y="73" rx="2" ry="2" width="20" height="4"></rect>
                    <rect x="20" y="40" rx="2" ry="2" width="10" height="30"></rect>
                    <rect x="70" y="40" rx="2" ry="2" width="10" height="30"></rect>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M10,38h80v-5l-40,-20l-40,20z"></path>
                    <text x="40" y="70" font-size="35">₹</text>
                    <rect x="35" rx="2" ry="2" height="4" width="30" y="28" fill="#1e1a1a"></rect>
                  </g>
                  
          </svg>
          <span>Funds</span>
        </a>
        <a href="/#profile-page" class="footer-links">
          <svg class="footer-svg" viewBox="0 0 100 100">
                  <g stroke="#d4cbc7" fill="#d4cbc7">
                    <circle cx="50" cy="30" r="20" stroke-width="1"/>
                    <path d="M10,70
                        A 45, 45, 0, 0, 0, 90 ,70
                        A 45, 45, 0, 0, 0, 70 ,50
                        A 40, 60 0, 0, 1, 30 ,50
                        A 45, 45, 0, 0, 0, 10 ,70z
                         " />                  
                  </g>
          </svg>
          <span>Account</span>
        </a>`;