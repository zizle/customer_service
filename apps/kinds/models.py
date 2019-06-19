from django.db import models
from utils.models import BaseModel


class Kind(BaseModel):
    name = models.CharField(max_length=20, verbose_name="品种")
    is_active = models.BooleanField(default=True, verbose_name="是否启用")

    class Meta:
        db_table = "kinds_kind"
        verbose_name = "品种"
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name
