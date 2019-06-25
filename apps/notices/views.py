from rest_framework.generics import ListAPIView, UpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated

from .serializers import NoticeSerializer, UpdateStatusSerializer
from .models import Notice

class NoticeListView(ListAPIView):
    serializer_class = NoticeSerializer
    # 排序  url带上参数?ordering= [+/- [ordering_fields]]  +-号表示升序和降序
    filter_backends = [OrderingFilter]
    ordering_fields = ("create_time",)

    def get_queryset(self):
        user = self.request.user
        return Notice.objects.filter(receiver=user)


class NoticeUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateStatusSerializer
    queryset = Notice.objects.all()


class NoticeCount(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if not user:
            return Response({"data": None})
        count = user.receives.filter(status=False).count()
        return Response({"data": count})


# class CreateAuthorizeUpdateCustomerNotice(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def post(self, request):
#         # 请求者(要求授权)
#         user = request.user
#         # 接收者(接受授权与否)
#         parent = user.parent
#         # 请求修改的客户
#         cid = request.data.get("cid")
#         customer = Customer.objects.get(id=cid)
#         notice = Notice(
#             type=1,
#             sender=user,
#             receiver=parent,
#             content="客户<p>" + customer.name + "</p>信息修改待授权。",
#             customer=customer,
#             status=False
#         )
#         notice.save()
#         serializer = NoticeSerializer(instance=notice)
#         return Response({"data": serializer.data, "message": "发送请求成功!"})
#
#





