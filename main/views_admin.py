from django.shortcuts import render, redirect
from django.contrib.auth import logout as _logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required  
from django.views.generic.list import ListView
from django.views import View

from django.http import JsonResponse

from django.utils import timezone  
from .models import MatkaAdmin, MatkaUser, StarLine, RKDBet, GameBetTypes, Wallet, Transaction
import json

from .admin import UserChangeForm, UserCreationForm


admin_links = ['Master Settings', 'Time Master', 'Result Page', 'Rate Settings', 'Game History','Reverse Game Result', 'Game Cancel Option', 'News And Update', 'RKD Running Game', 'Balance Check', 'User Master', 'Buy Chips', 'Sell Chips', 'Deposite Report', 'Withdraw Report']

@login_required(login_url='/admin/login/')
def admin_dashboard(request):
	if request.user.is_admin:
		context = {
			'admin_links': admin_links,
			'summary': {
				'total_deposite_amount': sum([a['amount'] for a in Transaction.objects.filter(transaction_type="D", admin_check=True, paid=True).values()]), 	#	Total completed deposite transactions
				'total_pending_deposite_amount': sum([a['amount'] for a in Transaction.objects.filter(transaction_type="D", admin_check=False, paid=False).values()]),	#	Amount not checked by admin
				'total_withdraw_amount': sum([a['amount'] for a in Transaction.objects.filter(transaction_type="W", admin_check=True, paid=True).values()]),	#	Total of completed withdraw transactions
				'total_pending_withdraw_amount': sum([a['amount'] for a in Transaction.objects.filter(transaction_type="W", admin_check=False, paid=False).values()]),	#	amount not checked by admin

				'total_completed_bid_amount': sum([a['amount'] for a in Transaction.objects.filter(transaction_type="D", admin_check=True, paid=True).values()]),	#	Total completed deposite transactions
				'total_completed_win_amount': 0,
				'total_completed_bid_win_diffrence': 0,

				'total_running_bid_amount': sum([a['amount'] for a in Transaction.objects.filter(transaction_type="D", admin_check=True, paid=True).values()]),	#	Total completed deposite transactions
				'total_running_win_amount': 0,
				'total_running_bid_win_diffrence': 0,

				'total_users': len(MatkaUser.objects.filter(is_admin=False)),
				'allowed_users': len(MatkaUser.objects.filter(is_admin=False, is_active=True)),
				'blocked_users': len(MatkaUser.objects.filter(is_admin=False, is_active=False)),
				'game_active_users': len(MatkaUser.objects.filter(is_admin=False, is_active=True)),
				'game_inactive_users': len(MatkaUser.objects.filter(is_admin=False, is_active=False))
			},
		}



		return render(request, 'admin.html', context=context)
	else:
		return redirect('main:home')


def logout(request):
	_logout(request)
	return redirect('main:admin-dashboard')



def news_and_update(request):
	context = {
		'admin_links': admin_links,
		'summary': {
			'total_users': len(MatkaUser.objects.filter(is_admin=False)),
			'allowed_users': len(MatkaUser.objects.filter(is_admin=False, is_active=True)),
			'blocked_users': len(MatkaUser.objects.filter(is_admin=False, is_active=False)),
			'game_active_users': len(MatkaUser.objects.filter(is_admin=False, is_active=True)),
			'game_inactive_users': len(MatkaUser.objects.filter(is_admin=False, is_active=False))
		}
	}
	return render(request, 'admin.html', context)



class BasicListView(LoginRequiredMixin, ListView):
	p_keys = ['id']
	model = None
	page_title = ''
	view_config = {}
	admin_links = admin_links
	paginate_by = 25
	template_name = 'templates_admin/list_template.html'
	boolean_keys = ['active_account', 'status_open','status_close', 'admin_check', 'bid_won', 'admin_processed', 'paid']

	@property
	def model_data_filters(self):
		return [key for key in self.view_config.keys()]
	
	def get_queryset(self):
		return self.model.objects.all().values(*self.model_data_filters)

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)		# context['now'] = timezone.now()
		context['page_title'] = self.page_title
		context['view_config'] = self.view_config
		context['admin_links'] = self.admin_links
		return context


	def gather_inputs(self, operation):
		inp_obj = {}
		filter_obj = {}
		
		input_items = json.loads(self.request.body)
		for key in self.model_data_filters:
			if key in self.p_keys and operation == 'update':
				filter_obj[f'{key}'] = f'{input_items[key]}'
			else:
				inp_obj[f'{key}'] = f'{input_items[key]}'
			
			if key in self.boolean_keys:
				inp_obj[f'{key}'] = True if input_items[f'{key}'] == 'True' else False 
		return inp_obj, filter_obj


	def post(self, *args, **kwargs):
		if self.request.user.is_admin :
			inp_obj, filter_obj = self.gather_inputs(kwargs['operation'])
			# try:
			obj = None
			if kwargs['operation'] == 'add-new' and inp_obj['id'] == '#':
				del inp_obj['id']				
				obj = self.model.objects.create(**inp_obj)
				return JsonResponse({'success': 200, 'object': obj.id})

			if kwargs['operation'] == 'update':
				obj = self.model.objects.filter(**filter_obj).update(**inp_obj)
				return JsonResponse({'success': 200, 'object': obj })				
			# except:
			# 	return JsonResponse({'error': 'Operation Error!'})			
		else:
			return JsonResponse({'error': 'Operation not allowed!'})

	

	def delete(self, *args, **kwargs):
		if kwargs['operation'] == 'delete':
			try:
				input_items = json.loads(self.request.body)		
				self.model.objects.filter(id=input_items['id']).delete()
				return JsonResponse({'success': 200, 'message': 'success!'})
			except:
			 	return JsonResponse({'error': 'Record not found.'})
		return JsonResponse({'error': 'Operation error!'})





class MasterView(BasicListView, View):
	model = MatkaAdmin
	page_title = 'Master Settings'
	p_keys = ['id']
	view_config = {
		'id'	: 	'#', 
		'whatsapp': 'Support Number', 
		'short_name': 'Short Name', 
		'account_QR_image': 'Account QR Image', 
		'cc_acc_holder_name': 'Account Holder Name', 
		'cc_acc_no'		: 'Account Number',
		'cc_ifsc'		: 'IFSC', 
		'cc_bank_name'	: 'Bank Name', 
		'google_profile_id': 'Google Pay Profile ID',
		'active_account': 'active_account'
	}


class TimeMaster(BasicListView):
	model = StarLine
	page_title = 'Time Master'
	p_keys = ['id', 'name']
	view_config = {
		'id'				: '#',
		'name'				: 'Name',
		'open_result_time'	: 'Open Result Time',
		'open_bid_last_time': 'Open Bid Last Time',
		'close_result_time'	: 'Close Result Time', 
		'close_bid_last_time': 'Close Bid Last Time', 
		'status_open'		: 'Status Open',
		'status_close'		: 'Status Close'	
	}




class ResultPage(BasicListView):
	model = StarLine
	page_title = 'Result Page'
	p_keys = ['id', 'name']
	view_config = {
		'id': '#',
		'name': 'Name',		
		'first_pair': 'First Pair', 
		'first_digit': 'First Digit', 
		'second_digit': 'Second Digit', 
		'second_pair': 'Second Pair',
		'status_open': 'Open Status',
		'status_close': 'Close Status'
	}




class RateSetting(BasicListView):
	model = GameBetTypes
	page_title = 'Rate Settings'
	p_keys = ['id', 'title']
	view_config = {
		'id': '#',
		'title': 'Title',
		'digit_count': 'Digit Count',
		'unit_bet_amount': 'Unit Bet Amount',
		'win_amount': 'Win Amoun' 
	}




class GameHistory(BasicListView):
	model = RKDBet
	page_title = 'Game History'
	order_by = '-placed_on'
	p_keys = ['id', 'user', 'game']
	view_config = {
		'id': '#',
		'user': 'User',
		'game': 'Game',
		'bid_type': 'Bid Type',
		'bid_digit': 'Bid Digit',
		'amount': 'Amount',
		'placed_on': 'Placed On',
		'admin_check': 'Admin Check',
		'bid_won': 'Bid Win',
		'admin_processed': 'Admin Processed',
		'processed_on': 'Processed On'
	}




class ReverseGameResult(BasicListView):
	model = RKDBet
	page_title = 'Reverse Game Result'
	p_keys = ['id', 'user', 'game']
	view_config = {
		'id': '#',
		'user': 'User',
		'game': 'Game',
		'bid_type': 'Bid Type',
		'bid_digit': 'Bid Digit',
		'amount': 'Amount',
		'placed_on': 'Placed On',
		'admin_check': 'Admin Check',
		'bid_won': 'Bid Win',
		'admin_processed': 'Admin Processed',
		'processed_on': 'Processed On'
	}


class GameCancelOption(BasicListView):
	model = RKDBet
	page_title = 'Game Cancel Option'
	p_keys = ['id', 'user', 'game']
	view_config = {
		'id': '#',
		'user': 'User',
		'game': 'Game',
		'bid_type': 'Bid Type',
		'bid_digit': 'Bid Digit',
		'is_active': 'Bid Status',
		'amount': 'Amount',
		'placed_on': 'Placed On',
		'admin_check': 'Admin Check',
		'bid_won': 'Bid Win',
		'admin_processed': 'Admin Processed',
		'processed_on': 'Processed On'
	}

	def get_queryset(self):
		return self.model.objects.all().values(*self.model_data_filters)



class RKDRunningGame(BasicListView):
	model = RKDBet
	page_title = 'RKD Running Game'
	p_keys = ['id', 'user', 'game']
	view_config = view_config = {
		'id': '#',
		'user': 'User',
		'game': 'Game',
		'bid_type': 'Bid Type',
		'bid_digit': 'Bid Digit',
		'amount': 'Amount',
		'placed_on': 'Placed On',
		'admin_check': 'Admin Check',
		'bid_won': 'Bid Win',
		'admin_processed': 'Admin Processed',
		'processed_on': 'Processed On'
	}

	def get_queryset(self):
		return self.model.objects.filter(is_active=True).values(*self.model_data_filters)



class BalanceCheck(BasicListView):
	model = Wallet
	page_title = 'Balance Check'
	p_keys = ['id', 'user']
	view_config = {
		'id': '#',
		'user': 'user',
		'balance': 'Balance',
		'temp_bid_balance': 'Bid Balance', 
		'temp_trans_balance': 'Transaction Balance'
	}




class UserMaster(BasicListView):
	model = MatkaUser
	page_title = 'User Master'
	p_keys = ['id', 'mobile']
	form = UserChangeForm
	view_config = {
		'id': '#',
		'username': 'Name',
		'mobile': 'Mobile Number',
		'unhashed_pass': 'unhashed_pass',
		'is_admin': 'is_admin',
		'is_active': 'is_active',
	}

	def get_queryset(self):
		return self.model.objects.filter(is_admin=False).values(*self.model_data_filters)

	def post(self, *args, **kwargs):
		if self.request.user.is_admin :
			inp_obj, filter_obj = self.gather_inputs(kwargs['operation'])
			# try:
			obj = None
			
			if kwargs['operation'] == 'add-new' and inp_obj['id'] == '#':
				inp_obj['password1'] = inp_obj['unhashed_pass']	
				inp_obj['password2'] = inp_obj['unhashed_pass']
				del inp_obj['unhashed_pass']
				new_user_form = UserCreationForm(inp_obj)
				print(new_user_form)
				if new_user_form.is_valid():
					user = new_user_form.save()			# update_session_auth_hash(request, user)
					wllt = Wallet.objects.create(user=user)
					return JsonResponse({'success': True, 'message': str(user.mobile)+ 'created successfully.'})

			if kwargs['operation'] == 'update':
				password = inp_obj['unhashed_pass']

				print(password)
				del inp_obj['unhashed_pass']

				user_id = self.model.objects.filter(**filter_obj).update(**inp_obj)

				user = MatkaUser.objects.get(id=user_id)
				user.set_password(password)
				user.unhashed_pass = password
				print(user.password)
				user.save()
				if user:
					return JsonResponse({'success': True, 'message': str(user.mobile)+ 'updated successfully.'})
			return JsonResponse({'error': 'Invalid form data!'})			
		else:
			return JsonResponse({'error': 'Operation not allowed!'})



class BuyChips(BasicListView):
	model = Transaction
	page_title = 'Buy Chips'
	p_keys = ['id', 'user', 'amount']
	view_config = {
		'id'			: 	'#', 
		'transaction_type': 'Type', 
		'method_name'	: 'Method', 
		'amount'		: 'Amount', 
		'user'			: 'User', 
		'started_on'	: 'Started On',
		'paid'			: 'Paid',

	}

	def get_queryset(self):
		return self.model.objects.filter(transaction_type="D", admin_check=False, paid=False).values(*self.model_data_filters)


class SellChips(BasicListView):
	model = Transaction
	page_title = 'Sell Chips'
	p_keys = ['id', 'user', 'amount']
	view_config = {
		'id'			: 	'#', 
		'transaction_type': 'Type', 
		'method_name'	: 'Method', 
		'amount'		: 'Amount', 
		'user'			: 'User', 
		'started_on'	: 'Started On',
		'comleted_on'	: 'Completed On', 
		'paid'			: 'Paid',
		'admin_check'	: 'Admin Check', 

	}

	def get_queryset(self):
		return self.model.objects.filter(transaction_type="W", admin_check=False, paid=False).values(*self.model_data_filters)

	def delete(self):
		return JsonResponse({'error': 'Operation not allowed!'})



class DepositeReport(BasicListView):
	model = Transaction
	page_title = 'Deposite Report'
	p_keys = ['id', 'user', 'amount']
	view_config = {
		'id'			: 	'#', 
		'transaction_type': 'Type', 
		'method_name'	: 'Method', 
		'amount'		: 'Amount', 
		'user'			: 'User', 
		'started_on'	: 'Started On',
		'comleted_on'	: 'Completed On', 
		'paid'			: 'Paid',
		'admin_check'	: 'Admin Check', 

	}
	
	def get_queryset(self):
		return self.model.objects.filter(transaction_type="D", admin_check=True, paid=True).values(*self.model_data_filters)

	def delete(self):
		return JsonResponse({'error': 'Operation not allowed!'})


class WithdrawReport(BasicListView):
	model = Transaction
	page_title = 'Withdraw Report'
	p_keys = ['id', 'user', 'amount']
	view_config = {
		'id'			: 	'#', 
		'transaction_type': 'Type', 
		'method_name'	: 'Method', 
		'amount'		: 'Amount', 
		'user'			: 'User', 
		'started_on'	: 'Started On',
		'comleted_on'	: 'Completed On', 
		'paid'			: 'Paid',
		'admin_check'	: 'Admin Check', 

	}

	def get_queryset(self):
		return self.model.objects.filter(transaction_type="W", admin_check=True, paid=True).values(*self.model_data_filters)

	def delete(self):
		return JsonResponse({'error': 'Operation not allowed!'})



