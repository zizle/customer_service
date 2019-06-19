$(function () {
    // 绑定全局变量即将被操作的客户Id
    var optionCid;

    // 请求当前用户的所有子用户
    $.ajax({
        url: host + "user/subs/?page=1&page_size=" + pageSize,
        type: "get",
        contentType: 'application/json',
        headers: {
            "Authorization": "JWT " + token
        },
        success: function (res) {
            // 设置分页
            setPagination(res.count);
            var subAccounts = '';
            $.each(res.results, function (index, sub) {
                var username = sub.real_name || sub.username;
                subAccounts += "<ul class='user'><li class='name'>" + username + "</li>";
                subAccounts += "<li class='org'>" + sub.organization + "</li>";
                if(sub.customers.length){
                    subAccounts += "<li class='showCs'>客户↓</li></ul>";
                }else{
                    subAccounts += "<li class='showCs'></li></ul>";
                }
                // 遍历客户
                subAccounts += "<ul class='userCs'><li>";
                $.each(sub.customers, function (index, customer) {
                    subAccounts += "<ul> <input type='hidden' value=" + customer.id+ "><li class='csName'>"+ customer.name +"</li><li class='give'>转赠</li><li class='delete'>删除</li></ul>"
                });

                subAccounts += "</li></ul>"
            });
            $(".subAccount .subAccountList").html(subAccounts);

            // 事件
            $(".user").on("click", ".showCs", function () {
                $(this).parent().next().toggle("normal");
            });
            // 客户操作事件
            $(".userCs").on("click", ".give", function () {
                optionCid = $(this).prevAll("input").val();
                var cName = $(this).prev().html();
                // 改变转赠框标题
                $(".giveTo .title").html(cName + "将转予:" );
                $(".giveTo").show();
                $("#cover").show();
            });
            $(".userCs").on("click", ".delete", function () {
                var removetag = $(this).parent();
               var cName = $(this).prevAll(".csName").html();
               optionCid = $(this).prevAll("input").val();
                if(confirm("确定删除客户<"+ cName +">？")){  // 弹窗确定
                    $.ajax({
                        url: host + "customer/delete/" + optionCid + "/",
                        type: "put",
                        contentType: "application/json",
                        headers: {
                            "Authorization": "JWT " + token
                        },
                        data: JSON.stringify({"delete": true}),
                        success: function (res) {
                            if (res.status == 204){
                                alert("客户<"+ cName +">已删除！");
                                removetag.remove();
                            }else{
                                alert("删除失败")
                            }
                        },
                        error: function (e) {
                            if(e.status == 401){
                                alert("请登录确保您有删除权限")
                            }else{
                                alert("网络错误，删除失败..")
                            }
                        }
                    })
                }
            });



        },
        error: function (e) {
            if (e.status == 401){
                alert("登录信息无效..请重新登录")
                window.location.href="login.html"
            }else{
                 alert("网络错误，稍后再试")
            }
        }
    });

    // 请求所有部门, 不分页
    $.ajax({
        url: host + "organizations/",
        type: 'get',
        contentType: 'application/json',
        headers: {
            "Authorization": "JWT " + token
        },
        success: function (res) {
            // console.log(res)
            var ogContent = "";
            $.each(res, function (index, og) {
                ogContent += "<option value=" + og.id + ">"+ og.name  +"</option>";
            });
            $("#ogName").append(ogContent);

            // 联动部门人员
            $("#ogName").change(function () {
                var oid = $(this).find("option:selected").val();
                var userContent = "";
                $.each(res, function (index, og) {
                    $.each(og.users, function (index, user) {
                        var username = user.real_name || user.username;
                        if(user.organization == oid){
                            userContent += "<option value="+ user.id +">" + username + "</option>";
                        }
                    })
                });
                $("#oguser").html(userContent);  // 用替换免得更换部门又留着上次的结果
            })
        },
        error: function(e){
            if (e.status == 401){
                alert("登录已过期, 请重新登录");
                window.location.href = 'login.html'
            }else if(e.status==404){
                console.log("请求部门出错")
            }else{
                alert("网络错误请稍后再试")
            }
        }
    });

    $(".giveTo").submit(function (e) {
        e.preventDefault();
        // 获取赠予的对象
        var data = {};
        var t = $("#giveForm").serializeArray();
        $.each(t, function() {
            data[this.name] = this.value;
        });
        data["cid"] = optionCid;
        if(checkGives(data)){
            $.ajax({
                url: host + "customer/give/",
                type: "put",
                contentType: 'application/json',
                data: JSON.stringify(data),
                headers: {
                    "Authorization": "JWT " + token
                },
                success: function (res) {
                    if (res.status == 205){
                        alert(res.data)
                        window.location.reload();
                    }else{
                        alert("请求参数错误" + res.data)
                    }
                },
                error: function (e) {
                    if (e.status == 401){
                        alert("登录已过期，请重新登录");
                        window.location.href = 'login.html'
                    }else if (e.status == 400){
                        alert("操作错误")
                    }else{
                        alert("网络错误，请稍后再试..")
                    }

                }
            });
        }
    });
    $(".giveTo .btn .cancel").click(function () {
        $(".giveTo").hide();
        $("#cover").hide();
    });

    // 添加新用户按钮
    $(".addBtn .add").click(function () {
        $(".addUser").toggle();
        $("#cover").show();
    });
    $("#addUser").submit(function (e) {
        e.preventDefault();
        var data = {
            real_name: $("#username").val().toString(),
            password: $("#password").val(),
            mobile: $("#mobile").val()
        };
        if (!checkUsername(data.real_name)){
            $(".usernameError").show();
           return
        }
        if (!checkPassWord(data.password)){
            $(".passwordError").show();
            return
        }
        if (!checkmobile(data.mobile)){
            $(".mobileError").show();
            return
        }
        $.ajax({
            url:host + "users/add/",
            type: 'post',
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: "json",
            headers: {
                "Authorization": "JWT "+token
            },
            success: function (res) {
                alert("添加用户"+res.real_name+"成功！");
                window.location.reload();
            },
            error: function (e) {
                // alert(JSON.stringify(e.responseText))
                // if (e.status == 400){
                //
                // }
                alert("网络错误...稍后再试..." + e.status);
            }
        });
    });

    // 聚焦输入框
    $(".item input").focus(function () {
        $(this).next().hide();
    });
    $("#addUser .cancel").click(function () {
        $(".addUser").hide();
        $("#cover").hide();
    });

    // 分页
    function setPagination(totalCount) {
        $("#pagination").pagination({
        currentPage: 1,
        totalPage: Math.ceil(totalCount / pageSize),
        callback: function(current) {
            // 发送请求, 改变数据
            $.ajax({
                url: host + "user/subs/?page="+current+"&page_size="+pageSize,
                type: 'GET',
                contentType: "json",
                headers: {
                    "Authorization": "JWT "+token
                },
                success: function (res) {
                    var subAccounts = '';
                    $.each(res.results, function (index, sub) {
                        var username = sub.real_name || sub.username;
                        subAccounts += "<ul class='user'><li class='name'>" + username + "</li>";
                        subAccounts += "<li class='org'>" + sub.organization + "</li>";
                        if(sub.customers.length){
                            subAccounts += "<li class='showCs'>客户↓</li></ul>";
                        }else{
                            subAccounts += "<li class='showCs'></li></ul>";
                        }
                        // 遍历客户
                        subAccounts += "<ul class='userCs'><li>";
                        $.each(sub.customers, function (index, customer) {
                            subAccounts += "<ul> <input type='hidden' value=" + customer.id+ "><li class='csName'>"+ customer.name +"</li><li class='give'>转赠</li><li class='delete'>删除</li></ul>"
                        });

                        subAccounts += "</li></ul>"
                    });
                    $(".subAccount .subAccountList").html(subAccounts);
                }
            })
        }
    });
    }

    function checkUsername(username) {
        if (!username){
            $(".usernameError").html("请输入姓名！");
            return false
        }
        if (username.length < 2 || username.length > 20){
            $(".usernameError").html("姓名在2~20位之间！");
            return false
        }
        return true
    }
    function checkPassWord(password) {
        var pPattern = /^[a-zA-Z0-9!@#$%^&*?]{6,20}$/;
        if (!password){
            $(".passwordError").html("请输入密码！");
            return false
        }
        if (password.length < 6 || password.length > 20){
            $(".passwordError").html("密码长度在6~20位之间！");
            return false
        }
        if (!pPattern.test(password)){
            $(".passwordError").html("密码含非法字符！");
            return false
        }
        return true
    }
    function checkmobile(mobile) {
        var pattern = /^1[3456789]\d{9}$/;
        if (!pattern.test(mobile)){
            $(".mobileError").html("请输入正确的手机号");
            return false
        }
        return true
    }
    function checkGives(data) {

        if (!data.oid ){
            alert("请选择部门！");
            return false;
        }
        if (!data.uid){
            alert("请选择对方名字！");
            return false;
        }
        return true;
    }
});