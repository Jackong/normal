define([
    'angular',
    'configs',
    'controllers',
    'services'
], function (angular) {
    'use strict';

    // Declare app level module which depends on filters, and services

    return angular.module('normal', [
        'normal.configs',
        'normal.controllers',
	    'normal.services'
    ]);
});
