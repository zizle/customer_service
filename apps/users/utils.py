# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle
import datetime
from .serializers import UserBaseInfoSerializer


def jwt_response_handler(token, user=None, request=None):
    """自定义jwt验证成功返回的数据"""
    serializer = UserBaseInfoSerializer(instance=user)
    data = serializer.data
    data["token"] = token
    if user.pre_login:
        data["pre_login"] = datetime.datetime.strftime(user.pre_login, "%Y-%m-%d %H:%M:%S")  # 格式化时间
    else:
        data["pre_login"] = ""

    return data
