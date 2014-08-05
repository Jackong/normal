require.config({
	paths: {
		angular: [
            'http://cdn.bootcss.com/angular.js/1.2.16/angular.min',
            'libs/angular/angular'
        ],
        angularRoute: [
            'http://cdn.bootcss.com/angular.js/1.2.16/angular-route.min',
            'libs/angular-route/angular-route'
        ],
		angularResource: [
            'http://cdn.bootcss.com/angular.js/1.2.16/angular-resource.min',
            'libs/angular-resource/angular-resource'
        ],
        jquery: [
            'http://cdn.bootcss.com/jquery/1.10.2/jquery.min',
            'libs/jquery/jquery.min'
        ],
        bootstrap: [
            'http://cdn.bootcss.com/twitter-bootstrap/3.0.3/js/bootstrap.min',
            'libs/bootstrap/dist/js/bootstrap.min'
        ]
    },
	shim: {
        angular : {exports : 'angular'},
        angularRoute: ['angular'],
        angularResource: ['angular'],
        jquery: {exports: '$'},
        bootstrap: {
            deps: ['jquery']
        }
	},
	priority: [
		"angular"
	],
    urlArgs: "version=" + (new Date()).getTime()
});

//http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = "NG_DEFER_BOOTSTRAP!";

require( [
	'angular',
    'bootstrap',
	'app'
], function(angular, bootstrap, app) {
	'use strict';
    	window.angular = angular;
	angular.element(document.getElementsByTagName('html')[0]);

	angular.element().ready(function() {
		angular.resumeBootstrap([app['name']]);
	});
});
