from django.db import models
from django.conf import settings
from utils.models import BaseModel


class Work(BaseModel):
    """工作表"""
    customer = models.ForeignKey("customers.Customer", related_name="work", on_delete=models.CASCADE, verbose_name="所属客户")
    user = models.ForeignKey("users.User", null=True, blank=True, on_delete=models.CASCADE, verbose_name="所属用户")
    content = models.TextField(verbose_name="内容")
    file = models.FileField(upload_to=settings.FILES_URL, null=True, blank=True, verbose_name="选择附件")
    file_name = models.CharField(max_length=200, blank=True, null=True, verbose_name="附件原始名称")
    delete = models.BooleanField(default=False, verbose_name="标记删除")

    class Meta:
        db_table = 'works_work'
        verbose_name = '客户工作'
        verbose_name_plural = verbose_name


class ReplyWork(BaseModel):
    """回复表"""
    work = models.ForeignKey("Work", related_name="replies", on_delete=models.CASCADE, verbose_name="回复的工作")  # 属于哪条维护内容的子内容
    user = models.ForeignKey("users.User", null=True, blank=True, on_delete=models.CASCADE, verbose_name="回复发起者")
    content = models.TextField(verbose_name="内容")

    class Meta:
        db_table = 'works_reply'
        verbose_name = '客户工作回复'
        verbose_name_plural = verbose_name


class SubReplyWork(BaseModel):
    """子回复表"""
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, verbose_name="回复发起者")
    reply = models.ForeignKey('ReplyWork', related_name="subs", on_delete=models.CASCADE, verbose_name="所属回复")
    content = models.TextField(verbose_name="回复内容")
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name="subs", verbose_name="上级回复")

    class Meta:
        db_table = "works_sub_reply"
        verbose_name = "客户工作子回复"
        verbose_name_plural = verbose_name

