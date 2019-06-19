# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle

from django.urls import path, re_path
from . import views

urlpatterns = [
    re_path(r'^kinds/$', views.KindsListView.as_view()),
]