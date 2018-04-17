var app = angular.module('tempLogger', ['angularSpinner', 'ngSanitize', 'ui.select']);

app.controller('DashboardCtrl', ['$scope', '$timeout', '$http', '$q', '$filter', 'DashboardStats', 
    function($scope, $timeout, $http, $q, $filter, DashboardStats) {

        var data = [];
        var url = 'https://mzs-tmp-logger-service.herokuapp.com/entity';
        $http.get(url).then(function (response) {
            for(var i=0;i<response.data.length;i++){
                data.push({id: response.data[i].entityId, name: response.data[i].name});
            };
            $scope.entities =  data;
            $scope.selectedEntity = $scope.entities[0];
        });
        
        $scope.tempReadings = {"entityId": "", "readingCelsius": "", "dateTimeStamp": ""};

        pollData();

        function pollData() {
            DashboardStats.poll().then(function(data) {
                var currC = data.response[0].readingCelsius;
                var currF = ((9/5 * parseFloat(currC)) + 32).toFixed(2);
				var voltage = data.response[0].voltage;
				
                var d = data.response[0].dateTimeStamp + " UTC";
                var d1  = d.replace(/-/g,'/');
                var d2 = new Date(d1).toLocaleString();
                                                                
                $scope.CurrentTempInC = currC;
                $scope.CurrentTempInF = currF;
                $scope.LastRecorded = d2;
				$scope.voltage = voltage;

                $scope.TempList = data;
                $timeout(pollData, 1000);
            });
        }

        $scope.refreshData = function(){
            pollData();
        }

        //$scope.itemArray = [
        //    {id: 1, name: 'first'},
        //    {id: 2, name: 'second'},
        //    {id: 3, name: 'third'},
        //    {id: 4, name: 'fourth'},
        //    {id: 5, name: 'fifth'},
        //];

        //$scope.selected = { value: $scope.itemArray[0] };

        

    }]);
   

    function convertUTCDateToLocalDate(date) {
        var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

        var offset = date.getTimezoneOffset() / 60;
        var hours = date.getHours();

        newDate.setHours(hours - offset);

        return newDate;   
    }

    app.factory('DashboardStats', ['$http', '$timeout', function($http, $timeout) {
        $http.defaults.headers.post["Content-Type"] = "application/json";

        var data = { response: { }, calls: 0 };

        var poller = function () {
            var url = 'https://mzs-tmp-logger-service.herokuapp.com/temperature'
            return $http.get(url).then(function (responseData) {
                data.calls++;
                data.response = responseData.data;
                return data;
            });
        };

        return {
            poll: poller
        }
    }]);

