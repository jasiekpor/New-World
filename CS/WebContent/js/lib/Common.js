var myApp = angular.module("Common", ["ngAnimate","chartDirective",'file-model','sticky','Common','ui.bootstrap']);
myApp.controller("CommonCtrl", function ($scope,$http,$rootScope) {
	$scope.open = function() {
  $scope.showModal = true;
};

$scope.ok = function() {
  $scope.showModal = false;
};

$scope.cancel = function() {
  $scope.showModal = false;
};
	});