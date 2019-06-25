from django.db import models
from django.conf import settings

from utils.models import BaseModel


class Customer(BaseModel):
    name = models.CharField(max_length=50, unique=True, verbose_name="单位名称")
    nature = models.CharField(max_length=50, verbose_name="单位性质")
    industry = models.CharField(max_length=200, verbose_name="所属行业")
    area = models.CharField(max_length=200, verbose_name="所属地区")
    type = models.CharField(max_length=50, verbose_name="客户类型")
    business = models.CharField(max_length=50, verbose_name="业务类型")
    linkman = models.CharField(max_length=50, verbose_name="联系人")
    telephone = models.CharField(max_length=11, verbose_name="联系电话")
    variety = models.CharField(max_length=512, verbose_name="品种")
    account = models.TextField(verbose_name="开户/交易情况")
    situation = models.TextField(verbose_name="概况描述")

    capital = models.CharField(max_length=50, null=True, blank=True, verbose_name="资金规模")
    question = models.TextField(null=True, blank=True, verbose_name="企业问题")
    needs = models.TextField(null=True, blank=True, verbose_name="需求情况")
    difficulty = models.TextField(null=True, blank=True, verbose_name="开发难点")
    support = models.TextField(null=True, blank=True, verbose_name="支持需要")
    card = models.ImageField(upload_to=settings.IMAGE_URL, blank=True, null=True, verbose_name="选择名片")
    card_name = models.CharField(max_length=200, blank=True, null=True, verbose_name="名片原始名称")
    belong = models.ForeignKey("users.User", related_name="customers", null=True, blank=True, on_delete=models.SET_NULL, verbose_name="所属用户")
    delete = models.BooleanField(default=False, verbose_name="标记删除")

    class Meta:
        db_table = 'customers_customer'
        verbose_name = '客户'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name

