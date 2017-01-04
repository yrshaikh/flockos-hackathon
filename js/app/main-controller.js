angular.module('timezoneApp').controller('mainController', [
    "$scope", "storageService", "searchService", function ($scope, storageService, searchService) {
    var timeFormat = 'MMMM Do YYYY, h:mm:ss a';
    constructor  = function() {
        storageService.get()
            .then(function (data) {
                if(_.isEmpty(data))
                    data = { timezoneData:{} };
                $scope.timeformat= data.timeformat || 'ampm';
                var previouslyAddedTimezones = data.timezone;
                $scope.selectedTimezones = [];
                var utcDate = moment().utc().format(timeFormat);
                var utcDisplay = moment().utc().format('h:mm A');
                $scope.utc = {
                    Id: "utc",
                    Abbreviation: "UTC",
                    Name: "Universal Time Coordinated",
                    Offset: 0,
                    Date: utcDate,
                    Display: utcDisplay
                };
                $scope.selectedTimezones.push($scope.utc);
                if (previouslyAddedTimezones) {
                    var newTimeFormat = $scope.timeformat === 'ampm' ? 'h:mm A' : 'H:mm';
                    _.each(previouslyAddedTimezones, function (item) {
                        if (item.Id) {
                            item.Date = moment().utc().add('hours', item.Offset).format(timeFormat);
                            item.Display = moment().utc().add('hours', item.Offset).format(newTimeFormat);
                            item.edit = false;
                            $scope.selectedTimezones.push(item);
                        }
                    });
                }
                $scope.selected = null;
            });
    };

    $scope.storage = storageService;
    $scope.$watch('storage.data', function() {
        $scope.timezoneList = $scope.storage.data;
    });
    $scope.$watch('timeformat', function() {
        timeFormatChanged();
        storageService.setTimeFormat($scope.timeformat);
    });
    $scope.$watch('selected', function(newValue, oldValue) {
        if(newValue && newValue["Abbreviation"]){
            var newTimeFormat = $scope.timeformat === 'ampm' ? 'h:mm A' : 'H:mm';
            newValue.Date = moment().utc().add('hours', newValue.Offset).format(timeFormat);
            newValue.Display = moment().utc().add('hours', newValue.Offset).format(newTimeFormat);
            storageService.set(newValue);
            $scope.selectedTimezones.push(newValue);
            $scope.selected = null;
        }
    });
    $scope.remove = function(timezone) {
        $scope.selectedTimezones = _.reject($scope.selectedTimezones, function(item) {            
            return item.Id === timezone.Id;
        });
        storageService.remove(timezone);
    };
    $scope.getTimeZone = function(searchTerm) {
        return searchService.dataSearch(searchTerm);
    };
    $scope.edit = function(timezone){
        _.each($scope.selectedTimezones, function(item){
            item.edit = false;
        });
        timezone.edit = true;
        timezone.editObject = {};
        timezone.editObject = {
            hour:  moment(timezone.Date, timeFormat).format('h'),
            minute:  moment(timezone.Date, timeFormat).format('mm'),
            a:  moment(timezone.Date, timeFormat).format('A')
        };
        if($scope.timeformat === '24hr'){
            timezone.editObject.hour = moment(timezone.Date, timeFormat).format('H');
        }
    };
    $scope.save = function(timezone){
        timezone.edit = false;
        timeChanged(timezone);         
    };

    $scope.cancel = function(timezone){
        timezone.editObject = {};
        timezone.edit = false;
    };
    constructor();

    var timeChanged = function(timezone){
        var hour = timezone.editObject.hour%12 - moment(timezone.Date, timeFormat).format('h');
        if($scope.timeformat === '24hr'){
            hour = timezone.editObject.hour%24 - moment(timezone.Date, timeFormat).format('H');
        }
        var minute = timezone.editObject.minute - moment(timezone.Date, timeFormat).format('mm');
        var timeformatInitial = moment(timezone.Date, timeFormat).format('A');
        var timeformat = timezone.editObject.a;
        var diffHour = 0;
        if($scope.timeformat === 'ampm' && timeformatInitial !== timeformat){
            diffHour = timeformatInitial === 'AM' ? 12 : -12;
        }
        $scope.selectedTimezones[0].Date = moment($scope.selectedTimezones[0].Date, timeFormat).add('hours', hour+diffHour).add('minutes', minute).format(timeFormat);
        $scope.selectedTimezones[0].Display = moment($scope.selectedTimezones[0].Date, timeFormat).format('h:mm A');

        _.each($scope.selectedTimezones, function(item, index){
            if(index !== 0){
                item.Date = moment($scope.selectedTimezones[0].Date, timeFormat).add('hours', item.Offset).format(timeFormat);
                item.Display = moment(item.Date, timeFormat).format('h:mm A');
            }
        });
        timeFormatChanged();
    };

    var timeFormatChanged = function(){
        var newTimeFormat = $scope.timeformat === 'ampm' ? 'h:mm A' : 'H:mm';

        _.each($scope.selectedTimezones, function(item, index){
            item.Display = moment(item.Date, timeFormat).format(newTimeFormat);
        });
    }
}]);