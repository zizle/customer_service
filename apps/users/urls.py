# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
from rest_framework_jwt.views import obtain_jwt_token
from django.urls import path, re_path
from . import views

urlpatterns = [
    path(r'users/add/', views.CreateUserView.as_view()),
    path(r'login/', obtain_jwt_token),
    # re_path(r'^users/(?P<user_id>\d+)/$', views.BaseInfoView.as_view())
    # path(r'users/active/', views.UserActiveView.as_view()),
    path(r'users/password/', views.ModifyPasswordView.as_view()),
    re_path(r'^users/(?P<pk>\d+)/$', views.RetrieveUserView.as_view()),
    path(r'user/update/', views.UpdateUserView.as_view()),
    path(r'user/subs/', views.SubUserListView.as_view()),
    path(r'users/', views.UsersView.as_view()),
    re_path(r'^user/(?P<pk>\d+)/$', views.UserGroupView.as_view()),
    path(r"user/leader/", views.GetUserLeaderView.as_view()),
    path(r"support/add/",views.CreateSupportView.as_view())
]

