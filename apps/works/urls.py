# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
from django.urls import path, re_path
from rest_framework import routers
from . import views

urlpatterns = [
    re_path(r'^subreply/(?P<wk>\d+)/$', views.CreateSubReplyView.as_view()),
]
#
router = routers.DefaultRouter()
router.register(r'works', views.WorkViewSet, base_name='works')
router.register(r'replies', views.ReplyWorkViewSet, base_name='reply')

urlpatterns += router.urls

