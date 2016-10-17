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

    //repeate����¼�
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

        //�ӳټ���
        setTimeout(function () {
            /* $("#J_maskLayer").addClass("maskLayer");
             debugger
             $("#J_AnswerQuestionForScan").css({"display": "block"});
             $("#parentOfQuestionList").css({"display": "block"});*/
            //���Զ���
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
    //SONRepeate��
    $scope.$on('sonRepeatFinishcallBack', function(event) {
        $('label').click(function() {
            var sonOfRadioId = $(this).attr('for');
            $('label').children("span").removeAttr('class') && $(this).children("span").attr('class', 'checked');
            $('input[type="radio"]').removeAttr('checked') && $('#' + sonOfRadioId).attr('checked', 'checked');

        });


    });

    //��΢�ŵĽ������Լ���Ϣ
    $scope.baseData = baseData;
    console.log('$scope.baseData', $scope.baseData);

    //ɨ���������ʼ��
    $scope.final = [];
    $scope.radar = {};
    $scope.questionOptionsDataList = {};
    $scope.showScanResultsDetailsModal = {};
    $scope.ScanNearOrMoreText = "ɨ��������";

    //�б�Ͱ�ť��ʼ��
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

    //΢�ŷ����url����
    $scope.afterSubmitQuestion = ""/*location.href.split('#')[0]*/;
    //΢�ŷ���ʱUI���ýӿ�
    $scope.API_weixinshare = "/interface?interface=Weixin&api=getJSAPIticket&version=3.0";
    //��ȡ�����б�ӿ�
    $scope.API_getQuestionList = "/interface?interface=Answer&api=questionList&version=4.0";
    //�ύ�����б�ӿ�
    $scope.API_postQuestion = "/interface?interface=Answer&api=wx_submitAnswer&version=4.0";
    //�״�ɨ�����б�
    $scope.API_scanResults = "/interface?interface=Answer&api=wx_scanResults&version=4.0";
    //����֪ͨɨ�����ӿ�
    $scope.API_SMSNotificationScanResults = "/interface?interface=Answer&api=remove&version=4.0";
    //����鿴invite����ӿ�
    $scope.API_PersonDetailOfInvite = "/interface?interface=User&api=PersonDetail&version=4.0";

    if ($scope.baseData.recOpenID == (decodeURIComponent(util.parseURL(location.href).params['sendOpenID'])) || !isWeiXin()) {
        debugger
        $("#J_ViewTheResults").css({"display": "block"});
        debugger
        //ɨ����ͼ��(�����Լ�ɨ���ɨ���⻻λ΢�Ŵ��ŵ���)
        $scope.thePeopleOfScanning = {};
        $scope.thePeopleOfScanning.img = $scope.baseData.wxImg;
        $scope.thePeopleOfScanning.answer = "";
        $("#OneSelf").addClass("borderStyle");
        $scope.final = [];
        var temporaryArr = [];//���������� ��ʱ����  ÿ��Ū����ʱ��������¸�ֵ
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
        //ɨ����ͼ��(�����Լ�ɨ���ɨ���⻻λ΢�Ŵ��ŵ���)
        $scope.thePeopleOfScanning = {};
        $scope.thePeopleOfScanning.img = decodeURIComponent(util.parseURL(location.href).params['img']);
        $scope.thePeopleOfScanning.answer = decodeURIComponent(util.parseURL(location.href).params['answer']);
        $("#OneSelf").addClass("borderStyle");

        /**
         *  ����ҳ���ȡ�����ߵ�ɨ����,����󵯳������б���
         */
        //���жϱ�ҳ����invite�û�����΢���û�(��ʱû��invite�û�)
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
        var temporaryArr = [];//���������� ��ʱ����  ÿ��Ū����ʱ��������¸�ֵ
        var arr = [];
        updateOtherScanResultList();
        $scope.timer_OthersSms = $interval(function () {
            updateOtherScanResultList()

        }, 5000);


        //ģ������(mock����)
        /*  $scope.final=[];
         var  temporaryArr=[];//���������� ��ʱ����  ÿ��Ū����ʱ��������¸�ֵ
         var arr=[];
         res={
         "data":{
         "question":"�Ը���",
         "userList":
         [
         {"answer":"�ڸɻ�","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0},
         {"answer":"��ѧϰ","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/swkt_06.jpg","isWxUser":1},
         {"answer":"��ѧϰ","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/96a02d97ed3e08fec9dcc2c38a359cff_320_480.jpeg","isWxUser":1},
         {"answer":"�ڸɻ�","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0},
         {"answer":"��ѧϰ","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/swkt_06.jpg","isWxUser":0},
         {"answer":"�ڸɻ�","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0},
         {"answer":"��ѧϰ","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/swkt_06.jpg","isWxUser":0},
         {"answer":"�ڸɻ�","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0}
         ],
         "shareUrl":"http://sdfsfsf"
         },

         "code":"200",
         "msg":"success"
         };

         //�ȱȽ����������кβ�ͬ,�Ѳ�ͬ��ֵ�����µ�������,�����ٵ���������������µ����λ��
         var differentArray=[];
         if(temporaryArr.length==0){

         differentArray=res.data.userList
         }else{
         differentArray=DifferentValues(temporaryArr,res.data.userList)
         }

         //���������µ����λ��
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
         //�������(����֮ǰ�������)
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

//(mock����)

    }


    /**
     *  ��ȡ�����б�
     */
    $http({
        url: $scope.API_getQuestionList,
        method: 'POST'
    })
        // ��˷�������
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

                //���÷������ɶ�ά����
                var arrFor2DArray = res.data.questionList;
                $scope.finalQuestionDataList = res.data;
                $scope.finalQuestionDataList.questionList = [];
                $scope.finalQuestionDataList.questionList = arrSlice(arrFor2DArray, 5);


                //΢�ŷ���Ĳ���URL
                $scope.afterSubmitQuestion = $scope.finalQuestionDataList.url + "?sendOpenID=" + $scope.baseData.recOpenID + "&sex=" + $scope.baseData.sex + "&img=" + $scope.baseData.wxImg + "&userName=" + $scope.baseData.wxName;
                console.log("�Ѿ����úõ�ul����", $scope.afterSubmitQuestion)

            } else {
                // ��������ʧ��, ��ӡ������Ϣ
                util.artDialogHint(res.msg);
            }
        })
        // ��˷����쳣
        .error(function (err) {
            util.artDialogHint(err);

        });

    //��ť�¼���
    /**
     * �ύ���ⰴť
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
                // ��˷�������
                .success(function (res) {
                    if (res.code == 200) {

                        //���Զ���
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

                        //΢�ŷ��������İ���url����
                        $scope.shareTitle1 = res.data.shareTitle1;
                        $scope.shareText1 = res.data.shareText1;
                        $scope.shareTitle2 = res.data.shareTitle2;
                        $scope.shareText2 = res.data.shareText2;
                        $scope.afterSubmitQuestion = $scope.afterSubmitQuestion + "&answer=" + $scope.radar.SubmitQuestions;

                        /**
                         * ΢�ŷ�����
                         */
                        var data = {
                            url: location.href.split('#')[0]
                        };
                        var transform = function (data) {
                            return $.param(data);
                        };
                        console.log("΢��Url", $scope.afterSubmitQuestion);
                        /* *
                         *���������ȡ΢�ŷ����� ��ȡ��γ�������,�Լ��ľ�γ�ȿ��ܻ��
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
                                title: $scope.shareTitle1, // TODO:�����ַ��� encodeURIComponent()
                                backUrl: window.location
                            };
                            var msgData2 = {
                                imgUrl: $scope.baseData.wxImg, /*$scope.allData.data.userImg*/
                                link: $scope.afterSubmitQuestion /*||location.href.split('#')[0]*/,
                                desc: $scope.shareText2,
                                title: $scope.shareTitle2, // TODO:�����ַ��� encodeURIComponent()
                                backUrl: window.location
                            };
                            wx.config({
                                //  debug: true,
                                appId: $scope.globalAllData.data.appId, // ������ںŵ�Ψһ��ʶ
                                timestamp: $scope.globalAllData.data.timestamp, // �������ǩ����ʱ���
                                nonceStr: $scope.globalAllData.data.nonceStr, // �������ǩ���������
                                signature: $scope.globalAllData.data.signature,// ���ǩ��������¼1
                                jsApiList: ['onMenuShareQQ',
                                    'onMenuShareWeibo',
                                    'onMenuShareTimeline',
                                    'onMenuShareAppMessage',
                                    'showOptionMenu',
                                    'checkJsApi',
                                    'openLocation',
                                    'getLocation'
                                ] // �����Ҫʹ�õ�JS�ӿ��б�����JS�ӿ��б����¼2
                            });
                            wx.ready(function () {
                                wx.onMenuShareQQ(msgData);
                                wx.onMenuShareWeibo(msgData);
                                wx.onMenuShareTimeline(msgData);
                                wx.onMenuShareAppMessage(msgData2);

                            });
                            /*   wx.success(function(res){
                             // config��Ϣ��֤ʧ�ܻ�ִ��error��������ǩ�����ڵ�����֤ʧ�ܣ����������Ϣ���Դ�config��debugģʽ�鿴��Ҳ�����ڷ��ص�res�����в鿴������SPA�������������ǩ����
                             });
                             wx.error(function(res){
                             // config��Ϣ��֤ʧ�ܻ�ִ��error��������ǩ�����ڵ�����֤ʧ�ܣ����������Ϣ���Դ�config��debugģʽ�鿴��Ҳ�����ڷ��ص�res�����в鿴������SPA�������������ǩ����

                             });*/
                            //console.log(msgData);
                        });

                    } else {
                        // ��������ʧ��, ��ӡ������Ϣ
                        util.artDialogHint(res.msg);

                        //mock
                        /*    $("#J_maskLayer").removeClass("maskLayer");
                         debugger
                         $("#J_AnswerQuestionForScan").css({"display": "none"});
                         $("#swiper-container").css({"display": "none"});
                         $("#J_IComeToScan").css({"display": "block"});*/
                        //mock����
                    }
                })
                // ��˷����쳣
                .error(function (err) {
                    util.artDialogHint(err);

                });
        }
    };

    /**
     * �����Ҳ��ɨһɨʱ,�����΢���ߵ�ɨ�����߼�
     */
    $scope.IComeToScanBtn = function () {
        /*   $(".pointer").css({"animation-play-state":"paused", "-webkit-animation-play-state":"paused","animation-fill-mode":"backwards","-webkit-animation-fill-mode":"backwards"});
         $(".pointer").css({"animation-play-state":"running", "-webkit-animation-play-state":"running"});*/
        $interval.cancel($scope.timer_OthersSms);
        debugger
        cleanFinalDataList();
        debugger
        //var temporaryArr = [];//���������� ��ʱ����  ÿ��Ū����ʱ��������¸�ֵ
        //var arr = [];
        // console.log("�����һ����յ���Ҳ��ɨһɨtemporaryArr����",temporaryArr)
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

    /*ɨ�踽������*/
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
            $scope.ScanNearOrMoreText = "����INVITE";

            // $scope.final=[];
            //var  temporaryArr=[];//���������� ��ʱ����  ÿ��Ū����ʱ��������¸�ֵ
            //console.log("�����һ����յ�temporaryArr����",temporaryArr)
            // var arr=[];
            //  updateMySelfNearPeopleResultList();
            $scope.timer_MySelfNearPeopleSms = $interval(function () {
                updateMySelfNearPeopleResultList()
            }, 3000);

            /**
             * ΢����Ȩ��ȡ��γ��??(mock��ʼ) //ģ������(mock)
             */
            /*  var data = {
             url: location.href.split('#')[0]
             };
             var transform = function (data) {
             return $.param(data);
             };
             console.log("΢��Url", $scope.afterSubmitQuestion);
             /!* *
             *���������ȡ΢�ŷ����� ???��ȡ��γ�������,�Լ��ľ�γ�ȿ��ܻ��
             *!/
             $http.post($scope.API_weixinshare, data, {
             headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
             transformRequest: transform

             }).success(function (res) {
             $scope.globalAllData = res;

             wx.config({
             //  debug: true,
             appId: $scope.globalAllData.data.appId, // ������ںŵ�Ψһ��ʶ
             timestamp: $scope.globalAllData.data.timestamp, // �������ǩ����ʱ���
             nonceStr: $scope.globalAllData.data.nonceStr, // �������ǩ���������
             signature: $scope.globalAllData.data.signature,// ���ǩ��������¼1
             jsApiList: [
             'checkJsApi',
             'openLocation',
             'getLocation'

             ] // �����Ҫʹ�õ�JS�ӿ��б�����JS�ӿ��б����¼2
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
             alert('���΢�Ű汾̫�ͣ���֧��΢��JS�ӿڣ������������µ�΢�Ű汾��');
             return;
             }
             }
             });
             wx.getLocation({
             success: function (res) {
             $scope.thePeopleOfScanning.latitude = res.latitude; // γ�ȣ�����������ΧΪ90 ~ -90
             $scope.thePeopleOfScanning.longitude = res.longitude; // ���ȣ�����������ΧΪ180 ~ -180��
             var speed = res.speed; // �ٶȣ�����/ÿ���
             var accuracy = res.accuracy; // λ�þ���
             },
             cancel: function (res) {
             alert('�û��ܾ���Ȩ��ȡ����λ��');
             }
             });

             });
             /!*   wx.success(function(res){
             // config��Ϣ��֤ʧ�ܻ�ִ��error��������ǩ�����ڵ�����֤ʧ�ܣ����������Ϣ���Դ�config��debugģʽ�鿴��Ҳ�����ڷ��ص�res�����в鿴������SPA�������������ǩ����
             });
             wx.error(function(res){
             // config��Ϣ��֤ʧ�ܻ�ִ��error��������ǩ�����ڵ�����֤ʧ�ܣ����������Ϣ���Դ�config��debugģʽ�鿴��Ҳ�����ڷ��ص�res�����в鿴������SPA�������������ǩ����

             });*!/
             console.log(msgData);
             });
             if($scope.thePeopleOfScanning.latitude==undefined){
             //��γ�ȵ���undefined˵��û����Ȩ��ȡ����λ��
             return
             }else{

             res={
             "data":{
             "question":"�Ը���",
             "userList":
             [
             {"answer":"�ڸɻ�","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0},
             {"answer":"��ѧϰ","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/swkt_06.jpg","isWxUser":1},
             {"answer":"��ѧϰ","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/96a02d97ed3e08fec9dcc2c38a359cff_320_480.jpeg","isWxUser":1},
             {"answer":"�ڸɻ�","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0},
             {"answer":"��ѧϰ","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/swkt_06.jpg","isWxUser":0},
             {"answer":"�ڸɻ�","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0},
             {"answer":"��ѧϰ","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/swkt_06.jpg","isWxUser":0},
             {"answer":"�ڸɻ�","doing":"����Ӱ","img":"http://oap4p6qba.bkt.clouddn.com/12143305_143920185168_2.jpg","isWxUser":0}
             ],
             "shareUrl":"http://sdfsfsf"
             },

             "code":"200",
             "msg":"success"
             };

             //�ȱȽ����������кβ�ͬ,�Ѳ�ͬ��ֵ�����µ�������,�����ٵ���������������µ����λ��
             var differentArray=[];
             if(temporaryArr.length==0){

             differentArray=res.data.userList
             debugger
             }else{
             differentArray=DifferentValues(temporaryArr,res.data.userList)
             debugger
             }

             //���������µ����λ��
             if(differentArray.length!=0){
             for(var i=0;i<differentArray.length;i++){
             if(differentArray[i].isWxUser==0){
             differentArray[i].isWxOrInviteIcon="/qingniwan/img/radar-inviteDisIon.png";
             differentArray[i].distanceText =differentArray[i].lat//"����ֵ";
             }else if(differentArray[i].isWxUser==1){
             differentArray[i].isWxOrInviteIcon="/qingniwan/img/radar-weixinDisIcon.png";
             differentArray[i].distanceText ="΢��";
             }
             //???���ݾ�γ���������
             $scope.final.push(differentArray[i]);
             debugger
             }

             }

             console.log('final',$scope.final)
             debugger

             var randomes=[];

             randomes=random(differentArray,12)
             //�������(����֮ǰ�������)
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

             //(mock����)


             }*/


        } else {
            $('#ScanMorePromptModal').modal('show');

        }
        n += 1
    };

    /**
     * ���ͷ��鿴��ϸ��Ϣ
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
                // ��˷�������
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
                        // ��������ʧ��, ��ӡ������Ϣ
                        util.artDialogHint(res.msg);
                    }
                })
                // ��˷����쳣
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
            //����������invite��ť
            $("#J_contactTAFromINVITE").css({"display": "block"});

        }
    };

    /**
     * �ر�΢�ź������鵯��ǰ
     */
    $('#ScanningWixinPeopleDetailsModal').on('hide.bs.modal', function () {
        $("#J_contactTAFromINVITE").css({"display": "none"});
    });

    /**
     * �ر�INVITE�������鵯��
     */
    $scope.InvitePeopleDetailsModalBtn = function () {
        $('#ScanningInvitePeopleDetailsModal').modal('hide');
        $("#J_contactTAFromINVITE").css({"display": "none"});
        $("#J_InvitePeopleDetailsModalCloseBtn").css({"display": "none"});
    };

    /**
     * ɨ΢�ź��Ѱ�ť
     * */
    $scope.ScanWeiXinFirendBtn = function () {
        $('#shareWithFriendsForScanningModal').modal('show');
    };

    /**
     * ɨ����ఴť
     * */
    $scope.ScanMorePromptModalOfTomorrow = function () {
        $('#ScanMorePromptModal').modal('hide');
    };
    $scope.ScanMorePromptModalOfImmediately = function () {
        window.location.href = "/qingniwan/download?do=download";
    };

    /**
     * ��ʾ��ť����ر��¼�
     */
    $scope.answerQuestionForScanPromptModalBtn = function () {
        $('#answerQuestionForScanPromptModal').modal('hide');
    };

    /**
     * �л����������б�ҳ��
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
     * �л����������б�ҳ��
     */
    $scope.SwitchBackToParentBtn=function(){
        /*$("#sonOfQuestionList").css({"display": "none"});
         $("#parentOfQuestionList").addClass(" animated fadeInLeft" );
         $("#parentOfQuestionList").css({"display": "block"});*/
//���Զ���
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

    //�����ຯ��
    /**
     * �ж��Ƿ�Ϊ΢�������
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
     * ���final����,ɨ��΢�Ŵ��ߵ�ɨ��ģʽ��ʼ��
     */
    function cleanFinalDataList() {
        //�������ɨ�����б�,����������(ɨ����)ͼ��,ֹͣ���˵�ɨ�����߼�,��ʼ΢�Ŵ���ɨ���߼�
        $scope.final = [];
        temporaryArr = [];//���������� ��ʱ����  ÿ��Ū����ʱ��������¸�ֵ
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
     * ɨ������ߵĽ������
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
            // ��˷�������
            .success(function (res) {
                if (res.code == 200) {
                    /*   $("#div_0").css({"display":"block"})*/
                    if (res.data.userList.length != 0) {
                        if ($scope.final.length < 8) {

                            //�ȱȽ����������кβ�ͬ,�Ѳ�ͬ��ֵ�����µ�������,�����ٵ���������������µ����λ��

                            var differentArray = [];
                            if (temporaryArr.length == 0) {
                                differentArray = res.data.userList
                            } else {
                                differentArray = DifferentValues(temporaryArr, res.data.userList)
                            }

                            //�Աȳ��Ĳ�ͬ������
                            if (differentArray.length != 0) {
                                for (var i = 0; i < differentArray.length; i++) {
                                    $scope.final.push(differentArray[i]);

                                }

                                var randomes = [];
                                randomes = random(differentArray, 11);

                                //�������(����֮ǰ�������)
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
                            console.log("final����8");
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

                        //�����΢�Ŵ����Լ��ش�������,���һش���������İ��滻���е��İ�
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
                    // ��������ʧ��, ��ӡ������Ϣ
                    util.artDialogHint(res.msg);
                }
            })
            // ��˷����쳣
            .error(function (err) {
                util.artDialogHint(err);

            });
    }

    /**
     * ɨ��΢�Ŵ��ߵĽ������
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
            // ��˷�������
            .success(function (res) {
                if (res.code == 200) {

                    /*   $("#div_0").css({"display":"block"})*/

                    if (res.data.userList.length != 0) {
                        if ($scope.final.length < 8) {


                            //�ȱȽ����������кβ�ͬ,�Ѳ�ͬ��ֵ�����µ�������,�����ٵ���������������µ����λ��
                            var differentArray = [];
                            if (temporaryArr.length == 0) {
                                differentArray = res.data.userList;

                            } else {
                                differentArray = DifferentValues(temporaryArr, res.data.userList);

                            }

                            //�Աȳ��Ĳ�ͬ������
                            if (differentArray.length != 0) {

                                for (var i = 0; i < differentArray.length; i++) {
                                    $scope.final.push(differentArray[i]);

                                }
                                console.log('final', $scope.final);

                                var randomes = [];
                                randomes = random(differentArray, 11);
                                console.log('randomes', randomes);

                                //�������(����֮ǰ�������)
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
                            console.log("final����8");
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
                    // ��������ʧ��, ��ӡ������Ϣ
                    util.artDialogHint(res.msg);
                }
            })
            // ��˷����쳣
            .error(function (err) {
                util.artDialogHint(err);

            });
    }

    /**
     * ɨ��΢�Ŵ��߸������˵Ľ������
     */
    function updateMySelfNearPeopleResultList() {
        /**
         * ΢����Ȩ��ȡ��γ��
         */
        /*  var data = {
         url: location.href.split('#')[0]
         };
         var transform = function (data) {
         return $.param(data);
         };
         console.log("΢��Url", $scope.afterSubmitQuestion);*/
        /* *
         *���������ȡ΢�ŷ����� ???��ȡ��γ�������,�Լ��ľ�γ�ȿ��ܻ��
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
         title: $scope.shareTitle1, // TODO:�����ַ��� encodeURIComponent()
         backUrl: window.location
         };
         var msgData2 = {
         imgUrl: $scope.baseData.wxImg,
         link: $scope.afterSubmitQuestion ,
         desc:$scope.shareText2,
         title:$scope.shareTitle2, // TODO:�����ַ��� encodeURIComponent()
         backUrl: window.location
         };*!/
         wx.config({
         debug: true,
         appId: $scope.globalAllData.data.appId, // ������ںŵ�Ψһ��ʶ
         timestamp: $scope.globalAllData.data.timestamp, // �������ǩ����ʱ���
         nonceStr: $scope.globalAllData.data.nonceStr, // �������ǩ���������
         signature: $scope.globalAllData.data.signature,// ���ǩ��������¼1
         jsApiList: [
         'checkJsApi',
         'openLocation',
         'getLocation'

         ] // �����Ҫʹ�õ�JS�ӿ��б�����JS�ӿ��б����¼2
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
         alert('���΢�Ű汾̫�ͣ���֧��΢��JS�ӿڣ������������µ�΢�Ű汾��');
         return;
         }
         }
         });
         wx.getLocation({
         success: function (res) {
         $scope.thePeopleOfScanning.latitude = res.latitude; // γ�ȣ�����������ΧΪ90 ~ -90
         $scope.thePeopleOfScanning.longitude = res.longitude; // ���ȣ�����������ΧΪ180 ~ -180��
         var speed = res.speed; // �ٶȣ�����/ÿ���
         var accuracy = res.accuracy; // λ�þ���
         },
         cancel: function (res) {
         alert('�û��ܾ���Ȩ��ȡ����λ��');
         }
         });

         });
         /!*   wx.success(function(res){
         // config��Ϣ��֤ʧ�ܻ�ִ��error��������ǩ�����ڵ�����֤ʧ�ܣ����������Ϣ���Դ�config��debugģʽ�鿴��Ҳ�����ڷ��ص�res�����в鿴������SPA�������������ǩ����
         });
         wx.error(function(res){
         // config��Ϣ��֤ʧ�ܻ�ִ��error��������ǩ�����ڵ�����֤ʧ�ܣ����������Ϣ���Դ�config��debugģʽ�鿴��Ҳ�����ڷ��ص�res�����в鿴������SPA�������������ǩ����

         });*!/
         //console.log(msgData);
         });*/

        var data = {
            url: location.href.split('#')[0]
        };
        var transform = function (data) {
            return $.param(data);
        };
        console.log("΢��Url", $scope.afterSubmitQuestion);
        /* *
         *���������ȡ΢�ŷ����� ???��ȡ��γ�������,�Լ��ľ�γ�ȿ��ܻ��
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
                title: $scope.shareTitle1, // TODO:�����ַ��� encodeURIComponent()
                backUrl: window.location
            };
            var msgData2 = {
                imgUrl: $scope.baseData.wxImg, /*$scope.allData.data.userImg*/
                link: $scope.afterSubmitQuestion /*||location.href.split('#')[0]*/,
                desc: $scope.shareText2,
                title: $scope.shareTitle2, // TODO:�����ַ��� encodeURIComponent()
                backUrl: window.location
            };
            wx.config({
                // debug: true,
                appId: $scope.globalAllData.data.appId, // ������ںŵ�Ψһ��ʶ
                timestamp: $scope.globalAllData.data.timestamp, // �������ǩ����ʱ���
                nonceStr: $scope.globalAllData.data.nonceStr, // �������ǩ���������
                signature: $scope.globalAllData.data.signature,// ���ǩ��������¼1
                jsApiList: ['onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'showOptionMenu',
                    'checkJsApi',
                    'openLocation',
                    'getLocation'
                ] // �����Ҫʹ�õ�JS�ӿ��б�����JS�ӿ��б����¼2
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
                            alert('���΢�Ű汾̫�ͣ���֧��΢��JS�ӿڣ������������µ�΢�Ű汾��');
                            return;
                        }
                    }
                });
                wx.getLocation({
                    type: 'wgs84',
                    success: function (res) {
                        $scope.thePeopleOfScanning.latitude = res.latitude; // γ�ȣ�����������ΧΪ90 ~ -90
                        $scope.thePeopleOfScanning.longitude = res.longitude; // ���ȣ�����������ΧΪ180 ~ -180��
                        var speed = res.speed; // �ٶȣ�����/ÿ���
                        var accuracy = res.accuracy; // λ�þ���
                        console.log("�״������γ��=>", res)
                    },
                    cancel: function (res) {
                        alert('�û��ܾ���Ȩ��ȡ����λ��');
                    }
                });

            });
            /*   wx.success(function(res){
             // config��Ϣ��֤ʧ�ܻ�ִ��error��������ǩ�����ڵ�����֤ʧ�ܣ����������Ϣ���Դ�config��debugģʽ�鿴��Ҳ�����ڷ��ص�res�����в鿴������SPA�������������ǩ����
             });
             wx.error(function(res){
             // config��Ϣ��֤ʧ�ܻ�ִ��error��������ǩ�����ڵ�����֤ʧ�ܣ����������Ϣ���Դ�config��debugģʽ�鿴��Ҳ�����ڷ��ص�res�����в鿴������SPA�������������ǩ����

             });*/
            //console.log(msgData);
        });
        debugger
        console.log("�Լ��ľ�γ��", $scope.thePeopleOfScanning.latitude, $scope.thePeopleOfScanning.longitude);
        if (!$scope.thePeopleOfScanning.latitude ) {
            debugger
            //alert("û�л�ȡ��γ��",$scope.thePeopleOfScanning.latitude)

            //��γ�ȵ���undefined˵��û����Ȩ��ȡ����λ��
            return
        } else if($scope.thePeopleOfScanning.latitude){
            // alert("��ȡ�ľ�γ��",$scope.thePeopleOfScanning.latitude)
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
                // ��˷�������
                .success(function (res) {
                    if (res.code == 200) {

                        /*   $("#div_0").css({"display":"block"})*/

                        if (res.data.userList.length != 0) {
                            if ($scope.final.length < 8) {

                                //�ȱȽ����������кβ�ͬ,�Ѳ�ͬ��ֵ�����µ�������,�����ٵ���������������µ����λ��
                                var differentArray = [];
                                if (temporaryArr.length == 0) {
                                    differentArray = res.data.userList

                                } else {
                                    differentArray = DifferentValues(temporaryArr, res.data.userList)

                                }

                                //�Աȳ��Ĳ�ͬ������
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
                                                differentArray[i].distanceText = "��Զ"
                                            }
                                            /*(10>distanceCalculateResult>=1){
                                             var ToFixedText=distanceCalculateResult.toFixed(1);
                                             differentArray[i].distanceText=ToFixedText+"km"
                                             }else if*/

                                        } else if (differentArray[i].isWxUser == 1) {
                                            differentArray[i].isWxOrInviteIcon = "/qingniwan/img/radar-weixinDisIcon.png";
                                            differentArray[i].distanceText = "΢��"
                                        }
                                        //���ݾ�γ���������
                                        $scope.final.push(differentArray[i]);

                                    }
                                    console.log('final', $scope.final);

                                    var randomes = [];
                                    randomes = random(differentArray, 11);
                                    console.log('randomes', randomes);

                                    //�������(����֮ǰ�������)

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
                                console.log("final����8");
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
                                                resDataDiff[i].differentArrayVal.distanceText = "��Զ"
                                            }
                                            /*(10>distanceCalculateResult>=1){
                                             var ToFixedText=distanceCalculateResult.toFixed(1);
                                             resDataDiff[i].differentArrayVal.distanceText=ToFixedText+"km"
                                             }else if*/

                                        } else if (resDataDiff[i].differentArrayVal.isWxUser == 1) {
                                            resDataDiff[i].isWxOrInviteIcon = "/qingniwan/img/radar-weixinDisIcon.png";
                                            resDataDiff[i].differentArrayVal.distanceText = "΢��"
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
                        // ��������ʧ��, ��ӡ������Ϣ
                        util.artDialogHint(res.msg);
                    }
                })
                // ��˷����쳣
                .error(function (err) {
                    util.artDialogHint(err);

                });
        }
    }

    /**
     ** (MOCK)1.��ȡ�����е����ݣ����һ����ά����
     ** 2.arr ��Ҫ��ȡ������
     ** 3.num ��ɵĶ�ά�����У�ÿһ�������е���������
     ** 4.��������Ϊһ����ά����
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
     *  array2Ϊ�����(�ܵ���,�����array1��length��)  answerID
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
     * �Ƚ�array1��array2 ���array2��ֵ(�Ѳ�ͬ��ֱֵ���滻)
     * array1��array2�����鳤�ȱ�����ͬ
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
     *  �����µ���,����ܵ����λ��
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
     *  ���ɶ��������
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
     *  ���о�γ��ת��Ϊ����ļ���
     */
    function Rad(d) {
        return d * Math.PI / 180.0;//��γ��ת�������Ǻ����жȷֱ���ʽ��
    }

    /**
     *  ������룬�����ֱ�Ϊ��һ���γ�ȣ����ȣ��ڶ����γ�ȣ�����
     */
    function GetDistance(lat1, lng1, lat2, lng2) {
        var radLat1 = Rad(lat1);
        var radLat2 = Rad(lat2);
        var a = radLat1 - radLat2;
        var b = Rad(lng1) - Rad(lng2);
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
                Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137;// EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000; //���Ϊ����
        //s=s.toFixed(4);
        return s;
    }

}]);

