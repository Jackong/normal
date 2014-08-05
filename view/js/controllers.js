/**
 * Created by daisy on 14-7-5.
 */
define(['angular', 'services'], function (angular) {
    'use strict';
    return angular.module('normal.controllers',
	    ['normal.services']
    )
    .controller('QuestionCtrl', function ($scope, Question) {
	$scope.normal = 0;

    	$scope.select = function (idx) {
        	$scope.normal += (1 - (idx % 2)) * 10;
        	$scope.change();
    	};

    	$scope.change = function () {
        	$scope.question = Question.random();
    	};

    	$scope.change();

    });
});
