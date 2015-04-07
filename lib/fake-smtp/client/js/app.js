(function(angular) {

  'use strict';

  var FakeSMTP = angular.module('FakeSMTP', ['ngRoute']);

  FakeSMTP.config([
    '$routeProvider',
    function($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/emails-list-view.html'
        })
        .when('/email/:uuid', {
          templateUrl: 'views/email-detail-view.html'
        })
        .otherwise('/')
      ;
    }
  ]);

  FakeSMTP.controller('EmailsListViewCtrl', [
    '$scope', '$http',
    function($scope, $http) {

      $scope.emails = [];

      $scope.clearEmails = function() {
        $http.delete('api/emails')
          .then($scope.refreshEmails)
        ;
      };

      $scope.refreshEmails = function() {
        $http.get('api/emails')
          .then(function(res) {
            $scope.emails = res.data;
          })
        ;
      };

      $scope.refreshEmails();

    }
  ]);

  FakeSMTP.controller('EmailsTableCtrl', [
    '$scope', '$http', '$location',
    function($scope, $http, $location) {

      $scope.predicate = '';
      $scope.reverse = false;
      $scope.order = function(prop) {
        $scope.predicate = prop;
        $scope.reverse = !$scope.reverse;
      };

    }
  ]);

  FakeSMTP.controller('EmailDetailsCtrl', [
    '$scope', '$routeParams', '$http',
    function($scope, $routeParams, $http) {

      $http.get('api/emails/'+$routeParams.uuid)
        .then(function(res) {
          $scope.email = res.data;
        })
      ;

    }
  ]);

  FakeSMTP.filter('toTrusted', [
    '$sce',
    function($sce) {
      return function(text) {
        return $sce.trustAsHtml(text);
      };
    }
  ]);

}(angular));
