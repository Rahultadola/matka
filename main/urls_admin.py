from django.urls import path, include

# from .views import home, login, logout, register, get_user_data, change_password 
# from .views import place_bid, payment_processed, init_deposite_transaction

from .views_admin import admin_dashboard, logout
from .views_admin import MasterView, TimeMaster, ResultPage, RateSetting, GameHistory
from .views_admin import ReverseGameResult, GameCancelOption, news_and_update, RKDRunningGame
from .views_admin import BalanceCheck, UserMaster, BuyChips, SellChips, DepositeReport, WithdrawReport

# app_name = "main"


urlpatterns = [
    path('', admin_dashboard, name="admin-dashboard"),
    path('logout/', logout, name="logout"),
    path('master-settings/', MasterView.as_view(), name="master-settings"),
    path('master-settings/<slug:operation>', MasterView.as_view(), name="ms-operations"),
    path('time-master/', TimeMaster.as_view(), name="time-master"),
    path('time-master/<slug:operation>', TimeMaster.as_view(), name="tm-operations"),
    path('result-page/', ResultPage.as_view(), name="result-page"),
    path('result-page/<slug:operation>', ResultPage.as_view(), name="rslt-operations"),
    path('rate-settings/', RateSetting.as_view(), name="rate-settings"),
    path('rate-settings/<slug:operation>', RateSetting.as_view(), name="rate-operations"),
    path('game-history/', GameHistory.as_view(), name="game-history"),
    path('game-history/<slug:operation>', GameHistory.as_view(), name="game-operations"),
    path('reverse-game-result/', ReverseGameResult.as_view(), name="reverse-game-result"),
    path('reverse-game-result/<slug:operation>', ReverseGameResult.as_view(), name="rgr-operations"),
    path('game-cancel-option/', GameCancelOption.as_view(), name="game-cancel-option"),
    path('game-cancel-option/<slug:operation>', GameCancelOption.as_view(), name="gco-operations"),
    path('rkd-running-game/', RKDRunningGame.as_view(), name="rkd-running-game"),
    path('rkd-running-game/<slug:operation>', RKDRunningGame.as_view(), name="rkd-rg-operations"),
    path('balance-check/', BalanceCheck.as_view(), name="balance-check"),
    path('balance-check/<slug:operation>', BalanceCheck.as_view(), name="balance-check"),
    path('user-master/', UserMaster.as_view(), name="user-master"),
    path('user-master/<slug:operation>', UserMaster.as_view(), name="user-master"),
    
    path('buy-chips/', BuyChips.as_view(), name="buy-chips"),
    path('buy-chips/<slug:operation>', BuyChips.as_view(), name="buy-chips"),
    path('sell-chips/', SellChips.as_view(), name="sell-chips"),
    path('sell-chips/<slug:operation>', SellChips.as_view(), name="sell-chips"),

    path('deposite-report/', DepositeReport.as_view(), name="deposite-report"),
    path('withdraw-report/', WithdrawReport.as_view(), name="withdraw-report"),
    path('news-and-update/', news_and_update, name="news-and-update"),
]
