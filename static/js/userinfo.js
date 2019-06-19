$(function () {
    // 获取当前用户信息
    $.ajax({
        url: host + "users/" + user.id + "/",
        type: 'get',
        contentType: 'application/json',
        headers:{
            "Authorization": "JWT "+ token
        },
        success: function (res) {
            $(".mdtb input").each(function () {
                $(this).val(res[$(this).attr("name")])
            });
            $(".mdtb label").html(res.organization);
            var labltbContent = "<tr><td>用户角色：</td><td>" + res.level + "</td></tr>;"
            labltbContent += "<tr><td>创建时间：</td><td>" + res.date_joined + "</td></tr>;"
            labltbContent += "<tr><td>最近登录：</td><td>" + res.last_login + "</td></tr>;"
            labltbContent += "<tr><td>小组人数：</td><td>" + res.group_count + "</td></tr>;"
            labltbContent += "<tr><td>小组客户：</td><td>" + res.total_customer_count + "</td></tr>;"
            labltbContent += "<tr><td>我的客户：</td><td>" + res.customer_count + "</td></tr>;"
            $(".lbltb").html(labltbContent)
        },
        error: function (e) {
            if (e.status == 401){
                alert("登录已超时，请重新登录..");
                window.location.href = "login.html";
            }
            alert("网络错误，稍后再试..");
        }
    });
    // 修改后
    $("#mdtb").submit(function (e) {
        e.preventDefault();
        var data = {};
        var t = $("#mdtb").serializeArray();
        $.each(t, function() {
            data[this.name] = this.value;
        });
        data["user"] = user.id;
        var jsonData = JSON.stringify(data);
        $.ajax({
            url: host + 'user/update/',
            type: "put",
            contentType: 'application/json',
            headers: {
                "Authorization": "JWT " + token
            },
            data: jsonData,
            success: function (res) {
                alert("修改成功！")
            },
            error: function (e) {
                alert("网络错误，修改失败...")
            }
        })

    });
});