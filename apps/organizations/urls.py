# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
from django.urls import path, re_path
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    re_path(r'^organizations/(?P<oid>\d+)/$', views.DeleteOrganization.as_view()),
    path(r'organizations/', views.OrganizationListView.as_view()),
    path(r'organizations/add/', views.CreateOrganizationView.as_view()),
    path(r'cooperation/add/', views.CreateCooperationView.as_view()),
    path(r'organization/works/', views.OrganizationWorkListView.as_view()),
    re_path(r'^organization/works/(?P<wid>\d+)/$', views.UpdateOrganizationWork.as_view())
]