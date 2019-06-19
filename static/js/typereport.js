$(function () {
    // 请求品种数据
    $.ajax({
        url: host + "kinds/",
        type: "get",
        contentType: "application/json",
        success: function (res) {
            var variety_select = "<option>不限</option>";
            $.each(res, function (index, kind) {
                variety_select += "<option>"+ kind.name+"</option>";
            });
            $("#variety").html(variety_select);
        }
    });
    // 填充省份信息
    var province_item = "";
    $.each(citylist.citylist, function (index, pro) {
        province_item += "<li>"+pro.p+"</li>";
    });
    $(".area-first").html(province_item);
    // 地区选择框
    $(".choose-area").on("click", "input", function () {
        $(this).attr("disabled", "disabled");
        $(this).next().toggle();
        $(this).removeAttr("disabled")
    });
    // 地区已选清除
    $("#clear-input").on("click", function () {
        $("#select-area").val("");
        $("#province").click();  // 重置地区显示
    });
    // 地区确定按钮点击
    $("#area-cache").on("click", "button", function () {
        var text = $.trim($(this).prev("span").html());
        // var reg = new RegExp("-$");
        // if(reg.test(text)){
        //     alert("请选择完整的地区")
        //     return
        // }
        var extract = text.match(/(.*)-*$/)[1];
        $("#select-area").val(extract);
        $("#select-area").next().hide()
    });
    // 选择地区标头被点击
    $(".area-tab").on("click","a", function () {
         $(this).attr("class", "active");
        $(this).siblings().removeAttr("class");
        var name = $(this).attr("id");
         $(".choose-area-type ul").hide()
        if (name=="province"){
             $(".show-cache-area ul").hide();
             $(".area-first").show();
             $("#province").html("-选择省");
             $("#city").html("-选择市-");
             $("#city").remove();
             $("#district").html("-选择区/县-")
             $("#district").remove()
        }else if (name=="city"){
             $("#city").html("-选择市-")
            $(".show-cache-area ul").hide();
            $(".area-second").show();
            $("#district").html("-选择区/县-")
            $("#district").remove()
        }else if (name=="district"){
            $("#district").html("-选择区/县")
            $(".show-cache-area ul").hide();
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
                    $(".show-cache-area ul").hide();
                    $(".area-second").show()
                }else{
                    $("#area-cache span").html(text);
                    $("#city,#district").remove();
                    $(".show-cache-area ul").hide();
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
                            $(".show-cache-area ul").hide();
                            $(".area-third").show()
                        }else{
                            // 当前市没有区
                            $("#area-cache span").html(extract + "-" + text);
                            $("#district").remove();
                            $(".show-cache-area ul").hide();
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
        $(".show-cache-area ul").hide();
    });


    var customers = [];
    var flag = false;  // 标记是否循环过了
    // 点击查询
   $(".choose .search").click(function () {
       var csType = $("#csType option:selected").text();
       var bsType = $("#bsType option:selected").text();
       var variety = $("#variety option:selected").text();
       // 查询结果
       $.ajax({
           url: host + 'customer/type',
           type: 'get',
           contentType: "application/json",
           headers: {
               "Authorization": "JWT " + token
           },
           data: {
               type: csType,
               business: bsType,
               variety:variety,
               area: $("#select-area").val()
           },
           success: function (res) {
               flag = false;  // 重置循环标记
               customers = res.data;
               var type = res.search.type || "不限";
               var business = res.search.business || "不限";
               var variety = res.search.variety || "不限";
               var area = res.search.area || "不限";
               var count = res.data.length;
               var content = "<tr class='header'><td>客户</td><td>类型</td><td>业务</td><td>品种</td><td>地区</td><td>数量</td></tr>"
               content += "<tr class='count-tr'>";
               content += "<td>-</td>";
               content += "<td>"+ type  + "</td>";
               content += "<td>"+ business + "</td>";
               content += "<td>"+ variety + "</td>";
               content += "<td>"+ area + "</td>";
               content += "<td><button class='show-detail'>"+ count + "</button></td>";
               content += "</tr>";
               $(".typeList table").html(content)
           },
           error: function () {
               alert("查询失败")
           }
       })
   });
    // 显示详情
    $(".typeList").on("click", ".show-detail", function () {
        if (!flag){  // 标记未循环才执行
            $.each(customers, function (index, item) {
                var detalContent = "<tr>";
                detalContent += "<td>" + item.name + "</td>";
                detalContent += "<td>" + item.type + "</td>";
                detalContent += "<td>" + item.business + "</td>";
                detalContent += "<td>" + item.variety + "</td>";
                detalContent += "<td>" + item.area + "</td>";
                detalContent += "<td>-</td>";
                detalContent += "</tr>";
                $(".typeList table").append(detalContent);
            });
            flag = true;
        }
    })
});