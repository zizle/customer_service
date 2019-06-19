$(function () {
    $("#psForm").submit(function (e) {
        e.preventDefault();
        var data = {};
        var t = $("#psForm").serializeArray();
        $.each(t, function() {
            data[this.name] = this.value;
        });
        var jsonData = JSON.stringify(data);
        if (data.new != data.newAgain){
            alert("两次输入密码不一致！");
            return
        }
        if (data.old == data.new){
            alert("新密码与旧密码不能一致！");
            return
        }
        // TODO 发起请求修改密码
        $.ajax({
            url: host + "users/password/",
            type: 'post',
            contentType: "application/json",
            data:jsonData,
            headers:{
              "Authorization": "JWT " + token
            },
            success:function (res) {
                if (res.active){
                    alert(res.message)
                    window.location.href = "login.html";
                }else{
                    alert(res.message)
                }
            },
            error:function (e) {
                alert("网络错误..请重试！")

            }
            })
    });

    $("#psForm .cancel").click(function () {
        window.location.href = "index.html";

    })
});