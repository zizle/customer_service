import logging
import datetime
from django.db import connection
from django.db.models import Count
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter

from .serializers import CustomerSerializer
from .models import Customer
from users.models import User
from works.models import Work
logger = logging.getLogger('django')


class CustomerViewSet(ModelViewSet):
    """客户视图集"""
    permission_classes = [IsAuthenticated]  # 认证的才能访问
    serializer_class = CustomerSerializer
    # 排序  url带上参数?ordering= [+/- [ordering_fields]]  +-号表示升序和降序
    filter_backends = [OrderingFilter]
    ordering_fields = ("update_time",)
    users_set = []  # 本用户的所有子孙用户

    def update(self, request, *args, **kwargs):
        now = datetime.datetime.now()
        # 变为字符串
        now_str = datetime.datetime.strftime(now, "%Y%m%d")
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        customer_update_time = instance.update_time
        customer_update_time_str = datetime.datetime.strftime(customer_update_time, "%Y%m%d")
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        # 不能修改非己客户
        request_user = request.user
        if request_user != instance.belong:
            return Response({"message": "不能修改他人的客户信息！", "status": 409})
        # 判断时间，再决定是否给予更新信息
        if now_str != customer_update_time_str:
            return Response({"message": "无法修改信息,请求授权修改！", "status": 403})
        self.perform_update(serializer)
        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}
        return Response(serializer.data)

    def get_queryset(self):
        # customers = []  # 客户查询集
        # customers = QuerySet()
        user = self.request.user
        self.users_set.clear()
        # self.users_set.append(user)
        self.get_users(user)
        customers = Customer.objects.filter(belong=user, delete=False)
        for user in self.users_set:
            # customers += Customer.objects.filter(belong_id=user.id).all()
            customers = customers | Customer.objects.filter(belong=user, delete=False)
        return customers

    def get_users(self, user):
        subs = user.subs.all()
        if not subs:
            return
        for user in subs:
            self.users_set.append(user)
            self.get_users(user)


class UserCustomerListView(ListAPIView):
    """查询指定用户的客户"""
    serializer_class = CustomerSerializer
    # 排序  url带上参数?ordering= [+/- [ordering_fields]]  +-号表示升序和降序
    filter_backends = [OrderingFilter]
    ordering_fields = ("update_time",)

    def get_queryset(self):
        uid = self.request.query_params.get("uid")
        if uid:
            # print(type(uid))
            try:
                u_id = int(uid)
                user = User.objects.get(id=u_id)
            except Exception as e:
                logging.error("获取用户时查询参数错误。{}".format(e))
                return []
        else:
            user = self.request.user
        return Customer.objects.filter(belong=user, delete=False)


class DeleteCustomerView(APIView):

    def put(self, request, cid):
        customer = Customer.objects.get(id=cid)
        customer.delete = True
        customer.save()
        return Response({"data": "删除成功", "status": "204"})


class GiveCustomerView(APIView):
    def put(self, request):
        try:
            cid = int(request.data.get("cid"))
            uid = int(request.data.get("uid"))
            customer = Customer.objects.get(id=cid)
            to_user = User.objects.get(id=uid)
            customer.belong = to_user
        except Exception as e:
            return Response({"data": "转赠失败", "status": 400})
        else:
            customer.save()
            return Response({"data": "转赠成功", "status": 205})


class TimeCountCustomerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 查看当前登录用户,是公司管理员才给查询
        l = []
        user = request.user
        if user.level > 1:
            return Response({"message": "您不能查看时间报表", "data": l, "status": "403"})
        try:
            select = {"day": connection.ops.date_trunc_sql("day", "create_time")}
            cs = Customer.objects.extra(select=select).values('day').annotate(csct=Count("id"))
            wk = Work.objects.extra(select=select).values('day').annotate(wkct=Count("id"))
        except Exception as e:
            logger.error("时间分组计数失败{}".format(e))
            return Response({"message": "查询失败，暂无数据。", "data": l, "status": "503"})
        if not cs:
            return Response({"message": "查询成功，暂无数据。", "data": l, "status": "503"})
        begin = cs.first().get('day')
        cs_end = cs.last().get("day")
        wk_end = wk.last().get("day")
        end = cs_end if cs_end >= wk_end else wk_end
        for i in range((end-begin).days + 1):
            d = {}
            day = begin + datetime.timedelta(days=i)
            d['day'] = day
            d['csct'] = 0
            d['wkct'] = 0
            for c in cs:
                if day == c.get("day"):
                    d["csct"] = c.get("csct")
            for w in wk:
                if day == w.get("day"):
                    d['wkct'] = w.get("wkct")
            if d['csct'] or d['wkct']:
                l.append(d)
        # l.reverse()
        return Response({"message": "查询成功！", "data": l, "status": "200"})


class TypeCustomerView(APIView):
    permission_classes = [IsAuthenticated]
    users_set = list()

    def get(self, request):
        user = request.user
        self.users_set.clear()
        self.get_users(user)
        customers = self.get_users_customers(user)  # 当前用户及其子用户客户查询集

        request_data = request.query_params
        type = request_data["type"]
        business = request_data["business"]
        variety = request_data["variety"] if request_data["variety"] else "不限"
        area = request_data["area"] if request_data["area"] else "不限"
        # 构造查询字典
        search_dict = dict()
        if type != "不限":
            search_dict["type"] = type
        if business != "不限":
            search_dict["business"] = business
        # if variety != "不限":
        #     search_dict["variety"] = variety

        # 传入查询字典查询
        customers = customers.filter(**search_dict)
        # 再分地区模糊查询
        if area != "不限":
            search_dict["area"] = area
            customers = customers.filter(area__contains=area)
        if variety != "不限":
            # 品种过滤
            finally_customer_set = []
            for customer in customers:
                if str(variety) in customer.variety.split(','):
                    finally_customer_set.append(customer)
        else:
            finally_customer_set = customers
        serializer = CustomerSerializer(instance=finally_customer_set, many=True)
        return Response({"data": serializer.data, "message": "查询成功", "search": search_dict, "status": 200})

    def get_users_customers(self, user):
        """获取用户及其子用户的客户查询集"""
        customers = Customer.objects.filter(belong=user, delete=False)
        for user in self.users_set:
            customers = customers | Customer.objects.filter(belong=user, delete=False)
        return customers

    def get_users(self, user):
        subs = user.subs.all()
        if not subs:
            return
        for user in subs:
            self.users_set.append(user)
            self.get_users(user)


class BelongView(APIView):
    def get(self, request, cid):
        try:
            cid = int(cid)
        except Exception as e:
            return Response({"data": None, "status": "400", "message": "请求参数错误..."})
        customer = Customer.objects.get(id=cid)
        user = customer.belong
        return Response({"data": user.id, "status": "200", "message": "OK"})





