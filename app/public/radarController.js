/**
 * Created by Think on 2016/10/17.
 */
/**
 * Created by Think on 2016/9/8.
 */
qingniwan.run(function (amMoment) {
    amMoment.changeLocale('zh-cn');
});
qingniwan.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
});
qingniwan.controller('radarController', ['$scope', '$http', '$location', 'util', 'moment', '$httpParamSerializerJQLike', '$interval', '$compile', 'baseData', '$timeout', function ($scope, $http, $location, util, moment, $httpParamSerializerJQLike, $interval, $compile, baseData, $timeout) {

    //repeate完成事件
    $scope.$on('repeatFinishcallBack', function(event) {
        $('label').click(function() {
            var radioId = $(this).attr('for');
            $('label').children("span").removeAttr('class') && $(this).children("span").attr('class', 'checked');
            $('input[type="radio"]').removeAttr('checked') && $('#' + radioId).attr('checked', 'checked');
            $("#parentDataLi i").addClass("ifShowMoreBtnStyle");
            if($(this).parent().children("#ifShowMoreBtn").html()!="[]"){
                debugger
                $(this).parent().children("i").removeClass("ifShowMoreBtnStyle");
            }

        });

        //延迟加载
        setTimeout(function () {
            /* $("#J_maskLayer").addClass("maskLayer");
             debugger
             $("#J_AnswerQuestionForScan").css({"display": "block"});
             $("#parentOfQuestionList").css({"display": "block"});*/
            //测试动画
            if($scope.baseData.recOpenID == (decodeURIComponent(util.parseURL(location.href).params['sendOpenID'])) || !isWeiXin()){
                debugger
            }else{
                $("#J_maskLayer").addClass("animated fadeInUp maskLayer");
                $("#J_AnswerQuestionForScan").addClass("animated fadeInUp");
                $("#parentOfQuestionList").addClass("animated fadeInUp");
                $("#J_AnswerQuestionForScan").css({"display": "block"});
                $("#parentOfQuestionList").css({"display": "block"});
            }

            debugger
        }, 3000);
    });
    //SONRepeate完
    $scope.$on('sonRepeatFinishcallBack', function(event) {
        $('label').click(function() {
            var sonOfRadioId = $(this).attr('for');
            $('label').children("span").removeAttr('class') && $(this).children("span").attr('class', 'checked');
            $('input[type="radio"]').removeAttr('checked') && $('#' + sonOfRadioId).attr('checked', 'checked');

        });


    });

    //打开微信的接收者自己信息
    $scope.baseData = baseData;
    console.log('$scope.baseData', $scope.baseData);

    //扫描结果数组初始化
    $scope.final = [];
    $scope.radar = {};
    $scope.questionOptionsDataList = {};
    $scope.showScanResultsDetailsModal = {};
    $scope.ScanNearOrMoreText = "扫附近的人";

    //列表和按钮初始化
    $("#scanningImagesList").css({"display": "block"});
    //$("#swiper-container").css({"display": "none"});
    $("#parentOfQuestionList").css({"display": "none"});
    $("#sonOfQuestionList").css({"display": "none"});
    $("#J_AnswerQuestionForScan").css({"display": "none"});
    $("#J_IComeToScan").css({"display": "none"});
    $("#J_ScanWeiXinFirend").css({"display": "none"});
    $("#J_ScanMore").css({"display": "none"});
    $("#J_contactTAFromINVITE").css({"display": "none"});
    $("#J_InvitePeopleDetailsModalCloseBtn").css({"display": "none"});

    //微信分享的url参数
    $scope.afterSubmitQuestion = ""/*location.href.split('#')[0]*/;
    //微信分享时UI调用接口
    $scope.API_weixinshare = "/interface?interface=Weixin&api=getJSAPIticket&version=3.0";
    //获取问题列表接口
    $scope.API_getQuestionList = "/interface?interface=Answer&api=questionList&version=4.0";
    //提交问题列表接口
    $scope.API_postQuestion = "/interface?interface=Answer&api=wx_submitAnswer&version=4.0";
    //雷达扫描结果列表
    $scope.API_scanResults = "/interface?interface=Answer&api=wx_scanResults&version=4.0";
    //短信通知扫描结果接口
    $scope.API_SMSNotificationScanResults = "/interface?interface=Answer&api=remove&version=4.0";
    //点击查看invite详情接口
    $scope.API_PersonDetailOfInvite = "/interface?interface=User&api=PersonDetail&version=4.0";

    if ($scope.baseData.recOpenID == (decodeURIComponent(util.parseURL(location.href).params['sendOpenID'])) || !isWeiXin()) {
        debugger
        $("#J_ViewTheResults").css({"display": "block"});
        debugger
        //扫描者图像(进入自己扫描后扫描这换位微信打开着的人)
        $scope.thePeopleOfScanning = {};
        $scope.thePeopleOfScanning.img = $scope.baseData.wxImg;
        $scope.thePeopleOfScanning.answer = "";
        $("#OneSelf").addClass("borderStyle");
        $scope.final = [];
        var temporaryArr = [];//放在最外面 临时数组  每次弄完临时数组得重新赋值
        var arr = [];
        $scope.radar.ScansResultListOfMyself = {
            "sendOpenID": $scope.baseData.recOpenID,
            "recOpenID": $scope.baseData.recOpenID

        };
        updateMySelfScanResultList();
        $scope.timer_MySelfSms = $interval(function () {
            updateMySelfScanResultList()
        }, 5000);

        debugger
    } else {
        debugger
        $("#J_ViewTheResults").css({"display": "none"});
        //扫描者图像(进入自己扫描后扫描这换位微信打开着的人)
        $scope.thePeopleOfScanning = {};
        $scope.thePeopleOfScanning.img = decodeURIComponent(util.parseURL(location.href).params['img']);
        $scope.thePeopleOfScanning.answer = decodeURIComponent(util.parseURL(location.href).params['answer']);
        $("#OneSelf").addClass("borderStyle");

        /**
         *  进入页面获取发送者的扫描结果,几秒后弹出问题列表弹窗
         */
        //先判断本页面是invite用户还是微信用户(暂时没有invite用户)
        if (decodeURIComponent(util.parseURL(location.href).params['sendOpenID']) != "undefined") {
            $scope.sendOpenID = decodeURIComponent(util.parseURL(location.href).params['sendOpenID']);
            $scope.radar.ScansResultListOfOthers = {
                "sendOpenID": $scope.sendOpenID,
                "recOpenID": ""
            };

        } else if (decodeURIComponent(util.parseURL(location.href).params['inviteID']) != "undefined") {
            $scope.inviteID = decodeURIComponent(util.parseURL(location.href).params['inviteID']);
            $scope.radar.ScansResultListOfOthers = {
                "inviteID": $scope.inviteID,
                "recOpenID": ""
            };

        }


        $scope.final = [];
        var temporaryArr = [];//放在最外面 临时数组  每次弄完临时数组得重新赋值
        var arr = [];
        updateOtherScanResultList();
        $scope.timer_OthersSms = $interval(function () {
            updateOtherScanResultList()

        }, 5000);


        //模拟数据(mock结束)
        /*  $scope.final=[];
         var  temporaryArr=[];//放在最外面 临时数组  每次弄完临时数组得重新赋值
         var arr=[];
         res={
         "data":{
         "question":"吃个饭",
         "userList":
         [
         {"answer":"在干活","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0},
         {"answer":"在学习","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/swkt_06.jpg","isWxUser":1},
         {"answer":"在学习","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/96a02d97ed3e08fec9dcc2c38a359cff_320_480.jpeg","isWxUser":1},
         {"answer":"在干活","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0},
         {"answer":"在学习","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/swkt_06.jpg","isWxUser":0},
         {"answer":"在干活","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0},
         {"answer":"在学习","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/swkt_06.jpg","isWxUser":0},
         {"answer":"在干活","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0}
         ],
         "shareUrl":"http://sdfsfsf"
         },

         "code":"200",
         "msg":"success"
         };

         //先比较两个数组有何不同,把不同的值放在新的数组中,下面再调用随机数再生成新的随机位置
         var differentArray=[];
         if(temporaryArr.length==0){

         differentArray=res.data.userList
         }else{
         differentArray=DifferentValues(temporaryArr,res.data.userList)
         }

         //调用生成新的随机位置
         if(differentArray.length!=0){
         for(var i=0;i<differentArray.length;i++){
         $scope.final.push(differentArray[i]);
         debugger
         }
         }

         console.log('final',$scope.final)
         debugger

         var randomes=[];

         randomes=random(differentArray,12)
         //总随机数(包含之前的随机数)
         var delay = .5;
         for(var i=0;i<randomes.length;i++){
         $("#div_"+i).addClass("cell-"+randomes[i]+" animated bounceIn" );
         $("#div_"+i).css({"animation-duration":"1s",
         "animation-delay": (i*delay)+"s",
         "-webkit-animation-duration": "1s",
         "-webkit-animation-delay":(i*delay)+"s"});

         debugger
         }
         arr=randomes;
         console.log('arr',arr);
         temporaryArr=res.data.userList;*/

//(mock结束)

    }


    /**
     *  获取问题列表
     */
    $http({
        url: $scope.API_getQuestionList,
        method: 'POST'
    })
        // 后端返回数据
        .success(function (res) {
            if (res.code == 200) {

                /*   $("#div_0").css({"display":"block"})*/
                /* if ($scope.final.length != 0) {
                 debugger;

                 $("#div_0").addClass("cell-1 animated bounceIn");
                 $("#div_0").css({
                 "animation-duration": "1s",
                 "animation-delay": "1s",
                 "-webkit-animation-duration": "1s",
                 "-webkit-animation-delay": "1s"
                 });
                 debugger
                 }*/
                //$scope.questionOptionsDataList=res.data;

                //调用方法生成二维数组
                var arrFor2DArray = res.data.questionList;
                $scope.finalQuestionDataList = res.data;
                $scope.finalQuestionDataList.questionList = [];
                $scope.finalQuestionDataList.questionList = arrSlice(arrFor2DArray, 5);


                //微信分享的参数URL
                $scope.afterSubmitQuestion = $scope.finalQuestionDataList.url + "?sendOpenID=" + $scope.baseData.recOpenID + "&sex=" + $scope.baseData.sex + "&img=" + $scope.baseData.wxImg + "&userName=" + $scope.baseData.wxName;
                console.log("已经配置好的ul参数", $scope.afterSubmitQuestion)

            } else {
                // 请求数据失败, 打印错误信息
                util.artDialogHint(res.msg);
            }
        })
        // 后端返回异常
        .error(function (err) {
            util.artDialogHint(err);

        });

    //按钮事件类
    /**
     * 提交问题按钮
     */
    $scope.AnswerQuestionForScanBtn = function () {
        var radioAnswerValue = $('label span[class*="checked"]').next("input").val();

        if (!radioAnswerValue) {
            $('#answerQuestionForScanPromptModal').modal('show');
            return false
        } else {
            $scope.radar.SubmitQuestions = radioAnswerValue;
            if (decodeURIComponent(util.parseURL(location.href).params['sendOpenID']) != "undefined") {
                $scope.sendOpenID = decodeURIComponent(util.parseURL(location.href).params['sendOpenID']);
                $scope.radar.SubmitQuestionsConfig = {
                    "sendOpenID": $scope.sendOpenID,
                    "recOpenID": $scope.baseData.recOpenID,
                    "answer": $scope.radar.SubmitQuestions,
                    "sex": $scope.baseData.sex,
                    "wxName": $scope.baseData.wxName,
                    "wxImg": $scope.baseData.wxImg

                };
            } else if (decodeURIComponent(util.parseURL(location.href).params['inviteID']) != "undefined") {
                $scope.inviteID = decodeURIComponent(util.parseURL(location.href).params['inviteID']);
                $scope.radar.SubmitQuestionsConfig = {
                    "inviteID": $scope.inviteID,
                    "recOpenID": $scope.baseData.recOpenID,
                    "answer": $scope.radar.SubmitQuestions,
                    "sex": $scope.baseData.sex,
                    "wxName": $scope.baseData.wxName,
                    "wxImg": $scope.baseData.wxImg

                };
            }

            $http({
                url: $scope.API_postQuestion,
                method: 'post',
                data: $httpParamSerializerJQLike($scope.radar.SubmitQuestionsConfig),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                // 后端返回数据
                .success(function (res) {
                    if (res.code == 200) {

                        //测试动画
                        $("#J_maskLayer").removeClass("fadeInUp").addClass("fadeOutDown").css({
                            "animation-duration": "1s",
                            "animation-delay":"1s",
                            "-webkit-animation-duration": "1s",
                            "-webkit-animation-delay": "1s"
                        });
                        $("#J_AnswerQuestionForScan").removeClass("fadeInUp").addClass("fadeOutDown").css({
                            "animation-duration": "1s",
                            "animation-delay":"1s",
                            "-webkit-animation-duration":"1s",
                            "-webkit-animation-delay": "1s"
                        });
                        $("#parentOfQuestionList").removeClass("fadeInUp fadeInLeft").addClass("fadeOutDown").css({
                            "animation-duration":"1s",
                            "animation-delay":"1s",
                            "-webkit-animation-duration": "1s",
                            "-webkit-animation-delay":"1s"
                        });
                        $("#sonOfQuestionList").removeClass("fadeInUp fadeInRight").addClass("fadeOutDown").css({
                            "animation-duration":"1s",
                            "animation-delay": "1s",
                            "-webkit-animation-duration":"1s",
                            "-webkit-animation-delay": "1s"
                        });

                        setTimeout(function () {
                            $("#J_maskLayer").removeClass("maskLayer");
                            $("#J_AnswerQuestionForScan").css({"display": "none"});
                            $("#parentOfQuestionList").css({"display": "none"});
                            $("#sonOfQuestionList").css({"display": "none"});
                            $("#J_IComeToScan").css({"display": "block"});
                        }, 2000);


                        if (decodeURIComponent(util.parseURL(location.href).params['sendOpenID']) != "undefined") {
                            $scope.sendOpenID = decodeURIComponent(util.parseURL(location.href).params['sendOpenID']);
                            $scope.radar.ScansResultListOfOthers = {
                                "sendOpenID": $scope.sendOpenID,
                                "recOpenID": $scope.baseData.recOpenID

                            };

                        } else if (decodeURIComponent(util.parseURL(location.href).params['inviteID']) != "undefined") {
                            $scope.inviteID = decodeURIComponent(util.parseURL(location.href).params['inviteID']);
                            $scope.radar.ScansResultListOfOthers = {
                                "inviteID": $scope.inviteID,
                                "recOpenID": $scope.baseData.recOpenID


                            };

                        }

                        //微信分享所用文案和url参数
                        $scope.shareTitle1 = res.data.shareTitle1;
                        $scope.shareText1 = res.data.shareText1;
                        $scope.shareTitle2 = res.data.shareTitle2;
                        $scope.shareText2 = res.data.shareText2;
                        $scope.afterSubmitQuestion = $scope.afterSubmitQuestion + "&answer=" + $scope.radar.SubmitQuestions;

                        /**
                         * 微信分享功能
                         */
                        var data = {
                            url: location.href.split('#')[0]
                        };
                        var transform = function (data) {
                            return $.param(data);
                        };
                        console.log("微信Url", $scope.afterSubmitQuestion);
                        /* *
                         *发送请求获取微信分享功能 获取经纬度算距离,自己的经纬度可能会变
                         */
                        $http.post($scope.API_weixinshare, data, {
                            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                            transformRequest: transform

                        }).success(function (res) {
                            $scope.globalAllData = res;
                            var msgData = {
                                imgUrl: 'http://www.qingniwan.cc/qingniwan/img/radar-shareTimeLine.png', /*$scope.allData.data.userImg*/
                                link: $scope.afterSubmitQuestion /*||location.href.split('#')[0]*/,
                                desc: $scope.shareText1,
                                title: $scope.shareTitle1, // TODO:编码字符串 encodeURIComponent()
                                backUrl: window.location
                            };
                            var msgData2 = {
                                imgUrl: $scope.baseData.wxImg, /*$scope.allData.data.userImg*/
                                link: $scope.afterSubmitQuestion /*||location.href.split('#')[0]*/,
                                desc: $scope.shareText2,
                                title: $scope.shareTitle2, // TODO:编码字符串 encodeURIComponent()
                                backUrl: window.location
                            };
                            wx.config({
                                //  debug: true,
                                appId: $scope.globalAllData.data.appId, // 必填，公众号的唯一标识
                                timestamp: $scope.globalAllData.data.timestamp, // 必填，生成签名的时间戳
                                nonceStr: $scope.globalAllData.data.nonceStr, // 必填，生成签名的随机串
                                signature: $scope.globalAllData.data.signature,// 必填，签名，见附录1
                                jsApiList: ['onMenuShareQQ',
                                    'onMenuShareWeibo',
                                    'onMenuShareTimeline',
                                    'onMenuShareAppMessage',
                                    'showOptionMenu',
                                    'checkJsApi',
                                    'openLocation',
                                    'getLocation'
                                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                            });
                            wx.ready(function () {
                                wx.onMenuShareQQ(msgData);
                                wx.onMenuShareWeibo(msgData);
                                wx.onMenuShareTimeline(msgData);
                                wx.onMenuShareAppMessage(msgData2);

                            });
                            /*   wx.success(function(res){
                             // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                             });
                             wx.error(function(res){
                             // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。

                             });*/
                            //console.log(msgData);
                        });

                    } else {
                        // 请求数据失败, 打印错误信息
                        util.artDialogHint(res.msg);

                        //mock
                        /*    $("#J_maskLayer").removeClass("maskLayer");
                         debugger
                         $("#J_AnswerQuestionForScan").css({"display": "none"});
                         $("#swiper-container").css({"display": "none"});
                         $("#J_IComeToScan").css({"display": "block"});*/
                        //mock结束
                    }
                })
                // 后端返回异常
                .error(function (err) {
                    util.artDialogHint(err);

                });
        }
    };

    /**
     * 点击我也来扫一扫时,进入打开微信者的扫描结果逻辑
     */
    $scope.IComeToScanBtn = function () {
        /*   $(".pointer").css({"animation-play-state":"paused", "-webkit-animation-play-state":"paused","animation-fill-mode":"backwards","-webkit-animation-fill-mode":"backwards"});
         $(".pointer").css({"animation-play-state":"running", "-webkit-animation-play-state":"running"});*/
        $interval.cancel($scope.timer_OthersSms);
        debugger
        cleanFinalDataList();
        debugger
        //var temporaryArr = [];//放在最外面 临时数组  每次弄完临时数组得重新赋值
        //var arr = [];
        // console.log("输出第一次清空的我也来扫一扫temporaryArr数组",temporaryArr)
        $("#J_IComeToScan").css({"display": "none"});
        $("#J_ScanWeiXinFirend").css({"display": "block"});

        $scope.radar.ScansResultListOfMyself = {
            "sendOpenID": $scope.baseData.recOpenID,
            "recOpenID": $scope.baseData.recOpenID

        };


        // updateMySelfScanResultList();
        $scope.timer_MySelfSms = $interval(function () {
            updateMySelfScanResultList()
        }, 3000);
    };

    /*扫描附近的人*/
    var n = 1;
    $scope.ScanNearOrMoreBtn = function () {
        if (n == 1) {
            /*   $(".pointer").css({"animation-play-state":"paused", "-webkit-animation-play-state":"paused","animation-fill-mode":"backwards","-webkit-animation-fill-mode":"backwards"});
             $(".pointer").css({"animation-play-state":"running", "-webkit-animation-play-state":"running"});*/
            $interval.cancel($scope.timer_MySelfSms);
            /*$(".distanceGroup").css({"display":"block"});*/
            debugger
            cleanFinalDataList();
            debugger
            $scope.ScanNearOrMoreText = "下载INVITE";

            // $scope.final=[];
            //var  temporaryArr=[];//放在最外面 临时数组  每次弄完临时数组得重新赋值
            //console.log("输出第一次清空的temporaryArr数组",temporaryArr)
            // var arr=[];
            //  updateMySelfNearPeopleResultList();
            $scope.timer_MySelfNearPeopleSms = $interval(function () {
                updateMySelfNearPeopleResultList()
            }, 3000);

            /**
             * 微信授权获取经纬度??(mock开始) //模拟数据(mock)
             */
            /*  var data = {
             url: location.href.split('#')[0]
             };
             var transform = function (data) {
             return $.param(data);
             };
             console.log("微信Url", $scope.afterSubmitQuestion);
             /!* *
             *发送请求获取微信分享功能 ???获取经纬度算距离,自己的经纬度可能会变
             *!/
             $http.post($scope.API_weixinshare, data, {
             headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
             transformRequest: transform

             }).success(function (res) {
             $scope.globalAllData = res;

             wx.config({
             //  debug: true,
             appId: $scope.globalAllData.data.appId, // 必填，公众号的唯一标识
             timestamp: $scope.globalAllData.data.timestamp, // 必填，生成签名的时间戳
             nonceStr: $scope.globalAllData.data.nonceStr, // 必填，生成签名的随机串
             signature: $scope.globalAllData.data.signature,// 必填，签名，见附录1
             jsApiList: [
             'checkJsApi',
             'openLocation',
             'getLocation'

             ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
             });
             wx.ready(function () {
             wx.checkJsApi({
             jsApiList: [
             'getLocation'
             ],
             success: function (res) {
             // alert(JSON.stringify(res));
             // alert(JSON.stringify(res.checkResult.getLocation));
             if (res.checkResult.getLocation == false) {
             alert('你的微信版本太低，不支持微信JS接口，请升级到最新的微信版本！');
             return;
             }
             }
             });
             wx.getLocation({
             success: function (res) {
             $scope.thePeopleOfScanning.latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
             $scope.thePeopleOfScanning.longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
             var speed = res.speed; // 速度，以米/每秒计
             var accuracy = res.accuracy; // 位置精度
             },
             cancel: function (res) {
             alert('用户拒绝授权获取地理位置');
             }
             });

             });
             /!*   wx.success(function(res){
             // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
             });
             wx.error(function(res){
             // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。

             });*!/
             console.log(msgData);
             });
             if($scope.thePeopleOfScanning.latitude==undefined){
             //经纬度等于undefined说明没有授权获取地理位置
             return
             }else{

             res={
             "data":{
             "question":"吃个饭",
             "userList":
             [
             {"answer":"在干活","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0},
             {"answer":"在学习","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/swkt_06.jpg","isWxUser":1},
             {"answer":"在学习","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/96a02d97ed3e08fec9dcc2c38a359cff_320_480.jpeg","isWxUser":1},
             {"answer":"在干活","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0},
             {"answer":"在学习","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/swkt_06.jpg","isWxUser":0},
             {"answer":"在干活","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0},
             {"answer":"在学习","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/swkt_06.jpg","isWxUser":0},
             {"answer":"在干活","doing":"看电影","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0}
             ],
             "shareUrl":"http://sdfsfsf"
             },

             "code":"200",
             "msg":"success"
             };

             //先比较两个数组有何不同,把不同的值放在新的数组中,下面再调用随机数再生成新的随机位置
             var differentArray=[];
             if(temporaryArr.length==0){

             differentArray=res.data.userList
             debugger
             }else{
             differentArray=DifferentValues(temporaryArr,res.data.userList)
             debugger
             }

             //调用生成新的随机位置
             if(differentArray.length!=0){
             for(var i=0;i<differentArray.length;i++){
             if(differentArray[i].isWxUser==0){
             differentArray[i].isWxOrInviteIcon="/qingniwan/img/radar-inviteDisIon.png";
             differentArray[i].distanceText =differentArray[i].lat//"距离值";
             }else if(differentArray[i].isWxUser==1){
             differentArray[i].isWxOrInviteIcon="/qingniwan/img/radar-weixinDisIcon.png";
             differentArray[i].distanceText ="微信";
             }
             //???根据经纬度算出距离
             $scope.final.push(differentArray[i]);
             debugger
             }

             }

             console.log('final',$scope.final)
             debugger

             var randomes=[];

             randomes=random(differentArray,12)
             //总随机数(包含之前的随机数)
             var delay = .5;
             for(var i=0;i<randomes.length;i++){

             $("#div_"+i).addClass("cell-"+randomes[i]+" animated bounceIn" );
             $("#div_"+i).css({"animation-duration":"1s",
             "animation-delay": (i*delay)+"s",
             "-webkit-animation-duration": "1s",
             "-webkit-animation-delay":(i*delay)+"s"});

             debugger
             }
             arr=randomes;
             console.log('arr',arr);
             temporaryArr=res.data.userList;

             //(mock结束)


             }*/


        } else {
            $('#ScanMorePromptModal').modal('show');

        }
        n += 1
    };

    /**
     * 点击头像查看详细信息
     * */
    $scope.openScanningImageDetails = function ($event, objectForModal) {
        if (!objectForModal) {
            return
        }

        $scope.userInfor = {};
        API_PersonDetailOfInvite = "/interface?interface=User&api=PersonDetail&version=4.0";

        if (objectForModal.isWxUser == 0) {
            $scope.radar.PersonDetailOfInviteConfig = {
                "userID": objectForModal.userID,
                "visitorID": objectForModal.userID
            };
            $http({
                url: API_PersonDetailOfInvite,
                method: 'post',
                data: $httpParamSerializerJQLike($scope.radar.PersonDetailOfInviteConfig),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                // 后端返回数据
                .success(function (res) {
                    if (res.code == 200) {
                        $("#logo").attr("src","data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
                        $scope.userInfor.rankImg="";
                        $("#J_contactTAFromINVITE").css({"display": "block"});
                        $("#J_InvitePeopleDetailsModalCloseBtn").css({"display": "block"});
                        $("#ScanningInvitePeopleDetailsModal").modal('show');
                        $scope.userInfor = res.data;
                        if ($scope.userInfor.criticism == 1) {
                            $scope.userInfor.rankImg = "/qingniwan/img/radar-Gezi.png"
                        } else if ($scope.userInfor.criticism == 2) {
                            if ($scope.userInfor.rank == 1) {
                                $scope.userInfor.rankImg = "/qingniwan/img/radar-star.png"
                            } else if ($scope.userInfor.rank == 2) {
                                $scope.userInfor.rankImg = "/qingniwan/img/radar-crown.png"
                            }else if($scope.userInfor.rank == 0){
                                $scope.userInfor.rankImg = "";
                                $("#logo").attr("src","data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")
                            }
                        }

                        if ($scope.userInfor.sex == 0) {
                            $("#badge-genderIcon-BG").attr("class", "badge badge-gender badge-gender-male")
                            $("#badge-genderIcon-ICON").attr("class", "icon icon-gender-male")
                        } else if ($scope.userInfor.sex == 1) {
                            $("#badge-genderIcon-BG").attr("class", "badge badge-gender badge-gender-female")
                            $("#badge-genderIcon-ICON").attr("class", "icon icon-gender-female")
                        }

                    }
                    else {
                        // 请求数据失败, 打印错误信息
                        util.artDialogHint(res.msg);
                    }
                })
                // 后端返回异常
                .error(function (err) {
                    util.artDialogHint(err);

                });


        } else if (objectForModal.isWxUser == 1) {

            //$scope.showScanResultsDetailsModal = objectForModal;
            /*  judgeSex(objectForModal.sex);*/
            $("#J_HeadPortrait").attr("src", objectForModal.img);
            if (objectForModal.userName) {
                $("#J_userName").html(objectForModal.userName);
            } else if (objectForModal.name) {
                $("#J_userName").html(objectForModal.name);
            }

            $("#J_answer").html(objectForModal.answer);
            if (objectForModal.sex == 0) {
                $("#J_sexIcon").attr("src", "/qingniwan/img/radar-man.png");

            } else if (objectForModal.sex == 1) {
                $("#J_sexIcon").attr("src", "/qingniwan/img/radar-woman.png");

            }

            $('#ScanningWixinPeopleDetailsModal').modal('show');
            //邀请她加入invite按钮
            $("#J_contactTAFromINVITE").css({"display": "block"});

        }
    };

    /**
     * 关闭微信好友详情弹窗前
     */
    $('#ScanningWixinPeopleDetailsModal').on('hide.bs.modal', function () {
        $("#J_contactTAFromINVITE").css({"display": "none"});
    });

    /**
     * 关闭INVITE好友详情弹窗
     */
    $scope.InvitePeopleDetailsModalBtn = function () {
        $('#ScanningInvitePeopleDetailsModal').modal('hide');
        $("#J_contactTAFromINVITE").css({"display": "none"});
        $("#J_InvitePeopleDetailsModalCloseBtn").css({"display": "none"});
    };

    /**
     * 扫微信好友按钮
     * */
    $scope.ScanWeiXinFirendBtn = function () {
        $('#shareWithFriendsForScanningModal').modal('show');
    };

    /**
     * 扫描更多按钮
     * */
    $scope.ScanMorePromptModalOfTomorrow = function () {
        $('#ScanMorePromptModal').modal('hide');
    };
    $scope.ScanMorePromptModalOfImmediately = function () {
        window.location.href = "/qingniwan/download?do=download";
    };

    /**
     * 提示框按钮点击关闭事件
     */
    $scope.answerQuestionForScanPromptModalBtn = function () {
        $('#answerQuestionForScanPromptModal').modal('hide');
    };

    /**
     * 切换到子问题列表页面
     */
    $scope.SwitchToSonBtn=function(item){
        $("#parentOfQuestionList").css({"display": "none"});
        $("#sonOfQuestionList").addClass(" animated fadeInRight" );
        $("#sonOfQuestionList").css({"display": "block"});
        $scope.finalOfSonQuestionDataList=[];
        $scope.finalOfSonQuestionDataList=arrSlice(item.subClass, 5);
        debugger
    };

    /**
     * 切换到父问题列表页面
     */
    $scope.SwitchBackToParentBtn=function(){
        /*$("#sonOfQuestionList").css({"display": "none"});
         $("#parentOfQuestionList").addClass(" animated fadeInLeft" );
         $("#parentOfQuestionList").css({"display": "block"});*/
//测试动画
        $("#sonOfQuestionList").css({"display": "none"});
        $("#parentOfQuestionList").removeClass("fadeInUp").addClass("fadeInLeft");
        $("#parentOfQuestionList").css({"display": "block"});
        var iInParentDataUl=$("#parentDataUl I");
        for(var i=0;i<iInParentDataUl.length;i++){
            var currentI=iInParentDataUl[i];
            if(!($(currentI).hasClass("ifShowMoreBtnStyle"))){
                debugger
                $(currentI).parent().children("label").children("span").addClass("performance");
            }
        }
    };

    //工具类函数
    /**
     * 判断是否为微信浏览器
     */
    function isWeiXin() {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 清空final数据,扫描微信打开者的扫描模式初始化
     */
    function cleanFinalDataList() {
        //首先清空扫描结果列表,并更换中心(扫描者)图像,停止他人的扫描结果逻辑,开始微信打开者扫描逻辑
        $scope.final = [];
        temporaryArr = [];//放在最外面 临时数组  每次弄完临时数组得重新赋值
        arr = [];

        var scanningImagesListData = $('#scanningImagesList img');
        for (var i = 0; i < scanningImagesListData.length; i++) {
            if ($(scanningImagesListData[i]).hasClass("borderStyle")) {
                $(scanningImagesListData[i]).removeClass("borderStyle");
            }
            $(scanningImagesListData[i]).attr("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
        }
        debugger
        $scope.thePeopleOfScanning = {};
        $scope.thePeopleOfScanning.img = $scope.baseData.wxImg;
        $("#OneSelf").attr("src", $scope.baseData.wxImg);
        $("#OneSelf").addClass("borderStyle");
        $scope.thePeopleOfScanning.answer = $scope.radar.SubmitQuestions;

        var scanningImagesListDataStyle = $('#scanningImagesList div');
        for (var i = 0; i < scanningImagesListDataStyle.length; i++) {
            if ($(scanningImagesListDataStyle[i]).hasClass("animated")) {
                $(scanningImagesListDataStyle[i]).removeAttr("class");
                $(scanningImagesListDataStyle[i]).attr("class", "cellContent");

            }
        }
        debugger
    }

    /**
     * 扫描分享者的结果方法
     */
    function updateOtherScanResultList() {

        $http({
            url: $scope.API_scanResults,
            method: 'post',
            data: $httpParamSerializerJQLike($scope.radar.ScansResultListOfOthers),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            // 后端返回数据
            .success(function (res) {
                if (res.code == 200) {
                    /*   $("#div_0").css({"display":"block"})*/
                    if (res.data.userList.length != 0) {
                        if ($scope.final.length < 8) {

                            //先比较两个数组有何不同,把不同的值放在新的数组中,下面再调用随机数再生成新的随机位置

                            var differentArray = [];
                            if (temporaryArr.length == 0) {
                                differentArray = res.data.userList
                            } else {
                                differentArray = DifferentValues(temporaryArr, res.data.userList)
                            }

                            //对比出的不同的数组
                            if (differentArray.length != 0) {
                                for (var i = 0; i < differentArray.length; i++) {
                                    $scope.final.push(differentArray[i]);

                                }

                                var randomes = [];
                                randomes = random(differentArray, 11);

                                //总随机数(包含之前的随机数)
                                // var delay = .5;
                                for (var i = 0; i < randomes.length; i++) {
                                    var delay = Math.random() * 1.5 + 0.5;
                                    $("#div_" + i).addClass("cell-" + randomes[i] + " animated bounceIn");
                                    $('#div_' + i + ' img[class="cell"]').addClass("borderStyle");
                                    $("#div_" + i).css({
                                        "animation-duration": "1s",
                                        "animation-delay": (i * delay) + "s",
                                        "-webkit-animation-duration": "1s",
                                        "-webkit-animation-delay": (i * delay) + "s"
                                    });
                                }
                                arr = randomes;
                                temporaryArr = res.data.userList;


                            }
                        } else if ($scope.final.length == 8) {
                            console.log("final等于8");
                            var resDataDiff = DifferentValuesForReplace($scope.final, res.data.userList);

                            if (resDataDiff.length != 0) {

                                var finalDataDiff = DifferentValuesForReplace(res.data.userList, $scope.final);
                                //var delay = .5
                                for (var i = 0; i < resDataDiff.length; i++) {
                                    $scope.final[finalDataDiff[i].currentIndex] = resDataDiff[i].differentArrayVal;


                                    $("#div_" + finalDataDiff[i].currentIndex).removeClass("animated bounceIn");
                                    $("#div_" + finalDataDiff[i].currentIndex).addClass("animated bounceIn");
                                    $("#div_" + finalDataDiff[i].currentIndex).css({
                                        "animation-duration": "1s",
                                        "animation-delay": (2 * delay) + "s",
                                        "-webkit-animation-duration": "1s",
                                        "-webkit-animation-delay": (2 * delay) + "s"/*,
                                         "-webkit-animation-iteration-count": "infinite"*/
                                    });


                                }
                            }
                        }

                        //如果是微信打开者自己回答完问题,把我回答完的问题文案替换已有的文案
                        for(var q=0;q<res.data.userList.length; q++){
                            var currentUserListForReplaceText=res.data.userList[q];
                            for(var r=0;r<$scope.final.length;r++){
                                var currentFinalForReplaceText=$scope.final[r];
                                if(currentUserListForReplaceText.answerID==currentFinalForReplaceText.answerID&&(currentUserListForReplaceText.answer!=currentFinalForReplaceText.answer)){
                                    currentFinalForReplaceText.answer=currentUserListForReplaceText.answer;
                                    debugger
                                }
                            }
                        }


                    }

                }
                else {
                    // 请求数据失败, 打印错误信息
                    util.artDialogHint(res.msg);
                }
            })
            // 后端返回异常
            .error(function (err) {
                util.artDialogHint(err);

            });
    }

    /**
     * 扫描微信打开者的结果方法
     */
    function updateMySelfScanResultList() {

        $http({
            url: $scope.API_scanResults,
            method: 'post',
            data: $httpParamSerializerJQLike($scope.radar.ScansResultListOfMyself),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            // 后端返回数据
            .success(function (res) {
                if (res.code == 200) {

                    /*   $("#div_0").css({"display":"block"})*/

                    if (res.data.userList.length != 0) {
                        if ($scope.final.length < 8) {


                            //先比较两个数组有何不同,把不同的值放在新的数组中,下面再调用随机数再生成新的随机位置
                            var differentArray = [];
                            if (temporaryArr.length == 0) {
                                differentArray = res.data.userList;

                            } else {
                                differentArray = DifferentValues(temporaryArr, res.data.userList);

                            }

                            //对比出的不同的数组
                            if (differentArray.length != 0) {

                                for (var i = 0; i < differentArray.length; i++) {
                                    $scope.final.push(differentArray[i]);

                                }
                                console.log('final', $scope.final);

                                var randomes = [];
                                randomes = random(differentArray, 11);
                                console.log('randomes', randomes);

                                //总随机数(包含之前的随机数)
                                //var delay = .5;
                                for (var i = 0; i < randomes.length; i++) {
                                    var delay = Math.random() * 1.5 + 0.5;
                                    $("#div_" + i).addClass("cell-" + randomes[i] + " animated bounceIn");
                                    $('#div_' + i + ' img[class="cell"]').addClass("borderStyle");
                                    $("#div_" + i).css({
                                        "animation-duration": "1s",
                                        "animation-delay": (i * delay) + "s",
                                        "-webkit-animation-duration": "1s",
                                        "-webkit-animation-delay": (i * delay) + "s"
                                    });
                                }
                                arr = randomes;
                                console.log('arr', arr);

                                temporaryArr = res.data.userList;
                                console.log("temporaryArr", temporaryArr);


                            }

                        } else if ($scope.final.length == 8) {
                            console.log("final等于8");
                            var resDataDiff = DifferentValuesForReplace($scope.final, res.data.userList);

                            if (resDataDiff.length != 0) {

                                var finalDataDiff = DifferentValuesForReplace(res.data.userList, $scope.final);
                                //var delay = .5
                                for (var i = 0; i < resDataDiff.length; i++) {
                                    $scope.final[finalDataDiff[i].currentIndex] = resDataDiff[i].differentArrayVal;


                                    $("#div_" + finalDataDiff[i].currentIndex).removeClass("animated bounceIn");
                                    $("#div_" + finalDataDiff[i].currentIndex).addClass("animated bounceIn");
                                    $("#div_" + finalDataDiff[i].currentIndex).css({
                                        "animation-duration": "1s",
                                        "animation-delay": (2 * delay) + "s",
                                        "-webkit-animation-duration": "1s",
                                        "-webkit-animation-delay": (2 * delay) + "s"/*,
                                         "-webkit-animation-iteration-count": "infinite"*/
                                    });


                                }
                            }
                        }


                    }

                }
                else {
                    // 请求数据失败, 打印错误信息
                    util.artDialogHint(res.msg);
                }
            })
            // 后端返回异常
            .error(function (err) {
                util.artDialogHint(err);

            });
    }

    /**
     * 扫描微信打开者附近的人的结果方法
     */
    function updateMySelfNearPeopleResultList() {
        /**
         * 微信授权获取经纬度
         */
        /*  var data = {
         url: location.href.split('#')[0]
         };
         var transform = function (data) {
         return $.param(data);
         };
         console.log("微信Url", $scope.afterSubmitQuestion);*/
        /* *
         *发送请求获取微信分享功能 ???获取经纬度算距离,自己的经纬度可能会变
         */
        /*  $http.post($scope.API_weixinshare, data, {
         headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
         transformRequest: transform

         }).success(function (res) {
         $scope.globalAllData = res;
         /!*   var msgData = {
         imgUrl: 'http://www.qingniwan.cc/qingniwan/img/radar-shareTimeLine.png',
         link: $scope.afterSubmitQuestion ,
         desc: $scope.shareText1,
         title: $scope.shareTitle1, // TODO:编码字符串 encodeURIComponent()
         backUrl: window.location
         };
         var msgData2 = {
         imgUrl: $scope.baseData.wxImg,
         link: $scope.afterSubmitQuestion ,
         desc:$scope.shareText2,
         title:$scope.shareTitle2, // TODO:编码字符串 encodeURIComponent()
         backUrl: window.location
         };*!/
         wx.config({
         debug: true,
         appId: $scope.globalAllData.data.appId, // 必填，公众号的唯一标识
         timestamp: $scope.globalAllData.data.timestamp, // 必填，生成签名的时间戳
         nonceStr: $scope.globalAllData.data.nonceStr, // 必填，生成签名的随机串
         signature: $scope.globalAllData.data.signature,// 必填，签名，见附录1
         jsApiList: [
         'checkJsApi',
         'openLocation',
         'getLocation'

         ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
         });
         wx.ready(function () {
         wx.checkJsApi({
         jsApiList: [
         'getLocation'
         ],
         success: function (res) {
         // alert(JSON.stringify(res));
         // alert(JSON.stringify(res.checkResult.getLocation));
         if (res.checkResult.getLocation == false) {
         alert('你的微信版本太低，不支持微信JS接口，请升级到最新的微信版本！');
         return;
         }
         }
         });
         wx.getLocation({
         success: function (res) {
         $scope.thePeopleOfScanning.latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
         $scope.thePeopleOfScanning.longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
         var speed = res.speed; // 速度，以米/每秒计
         var accuracy = res.accuracy; // 位置精度
         },
         cancel: function (res) {
         alert('用户拒绝授权获取地理位置');
         }
         });

         });
         /!*   wx.success(function(res){
         // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
         });
         wx.error(function(res){
         // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。

         });*!/
         //console.log(msgData);
         });*/

        var data = {
            url: location.href.split('#')[0]
        };
        var transform = function (data) {
            return $.param(data);
        };
        console.log("微信Url", $scope.afterSubmitQuestion);
        /* *
         *发送请求获取微信分享功能 ???获取经纬度算距离,自己的经纬度可能会变
         */
        $http.post($scope.API_weixinshare, data, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: transform

        }).success(function (res) {
            $scope.globalAllData = res;
            var msgData = {
                imgUrl: 'http://www.qingniwan.cc/qingniwan/img/radar-shareTimeLine.png', /*$scope.allData.data.userImg*/
                link: $scope.afterSubmitQuestion /*||location.href.split('#')[0]*/,
                desc: $scope.shareText1,
                title: $scope.shareTitle1, // TODO:编码字符串 encodeURIComponent()
                backUrl: window.location
            };
            var msgData2 = {
                imgUrl: $scope.baseData.wxImg, /*$scope.allData.data.userImg*/
                link: $scope.afterSubmitQuestion /*||location.href.split('#')[0]*/,
                desc: $scope.shareText2,
                title: $scope.shareTitle2, // TODO:编码字符串 encodeURIComponent()
                backUrl: window.location
            };
            wx.config({
                // debug: true,
                appId: $scope.globalAllData.data.appId, // 必填，公众号的唯一标识
                timestamp: $scope.globalAllData.data.timestamp, // 必填，生成签名的时间戳
                nonceStr: $scope.globalAllData.data.nonceStr, // 必填，生成签名的随机串
                signature: $scope.globalAllData.data.signature,// 必填，签名，见附录1
                jsApiList: ['onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'showOptionMenu',
                    'checkJsApi',
                    'openLocation',
                    'getLocation'
                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
            wx.ready(function () {
                wx.onMenuShareQQ(msgData);
                wx.onMenuShareWeibo(msgData);
                wx.onMenuShareTimeline(msgData);
                wx.onMenuShareAppMessage(msgData2);
                wx.checkJsApi({
                    jsApiList: [
                        'getLocation'
                    ],
                    success: function (res) {
                        // alert(JSON.stringify(res));
                        // alert(JSON.stringify(res.checkResult.getLocation));
                        if (res.checkResult.getLocation == false) {
                            alert('你的微信版本太低，不支持微信JS接口，请升级到最新的微信版本！');
                            return;
                        }
                    }
                });
                wx.getLocation({
                    type: 'wgs84',
                    success: function (res) {
                        $scope.thePeopleOfScanning.latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                        $scope.thePeopleOfScanning.longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                        var speed = res.speed; // 速度，以米/每秒计
                        var accuracy = res.accuracy; // 位置精度
                        console.log("首次输出经纬度=>", res)
                    },
                    cancel: function (res) {
                        alert('用户拒绝授权获取地理位置');
                    }
                });

            });
            /*   wx.success(function(res){
             // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
             });
             wx.error(function(res){
             // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。

             });*/
            //console.log(msgData);
        });
        debugger
        console.log("自己的经纬度", $scope.thePeopleOfScanning.latitude, $scope.thePeopleOfScanning.longitude);
        if (!$scope.thePeopleOfScanning.latitude ) {
            debugger
            //alert("没有获取经纬度",$scope.thePeopleOfScanning.latitude)

            //经纬度等于undefined说明没有授权获取地理位置
            return
        } else if($scope.thePeopleOfScanning.latitude){
            // alert("获取的经纬度",$scope.thePeopleOfScanning.latitude)
            debugger

            $scope.radar.ScansNearPeopleResultListOfMyself = {
                "sendOpenID": $scope.baseData.recOpenID,
                "recOpenID": $scope.baseData.recOpenID,
                "lat": $scope.thePeopleOfScanning.latitude,
                "lng": $scope.thePeopleOfScanning.longitude
            };


            $http({
                url: $scope.API_scanResults,
                method: 'post',
                data: $httpParamSerializerJQLike($scope.radar.ScansNearPeopleResultListOfMyself),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                // 后端返回数据
                .success(function (res) {
                    if (res.code == 200) {

                        /*   $("#div_0").css({"display":"block"})*/

                        if (res.data.userList.length != 0) {
                            if ($scope.final.length < 8) {

                                //先比较两个数组有何不同,把不同的值放在新的数组中,下面再调用随机数再生成新的随机位置
                                var differentArray = [];
                                if (temporaryArr.length == 0) {
                                    differentArray = res.data.userList

                                } else {
                                    differentArray = DifferentValues(temporaryArr, res.data.userList)

                                }

                                //对比出的不同的数组
                                if (differentArray.length != 0) {

                                    for (var i = 0; i < differentArray.length; i++) {
                                        if (differentArray[i].isWxUser == 0) {
                                            differentArray[i].isWxOrInviteIcon = "/qingniwan/img/radar-inviteDisIon.png";
                                            var distanceCalculate = GetDistance($scope.thePeopleOfScanning.latitude, $scope.thePeopleOfScanning.longitude, differentArray[i].lat, differentArray[i].lng);
                                            var distanceCalculateResult = distanceCalculate;
                                            if (distanceCalculateResult < 1) {
                                                differentArray[i].distanceText = "<1km"
                                            } else if (99 > distanceCalculateResult >= 1) {
                                                var parseIntText = parseInt(distanceCalculateResult);
                                                differentArray[i].distanceText = parseIntText + "km"
                                            } else if (distanceCalculateResult >= 99) {
                                                differentArray[i].distanceText = "很远"
                                            }
                                            /*(10>distanceCalculateResult>=1){
                                             var ToFixedText=distanceCalculateResult.toFixed(1);
                                             differentArray[i].distanceText=ToFixedText+"km"
                                             }else if*/

                                        } else if (differentArray[i].isWxUser == 1) {
                                            differentArray[i].isWxOrInviteIcon = "/qingniwan/img/radar-weixinDisIcon.png";
                                            differentArray[i].distanceText = "微信"
                                        }
                                        //根据经纬度算出距离
                                        $scope.final.push(differentArray[i]);

                                    }
                                    console.log('final', $scope.final);

                                    var randomes = [];
                                    randomes = random(differentArray, 11);
                                    console.log('randomes', randomes);

                                    //总随机数(包含之前的随机数)

                                    for (var i = 0; i < randomes.length; i++) {
                                        var delay = Math.random() * 1.5 + 0.5;
                                        $("#div_" + i).addClass("cell-" + randomes[i] + " animated bounceIn");
                                        $('#div_' + i + ' img[class="cell"]').addClass("borderStyle");
                                        $("#div_" + i).css({
                                            "animation-duration": "1s",
                                            "animation-delay": (i * delay) + "s",
                                            "-webkit-animation-duration": "1s",
                                            "-webkit-animation-delay": (i * delay) + "s"
                                        });
                                    }
                                    arr = randomes;
                                    console.log('arr', arr);

                                    temporaryArr = res.data.userList;
                                    console.log("temporaryArr", temporaryArr);


                                }
                            } else if ($scope.final.length == 8) {
                                console.log("final等于8");
                                var resDataDiff = DifferentValuesForReplace($scope.final, res.data.userList);

                                if (resDataDiff.length != 0) {

                                    var finalDataDiff = DifferentValuesForReplace(res.data.userList, $scope.final);
                                    //var delay = .5
                                    for (var i = 0; i < resDataDiff.length; i++) {
                                        if (resDataDiff[i].differentArrayVal.isWxUser == 0) {
                                            resDataDiff[i].isWxOrInviteIcon = "/qingniwan/img/radar-inviteDisIon.png";
                                            var distanceCalculate = GetDistance($scope.thePeopleOfScanning.latitude, $scope.thePeopleOfScanning.longitude, resDataDiff[i].differentArrayVal.lat, resDataDiff[i].differentArrayVal.lng);
                                            var distanceCalculateResult = distanceCalculate;
                                            if (distanceCalculateResult < 1) {
                                                resDataDiff[i].differentArrayVal.distanceText = "<1km"
                                            } else if (99 > distanceCalculateResult >= 1) {
                                                var parseIntText = parseInt(distanceCalculateResult);
                                                resDataDiff[i].differentArrayVal.distanceText = parseIntText + "km"
                                            } else if (distanceCalculateResult >= 99) {
                                                resDataDiff[i].differentArrayVal.distanceText = "很远"
                                            }
                                            /*(10>distanceCalculateResult>=1){
                                             var ToFixedText=distanceCalculateResult.toFixed(1);
                                             resDataDiff[i].differentArrayVal.distanceText=ToFixedText+"km"
                                             }else if*/

                                        } else if (resDataDiff[i].differentArrayVal.isWxUser == 1) {
                                            resDataDiff[i].isWxOrInviteIcon = "/qingniwan/img/radar-weixinDisIcon.png";
                                            resDataDiff[i].differentArrayVal.distanceText = "微信"
                                        }

                                        $scope.final[finalDataDiff[i].currentIndex] = resDataDiff[i].differentArrayVal;


                                        $("#div_" + finalDataDiff[i].currentIndex).removeClass("animated bounceIn");
                                        $("#div_" + finalDataDiff[i].currentIndex).addClass("animated bounceIn");
                                        $("#div_" + finalDataDiff[i].currentIndex).css({
                                            "animation-duration": "1s",
                                            "animation-delay": (2 * delay) + "s",
                                            "-webkit-animation-duration": "1s",
                                            "-webkit-animation-delay": (2 * delay) + "s"/*,
                                             "-webkit-animation-iteration-count": "infinite"*/
                                        });


                                    }
                                }
                            }

                        }

                    }
                    else {
                        // 请求数据失败, 打印错误信息
                        util.artDialogHint(res.msg);
                    }
                })
                // 后端返回异常
                .error(function (err) {
                    util.artDialogHint(err);

                });
        }
    }

    /**
     ** (MOCK)1.截取数组中的数据，组成一个二维数组
     ** 2.arr 需要截取的数组
     ** 3.num 组成的二维数组中，每一个数组中的数据数量
     ** 4.返回数据为一个二维数组
     */
    function arrSlice(arr, num) {
        var reArr = [];
        var length = arr.length;
        var total = parseInt(length / num);
        var yushu = length % num;
        if (yushu != 0)
            total++;
        for (var i = 0; i < total; i++) {
            reArr.push(arr.slice(i * num, (i + 1) * num));
        }
        return reArr;
    }

    /**
     *  array2为大的数(总的数,必须必array1的length长)  answerID
     */
    function DifferentValues(array1, array2) {
        var result = [];
        for (var i = 0; i < array2.length; i++) {
            var obj = array2[i];
            var answerID = obj.answerID;
            var isExist = false;
            for (var j = 0; j < array1.length; j++) {
                var aj = array1[j];
                var n = aj.answerID;
                if (n == answerID) {
                    isExist = true;
                    break;
                }
            }
            if (!isExist) {
                result.push(obj);
            }
        }
        return result
    }

    /**
     * 比较array1和array2 输出array2的值(把不同的值直接替换)
     * array1和array2的数组长度必须相同
     */
    function DifferentValuesForReplace(array1, array2) {
        var result = [];
        for (var i = 0; i < array2.length; i++) {
            var obj = array2[i];
            var answerID = obj.answerID;
            var isExist = false;
            var currentIndex = i;
            for (var j = 0; j < array1.length; j++) {
                var aj = array1[j];
                var n = aj.answerID;
                if (n == answerID) {

                    isExist = true;
                    break;
                }
            }
            if (!isExist) {
                result.push({"differentArrayVal": obj, "currentIndex": currentIndex});
            }
        }
        return result
    }

    /**
     *  出入新的数,输出总的随机位置
     */
    var arr = [];

    function random(arg0, arg1) {
        for (var i = 0; i < arg0.length; i++) {
            var flag = false;
            while (!flag) {
                var number = parseInt(Math.random() * arg1) + 1;
                if (arr.length != 0) {
                    var stat = false;
                    for (var j = 0; j < arr.length; j++) {
                        if (number == arr[j]) {
                            stat = true;
                            break;
                        }
                    }
                    if (!stat) {
                        arr.push(number);
                        flag = true;
                    }
                } else {
                    arr.push(number);
                    flag = true;
                }

            }
        }

        return arr;
    }

    /**
     *  生成动画随机数
     */
    function animationDelayRandom(arg0, arg1) {
        for (var i = 0; i < arg0.length; i++) {
            var flag = false;
            while (!flag) {
                var number = parseInt(Math.random() * arg1) + 1;
                if (arr.length != 0) {
                    var stat = false;
                    for (var j = 0; j < arr.length; j++) {
                        if (number == arr[j]) {
                            stat = true;
                            break;
                        }
                    }
                    if (!stat) {
                        arr.push(number);
                        flag = true;
                    }
                } else {
                    arr.push(number);
                    flag = true;
                }

            }
        }

        return arr;
    }

    /**
     *  进行经纬度转换为距离的计算
     */
    function Rad(d) {
        return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
    }

    /**
     *  计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
     */
    function GetDistance(lat1, lng1, lat2, lng2) {
        var radLat1 = Rad(lat1);
        var radLat2 = Rad(lat2);
        var a = radLat1 - radLat2;
        var b = Rad(lng1) - Rad(lng2);
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
                Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137;// EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000; //输出为公里
        //s=s.toFixed(4);
        return s;
    }

}]);

