$(function(){
    if (token){
        var loginInfo = "<div class=\"title\">登录信息</div>" + "<div class='detailList'><h4>" + username + "</h4>" + "<ul><li>用户角色：" + user.level + "</li><li>上次登录时间："+ user.pre_login +"</li>";
        $(".userMsg").html(loginInfo);
        // 请求当前登录用户
        $.ajax({
            url: host + "customers/?ordering=-update_time&page=1&page_size="+pageSize,
            type: 'GET',
            contentType: "json",
            headers: {
                "Authorization": "JWT "+token
            },
            success: function (res) {
                // console.log(res);
                if (res.count){
                    setPagination(res.count);
                    $(".userCustomer .title span").html("【" +res.count + "】");
                }
                // 显示客户
                showCustomers(res.results);
                // var csTableContent = "<tr class='head'><td>客户归属</td><td>客户</td><td>客户类型</td><td>业务类型</td><td>品种</td><td>地区</td><td>最近更新</td></tr>";
                // $.each(, function (k, cs) {
                //     if (!cs.belong){
                //         cs.belong = "无";
                //     }
                //     csTableContent += "<tr class='item' title='点击查看详情'><input type='hidden' value="+ cs.id +"><td>"+ cs.belong + "<td>"+ cs.name +"</td>" + "<td>"+ cs.type +"</td>" + "<td>"+ cs.business +"</td>" + "<td>"+ cs.variety +"</td>" + "<td>"+ cs.area +"</td>" + "<td class=\"updateTime\">"+ cs.update_time +"</td>"
                // });
                // $("#csTable").html(csTableContent);
            },
            error: function (e) {
                console.log(e)
            }
        });
        // 未读消息数
        $.ajax({
            url: host + "notices/",
            type: 'GET',
            contentType: "json",
            headers: {
                "Authorization": "JWT "+token
            },
            success: function (res) {
                // console.log(res)
                if (res.data){
                    $("#no-read").show();
                    $("#no-read").html(res.data)
                }
            },
            error: function (e) {
                console.log(e)
            }
        })
    }else{
        window.location.href = 'login.html';
    }
    // 点击跳转客户工作页面
    $(".customerList").on("click", ".item", function () {
        var cs = $(this).children('input').val();
        window.location.href="detailcustomer.html?cs="+cs;
    });
    // 分页
    function setPagination(totalCount) {
        $("#pagination").pagination({
        currentPage: 1,
        totalPage: Math.ceil(totalCount / pageSize),
        callback: function(current) {
            // 发送请求, 改变数据
            $.ajax({
                url: host + "customers/?page="+current+"&page_size="+pageSize,
                type: 'GET',
                contentType: "json",
                headers: {
                "Authorization": "JWT "+token
                },
                success: function (res) {
                    showCustomers(res.results)
                }
            })
        }
    });
    }
    // 客户列表的展示
    function showCustomers(customerList) {
        var csTableContent = "<tr class='head'><td>客户归属</td><td>客户</td><td>客户类型</td><td>业务类型</td><td>品种</td><td>地区</td><td>最近更新</td></tr>";
        $.each(customerList, function (k, cs) {
            if (!cs.belong){
                cs.belong = "无";
            }
            csTableContent += "<tr class='item' title='点击查看详情'><input type='hidden' value="+ cs.id +"><td>"+ cs.belong + "<td>"+ cs.name +"</td>" + "<td>"+ cs.type +"</td>" + "<td>"+ cs.business +"</td>" + "<td>"+ cs.variety +"</td>" + "<td>"+ cs.area +"</td>" + "<td class=\"updateTime\">"+ cs.update_time +"</td>"
        });
        $("#csTable").html(csTableContent);
    }
 });
