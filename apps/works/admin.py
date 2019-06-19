from apps.admin import admin_site
from .models import Work, ReplyWork, SubReplyWork

admin_site.register(Work)
admin_site.register(ReplyWork)
admin_site.register(SubReplyWork)