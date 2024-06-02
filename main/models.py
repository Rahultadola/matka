from django.db import models

from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
import datetime

class MatkaUserManager(BaseUserManager):
	def create_user(self, mobile, username, password=None):
		if not mobile:
			raise ValueError("Users must have an mobile number.")

		user = self.model(mobile=mobile, username=username)
		user.unhashed_pass = password

		user.set_password(password)
		user.save(using=self._db)
		return user

	def create_superuser(self, mobile, username, password=None):
		user = self.create_user(mobile=mobile,username=username,password=password)

		user.is_admin = True
		user.unhashed_pass = 'matka-rt'
		user.save(using=self._db)
		return user


class MatkaUser(AbstractBaseUser):
	mobile = models.PositiveIntegerField(verbose_name="Mobile Number", unique=True)
	username = models.CharField(max_length=50)
	is_active = models.BooleanField(default=True)
	is_admin = models.BooleanField(default=False)
	unhashed_pass = models.CharField(max_length=50, default='marka-rt')

	objects = MatkaUserManager()

	USERNAME_FIELD = 'mobile'
	REQUIRED_FIELDS = ['username']


	def __str__(self):
		return str(self.mobile)

	def __repr__(self):
		return str(self.mobile)

	def has_perm(self, perm, obj=None):
		return self.is_admin

	def has_module_perms(self, app_label):
		return self.is_admin

	@property
	def is_staff(self):
		return self.is_admin




class StarLine(models.Model):
	name = models.CharField(max_length=50)
	open_result_time = models.CharField(max_length=10)
	open_bid_last_time = models.CharField(max_length=10)
	close_result_time = models.CharField(max_length=10)
	close_bid_last_time = models.CharField(max_length=10)
	status_open = models.BooleanField(default=False)
	status_close = models.BooleanField(default=False)
	first_digit = models.CharField(max_length=1, default='*')
	first_pair = models.CharField(max_length=3, default='***')
	second_digit = models.CharField(max_length=1, default='*')
	second_pair = models.CharField(max_length=3, default='***')

	def __str__(self):
		return self.name


class GameBetTypes(models.Model):
	title = models.CharField(max_length=30)
	digit_count = models.PositiveIntegerField()
	img = models.CharField(max_length=1000)
	unit_bet_amount = models.PositiveIntegerField()
	win_amount = models.PositiveIntegerField()


class RKDBet(models.Model):
	user = models.ForeignKey('MatkaUser', on_delete=models.CASCADE)
	game = models.ForeignKey('StarLine', on_delete=models.CASCADE)
	bid_type = models.CharField(max_length=30)
	bid_digit =models.CharField(max_length=10)
	is_active = models.BooleanField(default=True)
	amount = models.PositiveIntegerField()
	admin_check = models.BooleanField(default=False)
	bid_won = models.BooleanField(default=False)
	bid_win_amount = models.PositiveIntegerField(default=0)
	admin_processed = models.BooleanField(default=False)
	started_on = models.DateTimeField(default=datetime.datetime.now)
	comleted_on = models.DateTimeField(null=True)


class Wallet(models.Model):
	balance = models.PositiveIntegerField(default=0)
	user = models.OneToOneField('MatkaUser', on_delete=models.CASCADE)
	transactions = models.ManyToManyField('Transaction', blank=True)
	temp_bid_balance = models.PositiveIntegerField(default=0)
	# temp_trans_balance = models.PositiveIntegerField(default=0)

	def __str__(self):
		return f'{self.user} - {self.balance}'


class Transaction(models.Model):
	transaction_type = models.CharField(max_length=1, choices=[('D', 'Deposite'), ('W', 'Withdraw')])
	method_name = models.CharField(max_length=100, null=True)
	amount = models.PositiveIntegerField()
	user = models.ForeignKey('MatkaUser', on_delete=models.CASCADE)
	started_on = models.DateTimeField(default=datetime.datetime.now)
	comleted_on = models.DateTimeField(null=True)
	admin_check = models.BooleanField(default=False)
	paid = models.BooleanField(default=False)



class MatkaAdmin(models.Model):
	active_account = models.BooleanField(default=False)
	whatsapp = models.PositiveIntegerField(verbose_name="Mobile Number", unique=True)
	short_name = models.CharField(max_length=20)
	account_QR_image = models.CharField(max_length=1000)

	cc_acc_holder_name = models.CharField(max_length=50)
	cc_acc_no = models.PositiveIntegerField()
	cc_ifsc = models.CharField(max_length=20)
	cc_bank_name = models.CharField(max_length=50)
	google_profile_id = models.CharField(max_length=50)

	def __str__(self):
		return f'{self.whatsapp} - {self.short_name}'


class Notifications(models.Model):
	img = models.CharField(max_length=200)
	heading = models.CharField(max_length=50)
	description = models.CharField(max_length=200)
	date_placed = models.DateTimeField(default=datetime.datetime.now)