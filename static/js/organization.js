$(function () {
    // 部门列表
    $.ajax({
        url: host + "organizations/",
        type: "get",
        contentType: "application/json",
        success: function (res) {
            // console.log(res);
            // setPagination(res.count);
            var orgUl = "";
            $.each(res, function (index, org) {
                orgUl += "<ul>";
                orgUl += "<li class='org'>" + org.name + "</li>";
                orgUl += "<li class='delete'>删除<input type='hidden' value="+ org.id +"></li>";
                orgUl += "<li class='createTime'>设立于 "+ org.create_time +"</li>";
                orgUl += "</ul>";
            });
            $(".organization .orgList").html(orgUl);
        },
        error: function (e){
            alert("网络错误，请重试")
        }
    });

    // 子用户用于新建部门，不分页
    $.ajax({
        url: host + 'users/',
        type: "get",
        contentType: 'application/json',
        headers: {
            "Authorization": "JWT " + token
        },
        success: function (res) {
            // console.log(res)
            $.each(res.results, function (index, user) {
                var username = user.real_name || user.username;
                $("#ogUser").append("<option value=" + user.id+ ">"+username+"</option>>")
            })
        },
        error: function (e) {
            console.log("请求用户失败" + e)
        }
    });

    $(".organization").on("click", ".delete", function () {
        var oid = $(this).children("input").val();
        var oname = $(this).prev(".org").html();
        var removetag = $(this).parent();
        if(confirm("确定删除<"+ oname+">?")){
            $.ajax({
            url: host + "organizations/" + oid + "/",
            type: "put",
            headers: {
                "Authorization": "JWT " + token
            },
            success: function (res) {
                alert(res.data);
                removetag.remove()
            },
            error: function () {
                alert("网络错误，请稍后再试")
            }
        })
        }
    });

    $(".addOrg .add").click(function () {
        var orgName = $(".addOrg input").val();
        var ogUser = $(".addOrg select").val();
        if (!orgName){
            alert("请填写部门名称！");
            return
        }
        if (!ogUser){
            alert("请选择负责人！")
            return
        }
        $.ajax({
            url: host + "organizations/add/",
            type: "post",
            contentType: 'application/json',
            data: JSON.stringify({
                name: orgName,
                user: ogUser
            }),
            headers: {
                "Authorization": "JWT " + token
            },
            success: function (res) {
                $(".addOrg input").val("");
                alert("添加成功");
                window.location.reload();
            },
            error: function (e) {
                alert("网络错误，请稍后再试..")
            }
        })
    });
});