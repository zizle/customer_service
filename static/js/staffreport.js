$(function () {
    // 请求当前登录用户的小组信息
    $.ajax({
        url: host + "user/" + user.id + "/",
        type: 'get',
        contentType: 'application/json',
        headers: {
            "Authorization": "JWT " + token
        },
        success: function (res) {
            $.each(res.data, function (index, user) {
                var orderNumber = index + 1;
                var username = user.real_name || user.username;
                var customer_count = user.customer_count || "-";
                var parent = user.parent || "-";
                var rowContent = "<tr><td>"+ orderNumber +"</td><td>"+ username +"</td><td>"+ user.organization +"</td><td>"+ user.mobile +"</td><td>"+ user.email +"</td>";
                rowContent += "<td><button type='customer'>"+ customer_count +"<input type='hidden' value="+ user.id+"></button></td>";
                rowContent += "<td class='parent'>" + parent + "</td>";
                rowContent += "</tr>";
                $(".staffList table").append(rowContent)
            })
        },
        error: function (e) {
            console.log(e)
        }
    });
    $(".staffList").on("click", "button", function () {
        var uid = $(this).children("input").val();
        var count = $.trim($(this).html())[0];
        if (count == "-"){
            return
        }
        if ($(this).attr("type") == "customer"){
            // alert("查看user:" + userId + " 的customer")
            // 跳转到当前用户的客户列表
            window.location.href="mtcustomer.html?u=" + uid;
        }
    })
});