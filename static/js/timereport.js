$(function () {

    $.ajax({
        url: host + "customer/count/",
        type: "get",
        contentType: "application/json",
        headers:{
            "Authorization": "JWT " + token
        },
        success: function (res) {
            // console.log(res.data)
            if (res.status=="403"){
                alert(res.message)
                // alert("")
            }
            $.each(res.data.reverse(), function (index, item) {
                var row = "<tr><td>" + item.day + "</td><td>" + item.csct + "</td><td>" + item.wkct + "</td></tr>"
                $('.timeList table').append(row)
            })
        },
        error: function (e) {
            alert("查询失败")
        }
    })












    //
    // $(".jobList .job span").click(function () {
    //     $(this).parent().next(".reply").slideDown();
    // });
    //
    // $(".jobList .replyCommit").click(function () {
    //     var content = $(this).parent().prev("textarea").val();
    //     var workId = $(this).parent().parent().prevAll(".workId").html();
    //     alert("提交回复：" + content + "workId:" + workId);
    //     $(this).parent().prev("textarea").val("");
    // });
    //
    // $(".jobList .replyCancel").click(function () {
    //     $(this).parent().parent(".reply").slideUp();
    // });
    //
    // $(".jobList ul").dblclick(function (e) {
    //     // e.preventDefault();
    //     var workId = parseInt($.trim($(this).children(".workId").html()));
    //     alert("工作" + workId);
    //     window.location.href="detailwork.html?workId="+workId;
    // });

});