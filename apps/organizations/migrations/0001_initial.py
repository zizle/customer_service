# Generated by Django 2.1.1 on 2019-07-01 09:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('customers', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Cooperation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_time', models.DateTimeField(auto_now_add=True, verbose_name='加入时间')),
                ('update_time', models.DateTimeField(auto_now=True, verbose_name='更新时间')),
                ('content', models.CharField(max_length=255, verbose_name='协作内容')),
                ('effective', models.BooleanField(default=True, verbose_name='是否有效')),
                ('status', models.SmallIntegerField(choices=[(0, '未读'), (1, '通过'), (-1, '驳回')], default=0, verbose_name='状态')),
                ('text_1', models.CharField(blank=True, max_length=128, null=True, verbose_name='备用1')),
                ('text_2', models.CharField(blank=True, max_length=128, null=True, verbose_name='备用2')),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='customers.Customer', verbose_name='客户')),
            ],
            options={
                'verbose_name': '部门协作',
                'verbose_name_plural': '部门协作',
                'db_table': 'organizations_cooperation',
            },
        ),
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_time', models.DateTimeField(auto_now_add=True, verbose_name='加入时间')),
                ('update_time', models.DateTimeField(auto_now=True, verbose_name='更新时间')),
                ('name', models.CharField(max_length=50, unique=True, verbose_name='部门名称')),
                ('is_active', models.BooleanField(default=True, verbose_name='是否启用')),
                ('text_1', models.CharField(blank=True, max_length=128, null=True, verbose_name='备用1')),
                ('text_2', models.CharField(blank=True, max_length=128, null=True, verbose_name='备用2')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='organizations.Organization', verbose_name='所属组织')),
            ],
            options={
                'verbose_name': '部门和小组',
                'verbose_name_plural': '部门和小组',
                'db_table': 'organizations_organization',
            },
        ),
    ]
