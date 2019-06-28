from django.db import models
from utils.models import BaseModel

class ChangeLib(BaseModel):
    name = models.CharField(max_length=20, verbose_name="交易所")
    is_active = models.BooleanField(default=True, verbose_name="是否启用")
    text_1 =  models.CharField(max_length=128, null=True, blank=True, verbose_name="备用1")
    text_2 =  models.CharField(max_length=128, null=True, blank=True, verbose_name="备用2")

    class Meta:
        db_table = "kinds_change_lib"
        verbose_name = "交易所"
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name


class Kind(BaseModel):
    name = models.CharField(max_length=20, verbose_name="品种")
    change_lib = models.ForeignKey('ChangeLib', related_name='kinds', on_delete=models.CASCADE, verbose_name="所属交易所")
    is_active = models.BooleanField(default=True, verbose_name="是否启用")
    text_1 =  models.CharField(max_length=128, null=True, blank=True, verbose_name="备用1")
    text_2 =  models.CharField(max_length=128, null=True, blank=True, verbose_name="备用2")

    class Meta:
        db_table = "kinds_kind"
        verbose_name = "品种"
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name
