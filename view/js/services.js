/**
 * Created by daisy on 14-8-4.
 */
define(['angular'], function (angular) {
    return angular.module("normal.services", [])
        .service('Question', function () {
            var questions = [
                {
                    "content": "APP上的新通知提示 非要消除 正常吗？",
                    "options": [
                        {
                            "label": "正常"
                        },
                        {
                            "label": "不正常"
                        }
                    ]
                },
                {
                    "content": "吃过宠物食品 正常吗？",
                    "options": [
                        {
                            "label": "正常"
                        },
                        {
                            "label": "不正常"
                        }
                    ]
                },
                {
                    "content": "答应保密却忍不住不告诉别人 正常吗？",
                    "options": [
                        {
                            "label": "正常"
                        },
                        {
                            "label": "不正常"
                        }
                    ]
                },
                {
                    "content": "偷看伴侣手机 正常吗？",
                    "options": [
                        {
                            "label": "正常"
                        },
                        {
                            "label": "不正常"
                        }
                    ]
                },
                {
                    "content": "微信朋友圈屏蔽父母 正常吗？",
                    "options": [
                        {
                            "label": "正常"
                        },
                        {
                            "label": "不正常"
                        }
                    ]
                }
            ];

            return {
                random: function () {
                    return questions[parseInt(Math.random() * 4)];
                }
            }
        });
});
