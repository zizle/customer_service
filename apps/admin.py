# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
from django.contrib import admin


class AdminSite(admin.AdminSite):
    site_header = "研究院机构开发与服务系统后台管理"
    site_title = '后台管理'


admin_site = AdminSite()
