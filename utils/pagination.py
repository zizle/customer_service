# _*_ coding:utf-8 _*_
# company: RuiDa Futures
# author: zizle

from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 1

    page_size_query_param = 'page_size'

    max_page_size = 20
