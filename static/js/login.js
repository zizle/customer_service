var host = "http://127.0.0.1:8000/";
$(function () {
    // 鼠标聚焦输入框
    $(".loginUserName input").focus(function () {
        $(".noticeUserError").hide();
    });
    $(".loginPsd input").focus(function () {
        $(".noticePsdError").hide();
    });
    // 提交登录
    $(".loginForm").submit(function (e) {
        e.preventDefault();
        var username = $(".loginUserName input").val();
        var password = $(".loginPsd input").val();
        var remember = $(".remember input").is(':checked');

        // 检测是否有用户名, 正则匹配是否正确
        if (!checkUsername(username)){
            $(".noticeUserError").show();
            return
        }
        // 检测是否有密码， 正则匹配是否正确
        if (!checkPassWord(password)){
            $(".noticePsdError").show();
            return
        }
        // 提交登录请求
        $.ajax({
            url: host + 'login/',
            type: 'POST',
            data: JSON.stringify({
                username: username,
                password: password
            }),
            contentType: 'application/json',
            dataType: "json",
            success: function (res) {
                // console.log(res);
                if (remember){
                    sessionStorage.clear();
                    localStorage.user = JSON.stringify(res);
                    // localStorage.username = res.real_name || res.username;
                    // localStorage.user_id = res.user_id;
                    // localStorage.token = res.token;
                }else{
                    localStorage.clear();
                    sessionStorage.user = JSON.stringify(res);
                    // sessionStorage.token = res.token;
                    // sessionStorage.user_id = res.user_id;
                    // sessionStorage.username = res.real_name || res.username;
                }
                window.location.href = "./index.html"
            },
            error: function (e) {
                if (e.status == 400){
                    alert("用户名或密码错误...")
                }else{
                    alert("网络错误！请稍后再试...")
                }
            }
        })
    });

    //忘记密码
    $(".loginPsd").on("click", ".forgetPsd", function () {
        alert("请联系管理员重置密码")
    });

    function checkUsername(username) {
        var uPattern = /^[a-zA-Z0-9_]{5,20}$/;
        if (!username){
            $(".noticeUserError").html("请输入用户名！");
            return false
        }
        if (username.length < 5 || username.length > 20){
            $(".noticeUserError").html("用户名在5~20位之间！");
            return false
        }
        if (!uPattern.test(username)){
            $(".noticeUserError").html("用户名含非法字符！");
            return false
        }
        return true
    }
    function checkPassWord(password) {
        var pPattern = /^[a-zA-Z0-9!@#$%^&*?]{6,20}$/;
        if (!password){
            $(".noticePsdError").html("请输入密码！");
            return false
        }
        if (password.length < 6 || password.length > 20){
            $(".noticePsdError").html("密码长度在6~20位之间！");
            return false
        }
        if (!pPattern.test(password)){
            $(".noticePsdError").html("密码含非法字符！")
            return false
        }
        return true
    }
});