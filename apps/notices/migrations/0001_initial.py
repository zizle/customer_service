# Generated by Django 2.1.1 on 2019-06-25 14:05

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('customers', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notice',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_time', models.DateTimeField(auto_now_add=True, verbose_name='加入时间')),
                ('update_time', models.DateTimeField(auto_now=True, verbose_name='更新时间')),
                ('type', models.SmallIntegerField(choices=[(1, '客户类'), (2, '部门类'), (3, '通知类'), (4, '授权类')], verbose_name='消息类型')),
                ('status', models.BooleanField(default=False, verbose_name='阅读状态')),
                ('content', models.CharField(max_length=100, verbose_name='消息内容')),
                ('delete', models.BooleanField(default=False, verbose_name='标记删除')),
                ('customer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='customers.Customer', verbose_name='关于客户')),
            ],
            options={
                'verbose_name': '消息',
                'verbose_name_plural': '消息',
                'db_table': 'notices_notice',
            },
        ),
    ]
