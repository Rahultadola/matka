from django.shortcuts import render
from django.http import JsonResponse, FileResponse
from django.contrib.staticfiles import finders
from django.contrib.auth import authenticate, login as lg, logout as _logout, update_session_auth_hash
from django.views.decorators.csrf import csrf_protect


from .admin import UserCreationForm, UserChangeForm
from .models import MatkaUser, MatkaAdmin, GameBetTypes, Wallet, Transaction, StarLine, RKDBet as Bid
import json


from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required  

# Create your views here.


# Create your views here.

def home(request):
    try:
        admin = MatkaAdmin.objects.get(active_account=True)
    except:
        class adm():
            whatsapp = '7869997682'
            short_name = 'admin-rt-'
        admin = adm()
    return render(request, 'pwa/index.html', { 'admin_mobile': admin.whatsapp,	'admin_name': admin.short_name })


def notification_public_key(request):
	return JsonResponse({'public_key': 'e3s2434353drew34342322433f4d33sr4d3'})


registered_applications = []
def notification_register(request):
	if request.method == 'POST':
		req_body = json.loads(request.body)
		print("registration-body: ", req_body)
		registered_applications.append(req_body)
		return JsonResponse({'status': 201})
	return JsonResponse({'status': 401})

def send_notification(request):
	subscription = json.loads(request.body)
	print('send-noti-api : ', subscription)
	return JsonResponse({
		'title': 'Latest news Noti SUCCESS!',
		'content' : 'Noti success in application, yes you did it.'
	})




@csrf_protect
def withdraw_request(request):
	if request.user.is_authenticated :
		amount = int(json.loads(request.body)['amount'])
		wllt = Wallet.objects.filter(user=request.user).first()
		if wllt.temp_bid_balance >= 500 and amount >= 500:
			trans = Transaction.objects.create(transaction_type='W', amount=amount, user=request.user)
			if trans:
				wllt.temp_bid_balance -= amount
				wllt.save()
			return JsonResponse({'success': True,'message': 'We are processing your request.'})
		else:
			return JsonResponse({"error": "", "ok": False, "status": 408})
	return JsonResponse({"error": True,"message": "Invalid Request!", "ok": False, "status": 403})


def payment_processed(request):
	if request.method == 'POST' and request.user.is_authenticated :
		body = json.loads(request.body)
		print("Processed Txn :", body)

		tez_res = json.loads(body['details']["tezResponse"])
		amount = int(tez_res['amount'])

		if tez_res['Status'] != 'SUCCESS' and body['details']['Status'] != 'SUCCESS':
			return JsonResponse({'error': 'Transaction failed .'})

		if amount < 0:
			return JsonResponse({"error": "your are adding too high amount that computer cannot process.", "ok": False, "status": 505})
	
		wllt = Wallet.objects.get(user=request.user)
		# trans = Transaction.objects.create(transaction_type='D', method_name=body['methodName'], amount=amount, user=request.user)
		if trans:
			wllt.temp_bid_balance += amount
			wllt.transactions.add(trans)
			wllt.save()
			return JsonResponse({'status': 200, 'message': str(trans.tr) +' '+ str(trans.amount) +' request added.'})
		else:
			return JsonResponse({'error': 'error adding transaction.', 'ok': False, 'status': 505})
	return JsonResponse({'error': 'Method not allowed.'})



def place_bid(request):
	if request.method == 'POST' and request.user.is_authenticated :
		body = json.loads(request.body)
		print(body['bids'], len(body['bids']))	# return JsonResponse({'success': True})
		succes = 0
		for bd in body['bids']:
			# try:
			amount = int(bd['amount'])
			wllt = Wallet.objects.get(user=request.user)
			if wllt :
				if wllt.temp_bid_balance >= amount and amount > 0:
					sl = StarLine.objects.get(name=bd['game'])					# if sl and bd.time < sl.open_time or bd.time < sl.close_time: 						
					bid = Bid.objects.create(game=sl, bid_type=bd["bidType"], bid_digit=bd["bid"], amount=amount, bid_win_amount=0, user=request.user)
					if bid:
						wllt.temp_bid_balance -= bid.amount
						wllt.save()
						succes += 1
			# except:
			# succes -= 1 

		if succes > 0 and succes <= len(body['bids']):
			return JsonResponse({'status': 200, 'message': str(succes) +' bids added.'})
		else:
			return JsonResponse({'error': 'error placing bid.'})
	return JsonResponse({'error': 'Method not allowed.'})


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
	wallet = Wallet.objects.get(user=user)
	user_bids = Bid.objects.filter(user=user, is_active=True, admin_processed=False).order_by('-started_on')[:25]
	user_won_bids = Bid.objects.filter(user=user, admin_check=True, admin_processed=True).order_by('-started_on')[:25]
	depo_trans = Transaction.objects.filter(user=user, transaction_type='D').order_by('-started_on').values()[:25]
	widra_trans = Transaction.objects.filter(user=user, transaction_type='W').order_by('-started_on').values()[:25]
	
	try:
		admin = MatkaAdmin.objects.get(active_account=True)
		admin = {
			'mobile': admin.whatsapp,
			'name': admin.short_name,
			'profile_id': admin.google_profile_id, #7763-6916-7533
		}
	except:
		return {'error': 'Admin not found error.'}
	

	return {
		'admin': admin,
		'star_line_today': [sl for sl in StarLine.objects.all().order_by('id').values()],
		'bet_types' : [bt for bt in GameBetTypes.objects.all().values()],	
		'user': {
			'mobile': user.mobile,
			'username': user.username,
			'is_authenticated': True,
			'is_active': user.is_active,
			'notifications': [
				{
					'title': 'main-game-notification',
					'value': False
				},
				{
					'title': 'starline-notification',
					'value': False
				},
				{
					'title': 'Jackpot-notification',
					'value': False
				}
			]
		},
		'wallet': { 'temp_bid_balance': wallet.temp_bid_balance },
		'transactions': {			
			'deposite_transactions': [tr for tr in depo_trans],
			'withdraw_transactions': [tr for tr in widra_trans]
		},
		'won_bets': [{
				'game': bd.game.name,
				'bid_type': bd.bid_type,
				'bid_digit': bd.bid_digit,
				'amount': bd.amount,
				'is_verified': bd.admin_check,
				'is_win': bd.bid_won,
				'win_amount': bd.bid_win_amount,
				'is_paid': bd.admin_processed,
				'started_on': bd.started_on,
				'comleted_on': bd.comleted_on,
			} for bd in user_won_bids],
		'bids': [{
				'game': bd.game.name,
				'bid_type': bd.bid_type,
				'bid_digit': bd.bid_digit,
				'amount': bd.amount,
				'is_verified': bd.admin_check,
				'started_on':  bd.started_on,
				'comleted_on': bd.comleted_on,

			} for bd in user_bids]
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
			return JsonResponse({'error': 'Invalid credentials to login.'})
	return JsonResponse({'error': 'Method not allowed.'})



def change_password(request):
	if request.method == 'POST' and request.user.is_active and request.user.is_authenticated:
		body = json.loads(request.body)
		if body['new_password'] == body['confirm_password']:
			user = request.user
			user.set_password(body['new_password'])

			user.save()
			update_session_auth_hash(request, user)
			return JsonResponse({'success': True})

	return JsonResponse({'error': 'Method not allowed.'})
	
