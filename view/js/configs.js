/**
 * Created by daisy on 14-7-5.
 */
define(['angular', 'angularRoute', 'controllers'], function (angular) {
    'use strict';

    return angular.module('normal.configs', ['ngRoute', 'normal.controllers'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/question', {
                    templateUrl: 'partials/question.html',
                    controller: 'QuestionCtrl'
                })
                .otherwise({redirectTo: '/question'});
        }]);
});
