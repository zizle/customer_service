# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
from notices.models import Notice


def create_notice(type, sender, receiver, content, customer=None, status=False):
    notice = Notice(
        type=type,
        sender=sender,
        receiver=receiver,
        content=content,
        customer=customer,
        status=False
    )
    notice.save()
