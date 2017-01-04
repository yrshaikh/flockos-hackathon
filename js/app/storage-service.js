angular.module('timezoneApp').service('storageService', function ($q) {
    var that = this;
    this.data = [];
    this.deferred = $q.defer();
    this.set = function(value) {
        this.get()
            .then(function(data){
                var timeZoneListToSet = [];
                if(_.isEmpty(data))
                    data = { timezoneData:{} };
                if(data.timezoneData.timezone && Array.isArray(data.timezoneData.timezone)){
                    timeZoneListToSet = data.timezoneData.timezone;
                }
                timeZoneListToSet.push(value);

                data.timezoneData.timezone = timeZoneListToSet;
                localStorage.setItem("timezoneData", JSON.stringify(data.timezoneData));
                that.deferred.resolve(data);
                return that.deferred.promise;
            });
        
    };

    this.setTimeFormat = function (value) {
        this.get()
            .then(function(data){
                if(_.isEmpty(data))
                    data = { timezoneData:{} };
                data.timeformat = value;
                localStorage.setItem("timezoneData", JSON.stringify(data));
                that.deferred.resolve(data);
                return that.deferred.promise;
            })
    };

    this.get = function() {
        var data = localStorage.getItem("timezoneData");
        that.deferred.resolve(JSON.parse(data));
        return this.deferred.promise;
    };

    this.remove = function(timezone){
        this.get()
            .then(function(data){
                if(data && data.timezoneData && data.timezoneData.timezone && Array.isArray(data.timezoneData.timezone)){
                    data.timezoneData.timezone = _.reject(data.timezoneData.timezone, function(item) {
                        return item.Id === timezone.Id;
                    });
                }
                var data = localStorage.getItem("timezoneData", data.timezoneData);
                that.deferred.resolve(JSON.parse(data));
                return that.deferred.promise;
            });
    };
});