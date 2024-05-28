from django.urls import path, include

from .views import home, login, logout, register, get_user_data, change_password 
from .views import place_bid, payment_processed, init_deposite_transaction

from .views_admin import admin_dashboard


app_name = "main"


urlpatterns = [
    path('', home, name="home"),
    path('<str:file_name>', home, name="files"),
    path('login/', login, name='login'),
    path('logout/', logout, name="logout"),
    path('register/', register, name='register'),
    path('add-bid/', place_bid, name='add-bid'),
    path('add-token/', payment_processed, name='add-token'),
    path('user-details/', get_user_data, name='user-details'),
    path('change-password/', change_password, name='change-password'),
    path('deposite-request/', init_deposite_transaction, name='deposite-request'),

    path('admin-dashboard/', include('main.urls_admin')),
]
