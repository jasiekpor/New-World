var myApp = angular.module("characerSheetHtmlModificationModule", []);
myApp.controller("HtmlModController",  function ($scope) {
		$scope.tabShow = new Map();
		$scope.tabShow[0]=true;
		console.log($scope.tabShow[0]);
		console.log('dupa');
		$scope.tabShowFn = function(passedNumber){
			for(i=0;i<3;i++){
				$scope.tabShow[i]=false;
				$scope.tabShow[passedNumber]=true;
				console.log('dupa');
			};
		};
	});