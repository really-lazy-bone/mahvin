angular.module('mahvin', ['ionic', 'ngCordova'])

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
      .state('quiz', {
        url: '/quiz/:id',
        templateUrl: 'partials/quiz.html',
        controller: 'QuizCtrl as quiz'
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
