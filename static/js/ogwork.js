$(function () {
    var cooperationList = [];
    var supportsList = [];
    // 请求
    $.ajax({
        url: host + "organization/works/",
        type: 'get',
        contentType: 'application/json',
        async: false,
        headers: {
            "Authorization": "JWT " + token
        },
        success: function (res) {
            cooperationList = res.cooperations;
            supportsList = res.supports;

            var cooperation = "";
            var support = "";
            $.each(res.cooperations, function (index, item) {
                if (item.status == 0){
                    cooperation += "<ul><li><div class='unread'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>"+item.sponsor+"：</span>" + item.content + "<button action='pass'>通过</button><button action='reject'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>"
                }else{
                    cooperation += "<ul><li><div style='display: none'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>"+item.sponsor+"：</span>" + item.content + "<button action='pass'>通过</button><button action='reject'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>"
                }
            });
            $(".cooperation").html(cooperation);
            $(".cooperation button").attr("work", "cooperation");

            $.each(res.supports, function (index, item) {
                if (item.status == 0){
                    if (item.type == 2){
                        support += "<ul><li><div class='unread'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>" + item.sponsor + "：</span>" + item.content + "<button action='pass' authorize='authorize'>通过</button><button action='reject' authorize='authorize'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>";
                    }else{
                       support += "<ul><li><div class='unread'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>" + item.sponsor + "：</span>" + item.content + "<button action='pass'>通过</button><button action='reject'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>";
                    }
                }else{
                    if (item.type == 2){
                        support += "<ul><li><div style='display:none;'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>" + item.sponsor + "：</span>" + item.content + "<button action='pass' authorize='authorize'>通过</button><button action='reject' authorize='authorize'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>";
                    }else{
                        support += "<ul><li><div style='display:none;'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>" + item.sponsor + "：</span>" + item.content + "<button action='pass'>通过</button><button action='reject'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>";
                    }

                }
            });
            $(".support").html(support);
            $(".support button").attr("work", "support");


        },
        error: function (e) {
            console.log("发送信息请求失败" + e.error)
        }
    });

   // 点击事件
   $(".workList").on("click", "button", function () {
       var wid = $(this).parent().children("input").val();
       var action = $(this).attr("action");
       var authorize = $(this).attr("authorize");
       var classify = $(this).attr("work");
       var readElement = $(this).parent().children("div");
       if (readElement.attr("class") == "unread"){
           // 发送请求
           $.ajax({
           url: host + "organization/works/" + wid + "/",
           type: "put",
           contentType: "application/json",
           headers: {"Authorization": "JWT " + token},
           data: JSON.stringify({
               action: action,
               classify: classify,
               authorize: authorize
           }),
           success: function (res) {
               alert(res.message);
               if (res.status != "204"){
                   readElement.css({"display": "none"});
               }
           },
           error: function (e) {
               alert("网络错误，请检查网络设置..")
           }
       });
       }else{
           alert("该事项您已经处理过...")
       }
   });


   // 选择显示
    $(".workListTitle").on("change", "select", function () {
        var name = $(this).attr("name");
        var selectVal = $(this).find("option:selected").val();
        if (name == "cooperation"){
            var cooperation = "";
            $.each(cooperationList, function (index, item) {
                if (selectVal == 0){
                    if (item.status == 0){
                            cooperation += "<ul><li><div class='unread'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>" + item.sponsor + ":</span>" + item.content + "<button action='pass'>通过</button><button action='reject'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>";
                        }else{
                            cooperation += "<ul><li><div style='display:none;'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>" + item.sponsor + ":</span>" + item.content + "<button action='pass'>通过</button><button action='reject'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>";
                        }
                }else{
                    if (item.status == selectVal){
                        if (item.status == 0){
                            cooperation += "<ul><li><div class='unread'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>" + item.sponsor + ":</span>" + item.content + "<button action='pass'>通过</button><button action='reject'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>";
                        }else{
                            cooperation += "<ul><li><div style='display:none;'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>" + item.sponsor + ":</span>" + item.content + "<button action='pass'>通过</button><button action='reject'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>";
                        }
                    }
                }
            });
            $(".cooperation").html(cooperation);
            $(".cooperation button").attr("work", "cooperation");

        }else{
            var support = "";
            $.each(supportsList, function (index, item) {
                if (selectVal == 0){
                    if (item.status == 0){
                        support += "<ul><li><div class='unread'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>" + item.sponsor + ":</span>" + item.content + "<button action='pass'>通过</button><button action='reject'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>";
                    }else{
                        support += "<ul><li><div style='display:none;'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>" + item.sponsor + ":</span>" + item.content + "<button action='pass'>通过</button><button action='reject'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>";
                    }
                }else{
                    if (item.status == selectVal){
                        if (item.status == 0){
                            support += "<ul><li><div class='unread'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>" + item.sponsor + ":</span>" + item.content + "<button action='pass'>通过</button><button action='reject'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>";
                        }else{
                            support += "<ul><li><div style='display:none;'></div><input type='hidden' value=" + item.id + "><span class='sponsor'>" + item.sponsor + ":</span>" + item.content + "<button action='pass'>通过</button><button action='reject'>驳回</button><span class='time'>" + item.create_time + "</span></li></ul>";
                        }
                    }
                }
            });
            $(".support").html(support);
            $(".support button").attr("work", "support");
        }
    })
});