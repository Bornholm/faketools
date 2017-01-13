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
        .when('/email/:emailUuid', {
          templateUrl: 'views/email-details-view.html'
        })
        .otherwise('/')
      ;
    }
  ]);

  FakeSMTP.controller('EmailsListViewCtrl', [
    '$scope', '$http',
    function($scope, $http) {

      $scope.emails = [];
      $scope.loading = true;

      $scope.clearEmails = function() {
        $http.delete('api/emails')
          .then($scope.refreshEmails)
        ;
      };

      $scope.refreshEmails = function() {
        $scope.loading = true;
        $http.get('api/emails')
          .then(function(res) {
            $scope.loading = false;
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

      $scope.predicate = null;
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

      $scope.currentTab = 'html';
      $scope.transferDest = '';

      $scope.emailUuid = $routeParams.emailUuid;

      $http.get('api/emails/'+$routeParams.emailUuid)
        .then(function(res) {
          $scope.email = res.data;
        })
      ;

      $scope.onTransferClick = function() {
        var emails = $scope.transferDest;
        $http.post('api/emails/'+$routeParams.emailUuid+'/transfer', {emails: emails})
          .then(function(res) {
            $scope.transferDest = '';
          })
        ;
      };

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
