// Filter for extract the name from a file path.
myApp.filter('basename', function() {
    var path = require("path");

    return function(input) {
        return (!!input) ? path.basename(input) : '';
    }  
});
