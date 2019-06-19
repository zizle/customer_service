from django.db import models
from utils.models import BaseModel


class Notice(BaseModel):
    TYPE = (
        (1, "客户类"),
        (2, "部门类"),
        (3, "通知类"),
        (4, "授权类"),
    )
    type = models.SmallIntegerField(choices=TYPE, verbose_name="消息类型")
    sender = models.ForeignKey('users.User', related_name='sends', on_delete=models.CASCADE, verbose_name="发布者")
    receiver = models.ForeignKey('users.User', related_name='receives',  null=True, on_delete=models.SET_NULL, verbose_name="接收者")
    customer = models.ForeignKey('customers.Customer', null=True, blank=True, on_delete=models.SET_NULL, verbose_name='关于客户')
    status = models.BooleanField(default=False, verbose_name='阅读状态')
    content = models.CharField(max_length=100, verbose_name='消息内容')
    delete = models.BooleanField(default=False, verbose_name="标记删除")

    class Meta:
        db_table = 'notices_notice'
        verbose_name = '消息'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.content
