var host = "http://127.0.0.1:8000/";
var mediaHost = "http://127.0.0.1:8080/";
var user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
var pageSize = 10;
if (!user){
    window.location.href='login.html'
}
var token = user.token;
var username = user.real_name  || user.username;

// console.log(user);
$(function () {
    var nav = $(".nav");
    var init = $(".nav .m").eq(ind);
    var block = $(".nav .block");
    block.css({
        "left": init.position().left - 3
    });
    nav.hover(function() {},
    function() {
        block.stop().animate({
            "left": init.position().left - 3
        },
        100);
    });
    $(".nav").slide({
        type: "menu",
        titCell: ".m",
        targetCell: ".sub",
        delayTime: 300,
        triggerTime: 0,
        returnDefault: true,
        defaultIndex: ind,
        startFun: function(i, c, s, tit) {
            block.stop().animate({
                "left": tit.eq(i).position().left - 3
            },
            100);
        }
    });

    $(".topName .name").html("欢迎您&nbsp;" + username);
});
var ind = 0;

function logout() {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href="login.html";
}
