$(function () {
    var cs = GetQueryString("cs");
    var organizations = [];
    if(cs){
        $.ajax({
        url: host + "customers/" + cs + "/",
        type: "get",
        contentType: "application/json",
        headers: {
                "Authorization": "JWT "+token
        },
        success: function (res) {
            // 基本资料
            var tableContent = "<tr><td class='tag'>单位名称：</td><td>" + res.name + "</td><td class='tag'>单位性质：</td><td>" + res.nature + "</td></tr>";
            tableContent += "<tr><td class='tag'>客户类型：</td><td>" + res.type + "</td><td class='tag'>业务类型：</td><td>" + res.business + "</td></tr>";
            tableContent += "<tr><td class='tag'>所属行业：</td><td>" + res.industry + "</td><td class='tag'>所属地区：</td><td>" + res.area + "</td></tr>";
            tableContent += "<tr><td class='tag'>单位联系人：</td><td>" + res.linkman + "</td><td class='tag'>联系电话：</td><td>" + res.telephone + "</td></tr>";
            tableContent += "<tr><td class='tag'>涉及品种：</td><td>" + res.variety + "</td><td class='tag'>资金规模：</td><td>" + res.capital + "</td></tr>";
            $(".content table").html(tableContent)
        },
        error: function (e) {
            alert("网络错误, 请重新刷新...")
            }
        });

        $.ajax({
            // 工作列表
            url: host + "works/?cs="+cs + "&ordering=-update_time&page=1&page_size=" + pageSize,
            type: "get",
            contentType: "application/json",
            headers: {
                    "Authorization": "JWT "+token
            },
            success: function (res) {
                // console.log(res)
                setPagination(res.count);
                showJobList(res.results)

            },
            error: function (e) {
                alert("网络错误, 请重新刷新...")
            }

        });
        // 添加
        $(".add").submit(function (e) {
            e.preventDefault();
            var workContent = $(".workText #work").val();
            var file = $("#addFile").get(0).files[0];
            var formData = new FormData();
            if (file){
                var uuid = generateUUID();
                formData.append("file", file);
                formData.append("uuid", uuid);
                formData.append("file_name", file.name);

            }
            formData.append("content", workContent);
            formData.append("customer", cs);
            formData.append("user", user.id);
            $.ajax({
                url: host + "works/",
                type: "post",
                processData: false,
                contentType: false,
                headers: {
                    "Authorization": "JWT "+token
                },
                data: formData,
                success: function (res) {
                    alert("添加成功！");
                    window.location.reload();
                },
                error: function (e) {
                    alert("网络错误，请重试...")
                }
            })
        });

        // 回复
        $(".jobList").on("click", "span", function () {
            $(this).parent().next(".reply").slideDown();
        });
        $(".jobList").on("click", ".replyCancel", function () {
            $(this).parent().parent(".reply").slideUp();
            $(this).parent().prev("textarea").val("");
        });
        $(".jobList").on("click", ".replyCommit", function () {
            var content = $.trim($(this).parent().prev("textarea").val());
            var wk = $(this).parent().parent().prevAll("input").val();
            if (!user.id){
                alert("请登录后回复...");
                window.location.href = "login.html";
            }
            if (!content){
                alert("您还没有输入任何回复信息...");
                return
            }
            $.ajax({
                url: host + "replies/",
                type: "post",
                contentType:'application/json',
                headers: {
                        "Authorization": "JWT "+token
                },
                data:JSON.stringify({
                    work: wk,
                    content: content
                }),
                success: function (res) {
                   alert("回复成功！")
                },
                error: function (e) {
                   console.log(e);
                   alert("网络错误，请稍后再试...")
                }
            });
            $(this).parent().prev("textarea").val("");
        });
        // 跳转详情
        $(".jobList").on("dblclick", "ul", function () {
            var wk = $(this).children("input").val();
            window.location.href="detailwork.html?cs="+ cs + "&wk="+ wk;
        })

    }else{
        alert("内部错误！")
        window.location.href = "index.html";
    }

    // 客户操作
    var clickText = "";
    $(".jobListTitle button").click(function () {
        // 请求所有部门
        $.ajax({
            url: host + "organizations/",
            type: 'get',
            contentType: 'application/json',
            headers: {
                "Authorization": "JWT " + token
            },
            success: function (res) {
                organizations = res;
            },
            error:function (e) {
                if(e.status==404){
                    console.log("请求部门出错")
                }else{
                    alert("网络错误请稍后再试")
                }
            }
        });
        // 请求组长
        $.ajax({
            url: host + "user/leader/",
            type: 'get',
            contentType: 'application/json',
            headers: {
                "Authorization": "JWT " + token,
            },
            success: function (res) {
                // console.log(res);
                if (res.status == 403){
                    console.log("查询组长出错")
                }
                $(".leader em").html(res.leader + "&nbsp;")
            },
            error: function (e) {
                console.log("查询组长出错")
            }
        });

        $(".options").slideToggle()
    });

    $(".options li").click(function () {
        clickText = $.trim($(this).html());
        if (clickText == "客户转赠"){
            $(".give").show();
            $("#cover").show();
            var ogContent = "<option selected='selected' disabled='disabled'  style='display: none' value=''></option>";
            $.each(organizations, function (index, og) {
                ogContent += "<option value=" + og.id + ">"+ og.name  +"</option>";
            });
            $("#og-name").html(ogContent);
            $("#og-name").change(function () {
                var oid = $(this).find("option:selected").val();
                var userContent = "";
                $.each(organizations, function (index,og) {
                    $.each(og.users, function (index, user) {
                        var username = user.real_name || user.username;
                        if(user.organization == oid){
                            userContent += "<option value="+ user.id +">" + username + "</option>";
                        }
                    })
                });
                $("#ogUser").html(userContent);
            })
        }

        if (clickText == "跨部门协作"){
            var ogContent = "<option selected='selected' disabled='disabled'  style='display: none' value=''></option>";
            $.each(organizations, function (index, og) {
                ogContent += "<option value=" + og.id + ">"+ og.name  +"</option>";
            });
            $("#ogName").html(ogContent);
            $(".ogWork").show();
            $("#cover").show();
        }

        if (clickText == "上级支持"){
            $(".support").show();
            $("#cover").show();
        }
        if (clickText == "信息修改"){
            // 跳转页面，带上csId
            window.location.href = "setcustomer.html?cs=" + cs ;
        }
    });

    // 转赠提交
    $(".give").submit(function (e) {
        e.preventDefault();
        // console.log(clickText + cs);
        var data = {};
        var t = $("#giveForm").serializeArray();
        $.each(t, function() {
            data[this.name] = this.value;
        });
        data["cid"] = cs;
        // var jsonData = JSON.stringify(data);
        // console.log(jsonData);
        if (checkGives(data)){
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
                        alert(res.data);
                        // 跳转首页
                        window.location.href = "index.html"
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
            })
        }
    });

    // 部门协作
    $(".ogWork").submit(function (e) {
        e.preventDefault();
        // console.log(clickText + cs);
        var data = {};
        var t = $("#ogWorkForm").serializeArray();
        $.each(t, function() {
            data[this.name] = this.value;
        });
        data["customer"] = cs;
        data["sponsor"] = user.id;
        $.ajax({
            url: host + "cooperation/add/",
            type: 'post',
            contentType: "application/json",
            headers: {
                "Authorization": "JWT " + token
            },
            data: JSON.stringify(data),
            success: function (res) {
                alert("发起部门协作成功")
                $("#ogWorkForm")[0].reset();
                $(".ogWork").hide();
            },
            error: function () {
                console.log("网络错误,发起部门协作失败")
            }
        })
    });

    // 上级支持
    $(".support").submit(function (e) {
        e.preventDefault();
        // console.log(clickText + cs);
        var data = {};
        var t = $("#supportForm").serializeArray();
        $.each(t, function() {
            data[this.name] = this.value;
        });
        data["sponsor"] = user.id;
        data["customer"] = cs;
        // var jsonData = JSON.stringify(data);
        // console.log(jsonData);
        $.ajax({
            url: host + "support/add/",
            type: 'post',
            contentType: "application/json",
            headers: {
                "Authorization": "JWT " + token
            },
            data: JSON.stringify(data),
            success: function (res) {
                $("#supportForm")[0].reset();
                $(".support").hide();
                alert("请求支持成功。")
            },
            error: function (e) {
                console.log("网络错误，请求支持失败..")
            }
        })
    });


    $(".give .title span").click(function () {
        $(".give").hide();
        $("#cover").hide()
    });

    $(".ogWork .title span").click(function () {
        $(".ogWork").hide();
        $("#cover").hide();
    });
    $(".support .title span").click(function () {
        $(".support").hide();
        $("#cover").hide();
    });

    $(".give .btn .cancel").click(function () {
        $(".give").hide();
        $("#cover").hide()
    });
    $(".ogWork .btn .cancel").click(function () {
        $(".ogWork").hide();
        $("#cover").hide();
    });
    $(".support .btn .cancel").click(function () {
        $(".support").hide();
        $("#cover").hide()
    });

    $(".csDetail .addBtn").click(function () {
        $(".add").show();
        $("#cover").show()
    });

    $(".add .title span").click(function () {
        $(".add").hide();
        $("#cover").hide();

    });
    $(".add .btn .cancel").click(function () {
        $(".add").hide();
        $("#cover").hide();
    });

    // 显示客户工作
    function showJobList(dataList) {
        var jobContent = "";
        $.each(dataList, function (k, job) {
            jobContent += "<ul title='双击查看具体信息'><input type='hidden' value=" + job.id + "><li class='jobTime'>"+ job.update_time +"</li><li class='job'>" + job.content + "<span>回复</span></li>";
            jobContent += "<div class='reply'><textarea name='' id='' cols='30' rows='10'></textarea>";
            jobContent += "<div><button class='replyCommit'>回复</button><button class='replyCancel'>取消</button></div>";
            jobContent += "</div></ul>";
        });
        $(".jobList").html(jobContent);
    }
    // 分页
    function setPagination(totalCount) {
        $("#pagination").pagination({
        currentPage: 1,
        totalPage: Math.ceil(totalCount / pageSize),
        callback: function(current) {
            // 发送请求, 改变数据
            $.ajax({
                url: host + "works/?ordering=-update_time&cs="+cs + "&page="+current+"&page_size=" + pageSize,
                type: 'GET',
                contentType: "json",
                headers: {
                    "Authorization": "JWT "+token
                },
                success: function (res) {
                    showJobList(res.results)
                }
            })
        }
    });
    }

    // 获取查询参数
    function GetQueryString(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
         var r = window.location.search.substr(1).match(reg);
         if(r!=null)return  unescape(r[2]); return null;
    }

    function generateUUID() {
        var d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += performance.now(); //use high-precision timer if available
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
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