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
    receiver = models.ForeignKey('users.User', related_name='receives', on_delete=models.CASCADE, verbose_name="接收者")
    customer = models.ForeignKey('customers.Customer',related_name='notices', null=True, blank=True, on_delete=models.CASCADE, verbose_name='关于客户')
    organization = models.ForeignKey('organizations.Organization', related_name='notices', null=True, blank=True, on_delete=models.CASCADE, verbose_name='关于部门')
    status = models.BooleanField(default=False, verbose_name='阅读状态')
    handled = models.BooleanField(default=False, verbose_name="是否处理")
    content = models.CharField(max_length=100, verbose_name='消息内容')
    delete = models.BooleanField(default=False, verbose_name="标记删除")
    text_1 =  models.CharField(max_length=128, null=True, blank=True, verbose_name="备用1")
    text_2 =  models.CharField(max_length=128, null=True, blank=True, verbose_name="备用2")

    class Meta:
        db_table = 'notices_notice'
        verbose_name = '消息'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.content
