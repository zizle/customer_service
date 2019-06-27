$(function () {
    $(".topName .name").html("欢迎您&nbsp;" + username);
    $.ajax({
        url: host + "user/notices/?ordering=-create_time&page=1&page_size=" + pageSize,
        type: 'GET',
        contentType: "application/json",
        headers: {
            "Authorization": "JWT "+ token
        },
        success: function (res) {
            setPagination(res.count);
            showMessages(res.results)
        },
        error: function (e) {
            console.log(e)
        }
    });

    $(".messageList").on("click", "li", function () {
        var mid =  $(this).children("input").val();
        var statusDiv = $(this).children("div");
        var status = $(this).children("div").attr("class");
        var typeid = $(this).prev("input").val();
        var cid = $(this).next("input").val();
        if (status){
            // 修改消息的阅读状态，并跳转页面
            $.ajax({
                url: host + "notices/" + mid + "/",
                type: 'PUT',
                contentType: "application/json",
                headers: {
                    "Authorization": "JWT "+ token
                },
                data:JSON.stringify({status:true}),
                success: function (res) {
                    statusDiv.removeClass("unread");
                    statusDiv.css({"display": "none"})
                },
                error: function (e) {
                    console.log(e)
                }
            });
        }else{
            // 已阅读状态
        }
        // 根据消息类型，跳转页面
        if (typeid == 1){
            // GET请求查看客户的归属
            $.ajax({
                url: host + "customer/belong/" + cid + "/",
                type: 'GET',
                contentType: "application/json",
                success:function (res) {
                    var uid = res.data;
                    if (uid == user.id){
                        // 本人客户进行跳转
                        window.location.href = "detailcustomer.html?cs="+cid;
                    }else{
                        alert("非本人客户...不能继续查看...")
                    }
                },
                error: function (e) {
                    console.log(e)
                }
            });

        }else if(typeid == 2 || typeid == 4){
            window.location.href = "orgwork.html";
        }else{

        }
    })


    // 分页
    function setPagination(totalCount) {
        $("#pagination").pagination({
        currentPage: 1,
        totalPage: Math.ceil(totalCount / pageSize),
        callback: function(current) {
            // 发送请求, 改变数据
            $.ajax({
                url: host + "user/notices/?ordering=-create_time&page="+current+"&page_size=" + pageSize,
                type: 'GET',
                contentType: "json",
                headers: {
                    "Authorization": "JWT "+token
                },
                success: function (res) {
                    showMessages(res.results)
                }
            })
        }
    });
    }
    // 显示消息
    function showMessages(messages) {
        var messageList = '';
            $.each(messages, function (k, notice) {
                var message = '';
                if(notice.type == 1){
                    message = "工作：<p>---" + notice.content + "---</p>有新的回复";
                }else if(notice.type ==2){
                    message = "事项：<p>>>>" + notice.content + "<<<</p>待处理";
                }else if (notice.type == 3){
                    message = "系统：" + notice.content;
                }else{
                    message = "授权：" + notice.content;
                }
                if (notice.status){
                    messageList += "<ul><input type='hidden' value=" + notice.type + "><li><div style='display:none;'></div><input type='hidden' value="+ notice.id +">" + message + "<span>" + notice.create_time + "</span></li><input type='hidden' value="+ notice.customer +"></ul>"
                }else{
                    messageList += "<ul><input type='hidden' value=" + notice.type + "><li><div class='unread'></div><input type='hidden' value="+ notice.id+">" + message + "<span>" + notice.create_time + "</span></li><input type='hidden' value="+ notice.customer +"></ul>"
                }
            });
            $(".messageList").html(messageList)
    }

});