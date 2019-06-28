from django.db import models
from django.contrib.auth.models import AbstractUser

from utils.models import BaseModel


class User(AbstractUser):
    LEVEL = (
        (0, "超级管理员"),
        (1, "公司管理员"),
        (2, "部门管理员"),
        (3, "小组管理员"),
        (4, "普通用户")
    )
    real_name = models.CharField(max_length=20, blank=True, verbose_name="姓名")
    mobile = models.CharField(max_length=11, blank=True, null=True, unique=True, verbose_name='手机号')
    organization = models.ForeignKey("organizations.Organization", related_name="users", blank=True, null=True, on_delete=models.SET_NULL, verbose_name="部门或小组")
    leader = models.BooleanField(default=False, verbose_name="部门或小组负责人")
    level = models.SmallIntegerField(choices=LEVEL, default=4, verbose_name="账号类型")
    parent = models.ForeignKey('self', related_name='subs', blank=True, null=True, on_delete=models.SET_NULL, verbose_name="父级用户")
    text_1 =  models.CharField(max_length=128, null=True, blank=True, verbose_name="备用1")
    text_2 =  models.CharField(max_length=128, null=True, blank=True, verbose_name="备用2")

    class Meta:
        db_table = 'users_user'
        verbose_name = '用户'
        verbose_name_plural = verbose_name
        get_latest_by = "id"

    def __str__(self):
        return self.real_name if self.real_name else self.username


class Support(BaseModel):
    STATUS = (
        (0, "未读"),
        (1, "通过"),
        (-1, "驳回"),
    )
    TYPE = (
        (1, "普通"),
        (2, "授权")
    )
    customer = models.ForeignKey("customers.Customer", related_name="leader_support", on_delete=models.CASCADE, verbose_name='客户')
    sponsor = models.ForeignKey('User', related_name='supports', on_delete=models.CASCADE, verbose_name="支持发起者")
    handler = models.ForeignKey('User', related_name='handled_supports', null=True, blank=True, on_delete=models.CASCADE, verbose_name="处理人")
    content = models.CharField(max_length=255, verbose_name="支持的内容")
    effective = models.BooleanField(default=True, verbose_name="是否有效")
    status = models.SmallIntegerField(choices=STATUS, default=0, verbose_name="状态")
    type = models.SmallIntegerField(choices=TYPE, default=1, verbose_name="支持类型")
    text_1 =  models.CharField(max_length=128, null=True, blank=True, verbose_name="备用1")
    text_2 =  models.CharField(max_length=128, null=True, blank=True, verbose_name="备用2")

    class Meta:
        db_table = 'users_support'
        verbose_name = "上级支持"
        verbose_name_plural = verbose_name

