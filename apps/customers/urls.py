# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
from django.urls import path, re_path
from rest_framework import routers
from . import views
urlpatterns = [
    path(r'customers/user/', views.UserCustomerListView.as_view()),
    re_path(r'^customer/delete/(?P<cid>\d+)/$', views.DeleteCustomerView.as_view()),
    re_path(r'customer/give/$', views.GiveCustomerView.as_view()),
    path(r'customer/count/', views.TimeCountCustomerView.as_view()),
    path(r'customer/type/', views.TypeCustomerView.as_view()),
    re_path(r'customer/belong/(?P<cid>\d+)/$', views.BelongView.as_view())
]

router = routers.DefaultRouter()
router.register(r'customers', views.CustomerViewSet, base_name='customers')

urlpatterns += router.urls

