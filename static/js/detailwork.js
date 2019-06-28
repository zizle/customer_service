$(function () {
    var wk = GetQueryString("wk");
    var cs = GetQueryString("cs");

    if (wk){
        // 详情
        $.ajax({
            url: host + "works/" + wk + "/?cs=" + cs,
            type: "get",
            contentType:'application/json',
            headers: {
                "Authorization": "JWT "+token
            },
            success: function (res) {
                // 详情展示
                // console.log(res);
                var tableDetail = "<tr><td class='explain'>时&nbsp;&nbsp;&nbsp;间：</td><td>"+ res.update_time +"</td></tr>>";
                tableDetail += "<tr><td class='explain'>工作者：</td><td>"+ res.user +"</td></tr>>";
                tableDetail += "<tr><td class='explain'>事&nbsp;&nbsp;&nbsp;项：</td><td>"+ res.content +"</td></tr>>";
                if (res.file){
                    tableDetail += "<tr><td class='explain'>附&nbsp;&nbsp;&nbsp;件：</td><td class='work-file' ><button title='点击下载附件' value="+res.file_name+"><a href="+ res.file+"></a>"+ res.file_name +"</td></tr>";
                }else{
                    tableDetail += "<tr><td class='explain'>附&nbsp;&nbsp;&nbsp;件：</td><td>无</td></tr>>";
                }
                $(".work table").html(tableDetail);
            },
            error: function (e, status) {
                if (e.status == 401){
                    alert("登录过期，请重新登录...")
                    window.location.href = "login.html";
                }else{
                    alert("网络错误，请重新刷新...")
                }
            }
        });
        // 回复  reply
        $.ajax({
            url: host + "replies/?wk=" + wk,
            type: 'get',
            contentType: "application/json",
            headers: {
                "Authorization": "JWT " + token
            },
            success: function (res) {
                // console.log(res);
                var replyHtml = "<div class='reply'><textarea name='' id='' cols='30' rows='10'></textarea><div><button class='replyCommit'>回复</button><button class='replyCancel'>取消</button></div></div>";
                var notes = "";
                $.each(res, function (index, item) {
                    notes += "<ul><li class='noteAuthor'>" + item.user + "<span>" + item.update_time + "</span></li>";
                    notes += "<li class='note'>" + item.content + "<span>回复</span></li>";
                    // notes += "<input type='hidden' value=''>";
                    notes += replyHtml;
                    notes += "<input type='hidden' value=" + item.id + ">";

                    // 回复的子回复
                    if (item.subs.length){
                        // console.log(item.subs.length);
                        notes += "<li class='showReply'>查看回复↓</li><li class='subs'>";
                        // 循环子回复
                        $.each(item.subs, function (index, sub) {
                            // console.log(sub)
                            if (sub.parent){
                                notes += "<ul class='subNote'><li class='subAuthor'><em>"+ sub.user + "</em>回复<em>" + sub.parent + "</em><span>"+ sub.update_time + "</span>";
                            }else{
                                notes += "<ul class='subNote'><li class='subAuthor'><em>"+ sub.user + "</em>回复<em>" + item.user + "</em><span>"+ sub.update_time + "</span>";
                            }
                            notes += "<li class='note'>"+ sub.content +"<span>回复</span></li>";
                            notes += "<input type='hidden' value=" + sub.id + ">";
                            notes += replyHtml;
                            notes += "<input type='hidden' value=" + item.id + ">";
                            notes += "</ul>";
                        })
                        notes += "<ul class='hideReply subNote'>收起回复↑</ul></li>";
                    }
                    notes += "</ul>";
                });
                $(".notes").html(notes);

                // 方法事件
                $(".note").on("click", "span", function () {
                    $(this).parent().nextAll(".reply").slideDown();
                });
                $(".reply").on("click", ".replyCancel", function () {
                    $(this).parent().prev().val("");
                    $(this).parent().parent(".reply").slideUp();
                });
                $(".reply").on("click", ".replyCommit", function () {
                    var data = {
                        reply: $(this).parent().parent().next("input").val(),
                        content: $(this).parent().prev("textarea").val(),
                        parent: $(this).parent().parent().prev("input").val()
                    };
                    $(this).parent().prev("textarea").val("");
                    // 回复子回复
                    subreply(JSON.stringify(data));
                    // alert(JSON.stringify(data))
                });
                // 查看子回复  按钮
                $(".notes").on("click", ".showReply", function () {
                    $(this).next(".subs").slideDown();
                    $(this).html("&nbsp;");
                });
                $(".notes").on("click", ".hideReply", function () {
                    $(this).parent(".subs").slideUp();
                    $(".notes .showReply").html("查看回复↓");
                })



            },
            error: function (e) {
                if (e.status == 401){
                    alert("登录已过期，请重新登录...");
                    window.location.href="login.html"
                }else{
                    alert("网络错误，请重新刷新...")
                }

            }
        })

    }else{
        alert("发生未知错误，请重试...")
        window.location.href = "index.html";
    }

    $(".notes .hideReply").click(function () {
        $(this).parent(".subs").slideUp();
        $(".notes .showReply").html("查看回复↓");

    });

    // 下载附件
    $(".work").on("click", "button", function () {
        var a = document.createElement('a');
        a.href = host + $(this).children("a").attr("href");
        a.download = $(this).val();
        a.click();
    });

    function subreply(data) {
        $.ajax({
            url: host + "subreply/" +  wk + "/",
            type: "post",
            contentType:'application/json',
            data: data,
            headers: {
                "Authorization": "JWT "+token
            },
            success: function (res) {
                // console.log(res);
                alert("回复成功！");
                window.location.reload();
            },
            error: function () {
                // console.log(e);
               alert("网络错误，请稍后再试...")
            }

        })
    }

    // 获取查询字符串
    function GetQueryString(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    }
});