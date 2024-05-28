from django.shortcuts import render
from django.http import JsonResponse, FileResponse
from django.contrib.staticfiles import finders
from django.contrib.auth import authenticate, login as lg, logout as _logout
from django.views.decorators.csrf import csrf_protect


from .admin import UserCreationForm, UserChangeForm
from .models import MatkaUser, MatkaAdmin, GameBetTypes, Wallet, Transaction, StarLine, RKDBet as Bid
import json


from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required  

# Create your views here.


def home(request, file_name=''):
	if file_name == '':
		return render(request, 'pwa/index.html', {})
	else:
		file=None
		
		if '.css' in file_name:
			file = finders.find('css/'+file_name)
		if '.js' in file_name:
			file = finders.find('js/'+file_name)
		if '.html' in file_name or '.json' in file_name:
			file = finders.find(file_name)
		if '.png' in file_name:
			file = finders.find('images/icons/'+file_name)
		if '.jpeg' in file_name:
			file = finders.find('images/'+file_name)
		if 'crown.png' in file_name:
			file = finders.find('images/'+file_name)
		try:
			return FileResponse(open(file, 'rb'))
		except:
			return JsonResponse({'error': 'File not found'})




# def vapid_public_key(request):
# 	public_key = 'e3s2434353drew34342322433f4d33sr4d3'
# 	return JsonResponse({'public_key': public_key})

# def register_notification(request):
# 	if request.method == 'POST':
# 		return HTTPResponse(201)

# def send_notification(request):
# 	subscription = json.loads(request.body)
# 	return JsonResponse({ 'is_new': True, 'notifications': Notification.objects.filter() })



@csrf_protect
def withdraw_request(request):
	if trans.transaction_type == 'Withdraw':
		wllt = Wallet.objects.filter(user=request.user).first()
		if wllt.temp_trans_balance > 50 and amount > 0:
			wllt.temp_trans_balance -= amount
			wllt.save()
			return JsonResponse({'message': 'we are processing your request.'})
		else:
			#TODO:if bid amount is -ve then redirect to deposite
			return JsonResponse({"err": "", "ok": False, "status": 505})
	return JsonResponse({"err": True,"message": "Invalid Request!", "ok": False, "status": 505})


def payment_processed(request):
	if request.method == 'POST' and request.user.is_authenticated :
		body = json.loads(request.body)
		print("Processed Txn :", body)

		tez_res = json.loads(body['details']["tezResponse"])
		amount = int(tez_res['amount'])

		if tez_res['Status'] != 'SUCCESS' and body['details']['Status'] != 'SUCCESS':
			return JsonResponse({'err': 'Transaction failed .'})

		if amount < 0:
			return JsonResponse({"err": "your are adding too high amount that computer cannot process.", "ok": False, "status": 505})
	
		wllt = Wallet.objects.get(user=request.user)
		# trans = Transaction.objects.create(transaction_type='D', method_name=body['methodName'], amount=amount, user=request.user)
		if trans:
			wllt.temp_trans_balance += amount
			wllt.transactions.add(trans)
			wllt.save()
			return JsonResponse({'status': 200, 'message': str(trans.tr) +' '+ str(trans.amount) +' request added.'})
		else:
			return JsonResponse({'err': 'error adding transaction.', 'ok': False, 'status': 505})
	return JsonResponse({'err': 'Method not allowed.'})



def place_bid(request):
	if request.method == 'POST' and request.user.is_authenticated :
		body = json.loads(request.body)
		print(body['bids'], len(body['bids']))

		return JsonResponse({'success': True})
		succes = 0
		for bd in body['bids']:
			try:
				amount = int(bd['amount'])
				wllt = Wallet.objects.get(user=request.user)
				if wllt :
					if wllt.temp_bid_balance >= amount and amount > 0:
						sl = StarLine.objects.get(name=bd['game'])
						if sl and bd.time < sl.open_time or bd.time < sl.close_time: 						
							bid = Bid.objects.create(sl, bid_type=bd["type"], bid_digit=bd["bid"], amount=amount, user=request.user)
							if bid:
								wllt.temp_bid_balance -= bid.amount
								wllt.save()
								succes += 1
			except:
				succes -= 1 

		if succes > 0 and succes <= len(body['bids']):
			return JsonResponse({'status': 200, 'message': str(succes) +' bids added.'})
		else:
			return JsonResponse({'err': 'error placing bid.'})
	return JsonResponse({'err': 'Method not allowed.'})


def init_deposite_transaction(request):
	# return JsonResponse({'error': 'Unable to process request.'})
	if request.method == 'POST' and request.user.is_authenticated:
		body = json.loads(request.body)
		print("Processed Txn :", body)
		trans = Transaction.objects.create(transaction_type='D', amount=int(body['amount']), user=request.user)
		if trans:
			return JsonResponse({
				'success': True,
				'transaction_type' : trans.transaction_type,
				'amount': trans.amount,
				'date' : trans.started_on,
				'is_paid': trans.paid,
				'verified': trans.admin_check,
			})
		else:
			return JsonResponse({'error': 'Unable to process request.'})	
	else:
		return JsonResponse({'error': 'Unable to process request.'})



def user_details(user):
	admin = None
	try:
		admin = MatkaAdmin.objects.get(active_account=True)
		admin = {
			'mobile': admin.whatsapp,
			'name': admin.short_name,
			'profile_id': admin.google_profile_id, #7763-6916-7533
		}
	except:
		return {'error': 'Admin not found error.'}
	
	wallet = Wallet.objects.get(user=user)
	user_bids = Bid.objects.filter(user=user)
	user_won_bids = Bid.objects.filter(user=user, bid_won=True)
	depo_trans = Transaction.objects.filter(user=user, transaction_type='D')[:20]
	widra_trans = Transaction.objects.filter(user=user, transaction_type='W')[:20]

	return {
		'admin': admin,
		'user': {
			'mobile': user.mobile,
			'username': user.username,
			'is_authenticated': True,
			'is_admin': user.is_admin,
			'is_active': user.is_active,
			'notifications': [
				{
					'title': 'main-game-notification',
					'value': True
				},
				{
					'title': 'starline-notification',
					'value': False
				},
				{
					'title': 'Jackpot-notification',
					'value': True
				}
			]
		},
		'star_line_today': [{
				'name': sl.name,
				'open_result_time': sl.open_result_time,
				'open_bid_last_time': sl.open_bid_last_time,
				'close_result_time' :sl.close_result_time,
				'close_bid_last_time': sl.close_bid_last_time,
				'status_open' : sl.status_open,
				'status_close' : sl.status_close,
				'first_digit': sl.first_digit,
				'first_pair': sl.first_pair,
				'second_digit': sl.second_digit,
				'second_pair': sl.second_pair
			} for sl in StarLine.objects.all()
		],

		'transaction_details': {
			'total_amount': wallet.temp_trans_balance,
			'deposite_transactions': [{
				'transaction_type': tr.transaction_type,
				'method': tr.method_name,
				'amount': tr.amount,
				'date' :tr.started_on,
				'verified': tr.admin_check,
				'is_paid': tr.paid,
			} for tr in depo_trans],

			'withdraw_transactions': [{
				'amount': tr.amount,
				'tr_type' : tr.transaction_type,
				'date' :tr.occured_on,
				'verified': tr.admin_check,
				'is_paid': tr.paid,
				'method': tr.method_name
			} for tr in widra_trans]
		},
		'won_bets': [{
				'game': bd.game,
				'bid_type': bd.bid_type,
				'bid_digit': bd.bid_digit,
				'amount': bd.amount,
				'verified': bd.admin_check,
				'is_win': bd.bid_won,
				'paid': bd.admin_processed,
				'time_start': '',
				'time_update': '',
			} for bd in user_won_bids
		],
		'bid_details': {
			'wallet_balance': wallet.temp_bid_balance,
			'bids': [{
				'game': bd.game,
				'bid_type': bd.bid_type,
				'bid_digit': bd.bid_digit,
				'amount': bd.amount,
				'verified': bd.admin_check,
				'is_win': bd.bid_won,
				'paid': bd.admin_processed,
				'time_start': '',
				'time_update': '',

			} for bd in user_bids[:25]],
		},
		'bet_types' : [
			{
				'title': bt.title,
				'digit_count': bt.digit_count,
				'img': bt.img,
				'unitBetAmount': bt.unit_bet_amount,
				'winAmount': bt.win_amount
			} for bt in GameBetTypes.objects.all()]
			
		
	}



def get_user_data(request):
	if request.user and request.user.is_authenticated:
		return JsonResponse(user_details(request.user))


def logout(request):
	_logout(request)
	return JsonResponse({'status': 200, 'message': 'Logout success.'})


def register(request):
	if request.method == 'POST':
		body = json.loads(request.body)
		
		body['password1'] = body['pass']	
		body['password2'] = body['pass']
		del body['pass']

		add_form = UserCreationForm(body) #	print(add_form)
		if add_form.is_valid() :
			user = add_form.save()
			lg(request, user)
			wllt = Wallet.objects.create(user=user)
			return JsonResponse(user_details(request.user))
		else:
			return JsonResponse({'error': 'Invalid credentials to register.'})
	return JsonResponse({'error': 'Method not allowed.'})

				


def login(request):
	if request.method == 'POST':
		body = json.loads(request.body)
		user = authenticate(request, mobile=body['mobile'], password=body['pass'])

		if user is not None and user.is_active:
			lg(request, user)
			return JsonResponse(user_details(request.user))
		else:
			return JsonResponse({'error': f'{user}Invalid credentials to login.'})
	return JsonResponse({'error': 'Method not allowed.'})



def change_password(request):
	if request.method == 'POST' and request.user.is_active and request.user.is_authenticated:
		body = json.loads(request.body)
		body['password1'] = body['new_password'],
		body['password2'] = body['confirm_password'],

		mobile=request.user.mobile,
		username=request.user.username

		change_form = UserChangeForm(body)

		if change_form.is_valid():
			user = change_form.save()
			update_session_auth_hash(request, user)
			return JsonResponse({'success': True})

	return JsonResponse({'error': 'Method not allowed.'})
	# if body['new_password'] == body['confirm_password']:
	# 	user = request.user
	# 	user.set_password(body['new_password'])

	# 	user.save()
	# 	update_session_auth_hash(request, user)
	# 	return JsonResponse({'success': True})

