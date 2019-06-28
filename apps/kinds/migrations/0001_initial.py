# Generated by Django 2.1.1 on 2019-06-28 09:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ChangeLib',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_time', models.DateTimeField(auto_now_add=True, verbose_name='加入时间')),
                ('update_time', models.DateTimeField(auto_now=True, verbose_name='更新时间')),
                ('name', models.CharField(max_length=20, verbose_name='交易所')),
                ('is_active', models.BooleanField(default=True, verbose_name='是否启用')),
                ('text_1', models.CharField(blank=True, max_length=128, null=True, verbose_name='备用1')),
                ('text_2', models.CharField(blank=True, max_length=128, null=True, verbose_name='备用2')),
            ],
            options={
                'verbose_name': '交易所',
                'verbose_name_plural': '交易所',
                'db_table': 'kinds_change_lib',
            },
        ),
        migrations.CreateModel(
            name='Kind',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_time', models.DateTimeField(auto_now_add=True, verbose_name='加入时间')),
                ('update_time', models.DateTimeField(auto_now=True, verbose_name='更新时间')),
                ('name', models.CharField(max_length=20, verbose_name='品种')),
                ('is_active', models.BooleanField(default=True, verbose_name='是否启用')),
                ('text_1', models.CharField(blank=True, max_length=128, null=True, verbose_name='备用1')),
                ('text_2', models.CharField(blank=True, max_length=128, null=True, verbose_name='备用2')),
                ('change_lib', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='kinds', to='kinds.ChangeLib', verbose_name='所属交易所')),
            ],
            options={
                'verbose_name': '品种',
                'verbose_name_plural': '品种',
                'db_table': 'kinds_kind',
            },
        ),
    ]
