$(function() {
    var cid = GetQueryString("cs");
    // 请求需要的数据并填充
    $.ajax({
        url: host + "kinds/",
        type: "get",
        contentType: "application/json",
        success: function (res) {
            var addContent = '';
            $.each(res, function (k, kind) {
                addContent += "<option value=" + kind.id+ ">" + kind.name +"</option>";
            });

            $("#variety").append(addContent);
        },
        error: function (e) {
            console.log(e)
        }
    });

    // 全局进度变量
    var percent = 0;
    var data = {
        type: "",
        business: "",
        name: "",
        nature: "",
        industry: "",
        area: "",
        linkman: "",
        telephone: "",
        variety: "",
        capital: "",
        account: "",
        situation: "",
        question: "",
        needs: "",
        difficulty: "",
        support: "",
        card: ""
    };

    if(cid){
        // 请求信息
        $.ajax({
            url: host + "customers/" + cid + "/",
            type: "GET",
            contentType: "application/json",
            headers: {
                "Authorization": "JWT "+token
            },
            success: function (res) {
                if (res.card){
                    $("#csCardImage").attr("src", host + res.card);
                    data.card = res.card;
                }
                $("#csType option").each(function () {
                    if($(this).text()==res.type){
                        $(this).prop('selected',true);

                        data.type = res.type;
                    }
                });

                $("#bsType option").each(function () {
                    if($(this).text()==res.business){
                        $(this).prop('selected',true);

                        data.business = res.business;
                    }
                });

                $("#ogNature option").each(function () {
                    if($(this).text()==res.nature){
                        $(this).prop('selected',true);

                        data.nature = res.nature;
                    }
                });
                $("#variety option").each(function () {
                    if($(this).text()==res.variety){
                        $(this).prop('selected',true);

                        data.variety = res.variety;
                    }
                });

                $("#ogNameText").attr("value", res.name);
                data.name = res.name;

                $("#ogIndustry").attr("value", res.industry);
                data.industry = res.industry;

                $("#relPeople").attr("value", res.linkman);
                data.linkman = res.linkman;

                $("#ogArea").attr("value", res.area);
                data.area = res.area;

                $("#relTel").attr("value", res.telephone);
                data.telephone = res.telephone;

                $("#capital").attr("value", res.capital);
                data.capital = res.capital;

                $("#account").attr("value", res.account);
                data.account = res.account;

                $("#companyDsc").attr("value", res.situation);
                data.situation = res.situation

                $("#companyPrm").attr("value", res.question);
                data.question = res.question;

                $("#needs").attr("value", res.needs);
                data.needs = res.needs;

                $("#difficulty").attr("value", res.difficulty);
                data.difficulty = res.difficulty;

                $("#support").attr("value", res.support);
                data.support = res.support;

                console.log(res)
            },
            error: function (e) {
                console.log(e.error)

            }
        });

        // 填充默认值
        if (data.type){
             $("#csType").attr("slected", data.type);
            percent += 4;
        }
        if (data.business){
            $("#bsType").attr("value", data.business);
            percent += 4;
        }
        if (data.nature){
            $("#ogNature").attr("value", data.nature);
            percent += 4;
        }
        if (data.name){
            $("#ogNameText").attr("value", data.name);
            percent += 6;
        }
        if (data.ogIndustry){
            $("#ogIndustry").attr("value",data.ogIndustry);
            percent += 6;
        }
        if(data.ogArea){
            $("#ogArea").attr("value", data.ogArea);
            percent += 6;
        }
        if (data.relPeople){
             $("#relPeople").attr("value", data.relPeople);
            percent += 6;
        }
        if (data.relTel){
            $("#relTel").attr("value", data.relTel);
            percent += 6;
        }
        if (data.variety){
             $("#variety").attr("value", data.variety);
            percent += 4;
        }
        if (data.capital){
            $("#capital").attr("value", data.capital);
            percent += 6;
        }
        if (data.account){
            $("#account").attr("value", data.account);
            percent += 8;
        }
        if(data.companyDsc){
            $("#companyDsc").attr("value", data.companyDsc);
            percent += 8;
        }
        if(data.companyPrm){
            $("#companyPrm").attr("value", data.companyPrm);
            percent += 8;
        }
        if (data.needs){
            $("#needs").attr("value", data.needs);
            percent += 8;
        }
        if (data.difficulty){
             $("#difficulty").attr("value", data.difficulty);
            percent += 8;
        }
        if (data.support){
            $("#support").attr("value", data.support);
        percent += 8;
        }
    }
    SetPercent();

    // 检测表单select的输入值变化
    $("select").change(function () {
        var selected = $.trim($(this).find("option:selected").text());
        var attr = $(this).attr("name");
        if (!data[attr]){
            if (selected){
                percent += 4;
                SetPercent();
            }else{
                percent -= 4;
                SetPercent();
            }
        }
        data[attr] = selected;
    });
    // 检测表单input输入
    $(".formContent input").blur(function () {
        var content = $.trim($(this).val());
        var attr = $(this).attr("name");
        if (!data[attr]){
            if (content){
                percent += 6;
                SetPercent();
            }else{
                if(data[attr]){
                    percent -= 6;
                    SetPercent();
                }
            }
        }else{
            if(!content){
                percent -= 6;
                SetPercent();
            }
        }
        data[attr] = content;
    });
    // 检测textarea输入
    $(".formContent textarea").blur(function () {
        var content = $.trim($(this).val());
        var attr = $(this).attr("name");
        if (!data[attr]){
            if (content){
                percent += 8;
                SetPercent();
            }else{
                if(data[attr]){
                    percent -=8;
                    SetPercent();
                }
            }
        }else{
            if(!content){
                percent -= 8;
                SetPercent();
            }
        }
        data[attr] = content;
    });

    // 客户立项表单提交
    $(".messageForm").submit(function (e) {
        e.preventDefault();
    });
    $(".csSubmitBtn").click(function () {

        delete data.csCard;
        var card = $("#csImage").get(0).files[0];
        var formData = new FormData();
        if (card){
            var uuid = generateUUID();
            formData.append("card_image", card);
            formData.append("uuid", uuid);
            formData.append("card_name", card.name);
        }
        $.each(data, function (k, v) {
            formData.append(k, v);
        });
        checkData(data);
        if (cid){
            // 修改客户信息
            // checkData(data);
            $.ajax({
                url: host + "customers/" + cid + "/",
                type: "PUT",
                data: formData,
                processData: false,
                contentType: false,
                headers: {
                    "Authorization": "JWT " + token
                },
                success: function (res) {
                    alert("修改成功！")
                    window.location.reload();
                },
                error: function (e) {
                    alert("网络错误，请稍后再试...");
                    console.log(e.error)
                }
            })
        }else{
            // 客户立项
            // checkData(data);
            $.ajax({
                url: host + 'customers/',
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                headers: {
                    "Authorization": "JWT " + token
                },
                success:function (res) {
                    if (res.id){
                        alert("添加成功！");
                        window.location.href = "setcustomer.html?cs=" + res.id;
                    }else{
                        alert("数据错误, 请检查所填信息...")
                    }
                },
                error: function (e) {
                    alert("网络错误，请稍后再试...");
                    console.log(e.error)
                }
            });
        }

    });

    function checkData(data) {

        if (!data.type){
            alert("请选择客户类型！");
            return false
        }
        if (!data.business){
            alert("请选择业务类型！");
            return false
        }
        if (!data.name){
            alert("请填写单位名称！");
            return false
        }
        if (!data.nature){
            alert("请选择单位性质！");
            return false
        }
        if (!data.industry){
            alert("请填写所属行业！");
            return false
        }
        if (!data.area){
            alert("请填写所属地区！");
            return false
        }
        if (!data.linkman){
            alert("请填写单位联系人！");
            return false
        }
        if (!data.telephone){
            alert("请填写联系电话！");
            return false
        }
        if (!data.variety){
            alert("请选择涉及品种！");
            return false
        }
        if (!data.account){
            alert("请描述开户/交易情况！");
            return false
        }
        if (!data.situation){
            alert("描述企业概况！");
            return false
        }
        return true
    }
    // 获取查询参数
    function GetQueryString(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
         var r = window.location.search.substr(1).match(reg);
         if(r!=null)return  unescape(r[2]); return null;
    }
    // 动态设定进度
    function SetPercent() {
        $(".progress progress").val(percent);
        $(".progress .percent").html(percent + "%");
    }

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