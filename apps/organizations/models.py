from django.db import models
from utils.models import BaseModel


class Organization(BaseModel):
    name = models.CharField(max_length=50, unique=True, verbose_name="部门名称")
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.PROTECT, verbose_name="所属组织")
    is_active = models.BooleanField(default=True, verbose_name="是否启用")

    class Meta:
        db_table = 'organizations_organization'
        verbose_name = '部门和小组'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name


class Cooperation(BaseModel):
    STATUS = (
        (0, "未读"),
        (1, "通过"),
        (-1, "驳回"),
    )
    customer = models.ForeignKey("customers.Customer", null=True, blank=True, default=None, on_delete=models.SET_NULL, verbose_name='客户')
    sponsor = models.ForeignKey('users.User', on_delete=models.DO_NOTHING, verbose_name="协作发起者")
    organization = models.ForeignKey("Organization", on_delete=models.DO_NOTHING, verbose_name="协作方")
    content = models.CharField(max_length=255, verbose_name="协作内容")
    effective = models.BooleanField(default=True, verbose_name="是否有效")
    status = models.SmallIntegerField(choices=STATUS, default=0, verbose_name="状态")

    class Meta:
        db_table = 'organizations_cooperation'
        verbose_name = "部门协作"
        verbose_name_plural = verbose_name




