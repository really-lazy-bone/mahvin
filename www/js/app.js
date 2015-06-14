// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })

  .config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('landing', {
        url: '/',
        templateUrl: 'partials/landing.html',
        controller: 'LandingCtrl as landing'
      })
      .state('response', {
        url: '/response',
        templateUrl: 'partials/response.html',
        controller: 'ResponseCtrl as response'
      })
      .state('menu', {
        url: '/menu',
        templateUrl: 'partials/menu.html',
        controller: 'MenuCtrl as menu'
      })
      .state('input', {
        url: '/input',
        templateUrl: 'partials/input.html',
        controller: 'InputCtrl as input'
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/');

  });
