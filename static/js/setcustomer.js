$(function () {
    // input框不缓存
    $.each($("#csForm input"), function (index, item) {
        $(this).attr("autocomplete", "off")
    });
    // 初始化填充品种数据
    $.ajax({
        url: host + "kinds/",
        type: "get",
        contentType: "application/json",
        async:false,
        // success: function (res) {
        //     var variety_ul = "<ul>";
        //     $.each(res, function (index, kind) {
        //         variety_ul += "<li>"+kind.name+"</li>"
        //     });
        //     variety_ul += "</ul>";
        //     $(".choose-variety").html(variety_ul)
        // }
        success: function (res) {
            var variety_ul = "<ul>";
            $.each(res, function (index, kind){
                variety_ul += "<li><input type='checkbox' value="+kind.name +">"  +kind.name+" </li> "
            });
            variety_ul += "</ul>";
            $(".choose-variety").html(variety_ul)
        }
    });
    // 监听所有的品种复选框状态事件
    $(".choose-variety").on("click", "input", function(){
       var variety_value = $("#customer-variety").val();
       if($(this).is(":checked")){
           //console.log("选中" + $(this).val());
           $("#customer-variety").val(variety_value +$(this).val() + ",");

       }else{
           //console.log("没选"  + $(this).val());
           variety_value = variety_value.replace($(this).val() + ",", "");
           $("#customer-variety").val(variety_value);
       }
       $("#customer-variety").attr("title", $("#customer-variety").val());
    });
    // 点击空白隐藏品种选择框
    $(document).click(function(event){
        var _con = $(".choose-variety");
        if(!_con.is(event.target) && _con.has(event.target).length === 0){ // Mark 1
			$('.choose-variety').slideUp();   //滑动消失
			// $('.choose-variety').hide(1000);          //淡出消失
        }
    });
    var cid = getQueryString("cs");
    if(cid){ // 请求当前客户信息，并填充
        $.ajax({
            url: host + "customers/" + cid + "/",
            type: "GET",
            contentType: "application/json",
            headers: {
                "Authorization": "JWT "+token
            },
            async: false,
            success: function (res) {
                // console.log(res);
                $.each(res, function (field, value) {
                    // input框
                    $.each($("#csForm input"), function (index, item) {
                        if (field == $(this).attr("name")){
                            $(this).val(value)
                        }
                    });
                    // 品种复选框状态
                    if (field == "variety"){
                        var variety_arr = value.substring(0, value.length-1).split(",")
                        // console.log(variety_arr);
                        $(".choose-variety input").each(function(){
                            // console.log($(this).val());
                            if ($.inArray($(this).val(), variety_arr) > -1){
                                // console.log($(this).val() + "在数组中" + $.inArray($(this).val(), variety_arr));
                                $(this).prop("checked", true)
                            }
                        })
                    }
                    // textarea框
                    $.each($("#csForm textarea"), function (index, item) {
                        if (field == $(this).attr("name")){
                            $(this).val(value)
                        }
                    });
                    // 客户名片
                    if (res.card){
                        $(".card-info img").attr("src", mediaHost+res.card);
                        $(".card-info img").attr("alt", "客户名片");
                    }else{
                        $(".card-info img").attr("alt", "未上传客户名片");
                    }
                })
            },
            error: function (e) {
                console.log("请求客户信息出错...")
            }
        });
    }
    // 初始化填充行业（门类）
    var category_item = "";
    $.each(industry.industrylist, function (index, category) {
        category_item += "<li>"+category.c+"</li>";
    });
    $(".ins-first").html(category_item);
    // 初始化填充省份
    var province_item = "";
    $.each(citylist.citylist, function (index, pro) {
        province_item += "<li>"+pro.p+"</li>";
    });
    $(".area-first").html(province_item);
   // 选择的input事项
    $(".choose").on("click", "input", function (event) {
        event.stopPropagation();  // 取消事件冒泡，防止执行点击文档空白处再次执行
        $(this).attr("disabled", "disabled");
        $(this).next().toggle();
        $(this).removeAttr("disabled")
    });
    // 点击单选的
    $(".choose-type").on("click", "li", function () {
        var text = $.trim($(this).html());
        var tag = $(this).parent().parent();
        tag.prev("input").val(text);
        tag.hide()
    });
    // 点击门类
    $(".ins-first").on("click", "li", function () {
       var text = $.trim($(this).html());
       $("#industry-cache span").html(text + "-");
       // $("#first").html(text);  // 改变标头
       $("#first").removeAttr("class");
       $("#second").attr("class", "active");

       // 填充第二个
        $.each(industry.industrylist, function (index, category) {
            if(category.c == text){
                var colum = "";
                $.each(category.l, function (index, large) {
                    colum += "<li>"+large.n+"</li>";
                });
                $(".ins-second").html(colum)
            }
        });
       $(".ins-first").hide();
       $(".ins-second").show();

    });
    // 点击大类
    $(".ins-second").on("click", "li",function () {
        var text = $.trim($(this).html());
        var cache = $("#industry-cache span").html();
        var extract = cache.match(/^(.*?-).*$/)[1];  // 正则提取
        // $("#second").html(text);
        $("#industry-cache span").html(extract + text);
        $(".ins-second").hide();
    });
    // 门类/大类 被点击
    $(".industry-tab").on("click", "a", function () {
        $(this).attr("class", "active");
        $(this).siblings().removeAttr("class");
        // 判断点击了哪个
        var name = $(this).attr("id")
        if (name=="first"){
            $(".ins-second").hide()
            $(".ins-first").show();
        }else if (name=="second"){
            $(".ins-second").show();
            $(".ins-first").hide();
        }else{
        }
    });
    // 行业确定按钮点击
    $("#industry-cache").on("click", "button", function () {
        var text = $.trim($(this).prev("span").html());
        var reg=new RegExp("-$");
        if(reg.test(text)){
            alert("请选择完整的行业");
            return
        }
        // if(text.endsWith("-")){  // 360不兼容
        //     alert("请选择完整的行业");
        //     return
        // }
        $("#customer-industry").val(text);
        $("#customer-industry").next().hide()
    });
    // 地区确定按钮点击
    $("#area-cache").on("click", "button", function () {
        var text = $.trim($(this).prev("span").html());
        var reg = new RegExp("-$");
        if(reg.test(text)){
            alert("请选择完整的地区")
            return
        }
        $("#customer-area").val(text);
        $("#customer-area").next().hide()
    });
    // 选择地区标头被点击
    $(".area-tab").on("click","a", function () {
         $(this).attr("class", "active");
        $(this).siblings().removeAttr("class");
        var name = $(this).attr("id");
         $(".choose-area-type ul").hide()
        if (name=="province"){
             $(".choose-area-type ul").hide();
            $(".area-first").show();
            $("#province").html("-选择省-")
            $("#city").html("-选择市-");
            $("#city").remove();
            $("#district").html("-选择区/县-")
            $("#district").remove()
        }else if (name=="city"){
             $("#city").html("-选择市-");
             $(".choose-area-type ul").hide();
            $(".area-second").show();
            $("#district").html("-选择区/县-")
            $("#district").remove()
        }else if (name=="district"){
             $("#district").html("-选择区/县-")
             $(".choose-area-type ul").hide();
             $(".area-third").show();
        }else{}
    });
    // 省份被点击
    $(".area-first").on("click", "li", function () {
        var text = $.trim($(this).html());

        $("#province").html(text);
        $.each(citylist.citylist, function (index, pro) {
            // 有市添加市选项卡并填充当前省对应市
            if(pro.p==text){
                if(pro.c){
                    $("#area-cache span").html(text + "-");
                    if ($(".area-tab #city").length==0){ // 没有市标签才添加
                        $(".area-tab").append("<a href='javascript:;' id='city'>-选择市-</a>");
                    }
                    var city_colum = "";
                    $.each(pro.c, function (index, city) {
                        city_colum += "<li>"+ city.n +"</li>";
                    });
                    $(".area-second").html(city_colum);
                    $("#province").removeAttr("class");
                    $("#city").attr("class", "active");
                    $("#province").html(text);
                    $(".choose-area-type ul").hide();
                    $(".area-second").show()
                }else{
                    $("#area-cache span").html(text);
                    $("#city,#district").remove();
                    $(".choose-area-type ul").hide();
                }
                return
            }
        });
    });
    // 市被点击
    $(".area-second").on("click", "li", function () {
        var text = $.trim($(this).html());
        var cache = $("#area-cache span").html();
        var extract = cache.match(/^(.*?)-.*$/)[1];  // 正则提取
        $("#city").html(text);
        //当前市有区的话填充区
        $.each(citylist.citylist, function (index, pro) {
            if (pro.p==extract){
                $.each(pro.c, function (index, city) {
                    if(city.n==text){
                        if(city.a){
                            $("#area-cache span").html(extract + "-" + text + "-");
                            if ($(".area-tab #district").length==0){ // 没有区/县标签才添加
                                $(".area-tab").append("<a href='javascript:;' id='district' style='margin-left: 5px'>-选择区/县-</a>");
                            }
                            var district_column = "";
                            $.each(city.a, function (index, district) {
                                district_column+="<li>"+ district.s +"</li>";
                            });
                            $(".area-third").html(district_column)
                            $("#city").removeAttr("class");
                            $("#district").attr("class", "active");
                            $("#city").html(text);
                            $(".choose-area-type ul").hide();
                            $(".area-third").show()
                        }else{
                            // 当前市没有区
                            $("#area-cache span").html(extract + "-" + text);
                            $("#district").remove();
                            $(".choose-area-type ul").hide();
                        }
                    }
                })
            }

        })
    });
    // 区/县被点击
    $(".area-third").on("click", "li", function () {
        var text = $.trim($(this).html());
        var cache = $("#area-cache span").html();
        var extract = cache.match(/^(.*)-.*$/)[1];  // 正则提取
        $("#district").html(text);
        $("#area-cache span").html(extract + "-" + text);
        $(".choose-area-type ul").hide();
    });
    // 立项按钮点击（表单提交）
    $("#csForm").submit(function (e) {
        e.preventDefault()
        // 名片
        var card = $("#card").get(0).files[0];
        var formData = new FormData();
        if (card){
            var uuid = generateUUID();
            formData.append("card_image", card);
            formData.append("uuid", uuid);
            formData.append("card_name", card.name);
        }
        // 获取表单所有input和textarea的值
        // var data = {};
        var t = $("#csForm").serializeArray();
        $.each(t, function() {
            // data[this.name] = this.value;
            formData.append(this.name, this.value);
        });
        // 检测手机号
        var tel_num = $("#telephone").val();
        if (!checkPhoneNum(tel_num)){
            alert("请输入正确的手机号");
            return
        }
        // 提交修改或者立项
        if(cid){ // 提交修改
            if(confirm("确定修改?修改后不可恢复！")){
                var url = host + "customers/" + cid + "/";
                var type = "PUT";
            }else{
                return
            }
        }else{ // 客户立项
            var url = host + 'customers/';
            var type = "POST";
        }
        $.ajax({
            url: url,
            type: type,
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "Authorization": "JWT " + token
            },
            success: function (res) {
                if (res.id){
                    alert("操作成功！");
                    window.location.href = "setcustomer.html?cs=" + res.id;
                }else{
                    if (res.status == 403){
                        // 弹窗请求授权
                        $('#cover').css('display', 'block');
                        $('#cover').css('height', $(document).height() + 'px'); //设置遮罩层的高度为当前页面高度
                        $(".authorize .show_message").html(res.message);
                        $(".authorize").show()
                    }else if (res.status == 409){
                        alert(res.message)
                    }

                }
            },
            error: function (e, status) {
                if (e.status ==400){
                    alert("提交数据有误，请检查必填项是否填写")
                }else{
                    alert("网络错误，请稍后再试...");
                }
            }
        });
    });
    // 请求授权
    $(".authorize").on("click", ".require", function () {
        // 发送请求授权消息
        $.ajax({
            url: host + "support/add/",
            type: 'POST',
            data: JSON.stringify({
                "sponsor": user.id,
                "customer": cid,
                "content": 'authorization'
            }),
            contentType: "application/json",
            headers: {
                "Authorization": "JWT " + token
            },
            success: function (res) {
                $("#cover").hide();
                $(".authorize").hide()
                alert("发起授权请求成功!")
                window.location.href = "index.html";
            },
            error: function (e) {
                alert("网络错误，请稍后再试..." + e.error);
            }
        })
    });
    $(".authorize").on("click", ".cancel", function (){
        $(".authorize").hide();
        $("#cover").hide();
    });
    $(".authorize").on("click", 'span', function () {
        $(".authorize").hide();
        $("#cover").hide();
    });
    // 检测手机号的合法性
    $("#telephone").blur(function () {
        var tel = $(this).val();
        if (!checkPhoneNum(tel)){
            alert("请输入正确的手机号");
        }
    });

    // 设置资料完善度(实时监听input、textarea的值)
    // $.each($("#csForm input"), function () {
    //     $(this).on("input", function () {
    //         alert(1)
    //     })
    // });
    // 资料完善度相关
    var percent=0;
    setPercent();
    function setPercent() {
       // input框
        $.each($("#csForm input"),function () {
            addPercent($(this));
        });
        // textarea框
        $.each($("#csForm textarea"), function () {
            addPercent($(this))
        });
        // 判断是否有名片(名片百分比)
        addPercent($(".card-info img"))
    }
    // 设置百分比
    function addPercent($this) {
        var needArray = ["type","business", "industry", "area","variety","nature","name","linkman", "telephone","account","situation"];
        var replenishArray = ["capital","question","needs","difficulty","support"];
        var name = $this.attr("name");
        var value = $this.val();
        if ($.inArray(name, needArray)!=-1 && value){
            percent += 5;
            showPercent(percent)
        }else if ($.inArray(name, replenishArray)!=-1 && value){
            percent += 3;
            showPercent(percent)
        }else if($this.attr("src")){
            percent += 30;
            showPercent(percent)
        }else{}
    }
    // 手机号合法性
    function checkPhoneNum(phone) {
        var pattern = /^1[3456789]\d{9}$/;
        if (!pattern.test(phone)){
            return false
        }
        return true
    }
    // 显示百分比
    function showPercent(p) {
        $(".progress progress").val(p);
        $(".progress .percent").html(p + "%");
    }
    // 获取查询参数
    function getQueryString(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
         var r = window.location.search.substr(1).match(reg);
         if(r!=null)return  unescape(r[2]); return null;
    }
    // 图片唯一uuid
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
});
