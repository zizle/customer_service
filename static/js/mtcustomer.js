$(function () {
    var uid = GetQueryString("u");
    if (uid){
        var url = "customers/user/?ordering=-update_time&uid=" + uid +"&page=1&page_size=" + pageSize;
    }else{
        var url = "customers/user/?ordering=-update_time&page=1&page_size=" + pageSize;
    }

    $.ajax({
        url: host + url,
        type: "get",
        contentType: "application/json",
        headers: {
                "Authorization": "JWT "+token
        },
        success: function (res) {
            // 设置分页
            setPagination(res.count);
            // 显示客户列表
             var csList = "<tr class='head'><td>客户</td><td>客户类型</td><td>业务类型</td><td>品种</td><td>地区</td><td>最近更新</td></tr>";
            $.each(res.results, function (k, cs) {
                csList += "<tr class='item' title='点击查看详情'><input type='hidden' value="+ cs.id +"><td>"+ cs.name +"</td><td>" + cs.type + "</td><td>" + cs.business + "</td><td>" + cs.variety + "</td><td> " + cs.area + " </td><td class='updateTime'>"+ cs.update_time +"</td></tr>"
            });
            $(".content table").html(csList);
        },
        error: function (e) {
            alert("网络错误，请稍后再试...");
            console.log(e)
        }

    })

    $(".content").on("click", ".item", function () {
       var cs = $(this).children("input").val();
        // alert(cs);
        window.location.href="detailcustomer.html?cs="+ cs;
    });

    // 分页
    function setPagination(totalCount) {
         $("#pagination").pagination({
        currentPage: 1,
        totalPage: Math.ceil(totalCount / pageSize),
        callback: function(current) {
            if (uid){
                var url = "customers/user/?ordering=-update_time&uid=" + uid +"&page="+current+"&page_size=" + pageSize;
            }else{
                var url = "customers/user/?ordering=-update_time&page="+current+"&page_size=" + pageSize;
            }
            // 发送请求, 改变数据
            $.ajax({
                url: host + url,
                type: 'GET',
                contentType: "json",
                headers: {
                    "Authorization": "JWT "+token
                },
                success: function (res) {
                    var csList = "<tr class='head'><td>客户</td><td>客户类型</td><td>业务类型</td><td>品种</td><td>地区</td><td>最近更新</td></tr>";
                    $.each(res.results, function (k, cs) {
                    csList += "<tr class='item' title='点击查看详情'><input type='hidden' value="+ cs.id +"><td>"+ cs.name +"</td><td>" + cs.type + "</td><td>" + cs.business + "</td><td>" + cs.variety + "</td><td> " + cs.area + " </td><td class='updateTime'>"+ cs.update_time +"</td></tr>"
                    });
                    $(".content table").html(csList);
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

});