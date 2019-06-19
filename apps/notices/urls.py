# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
from django.urls import path, re_path
from . import views

urlpatterns = [
    path(r'user/notices/', views.NoticeListView.as_view()),
    re_path(r'^notices/(?P<pk>\d+)/$', views.NoticeUpdateView.as_view()),
    path(r"notices/", views.NoticeCount.as_view()),
    # path(r"notices/authorize/", views.CreateAuthorizeUpdateCustomerNotice.as_view())
]

