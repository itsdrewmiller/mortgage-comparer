// DJM

(function () {

    // Make sure to pass in the observable without evaluating it - we need the function, not the result
    ko.currencyObservable = function(underlyingObservableInCents) {
        return ko.computed({
            read: function () {
                return accounting.formatMoney(underlyingObservableInCents() / 100.0);
            },
            write: function (value) {
                var parsedValue = parseFloat(value.replace(/[^0-9-.]/g, ''));
                underlyingObservableInCents(parseInt(100 * parsedValue));
            }
        });
    }

    // Make sure to pass in the observable without evaluating it - we need the function, not the result
    ko.percentageObservable = function (percentageObservable, precision) {
        precision = (precision !== undefined) ? precision : 3;
        return ko.computed({
            read: function () {
                // This is basically a right trim of zeroes plus removing the decimal if it is a whole number
                return accounting.toFixed(percentageObservable() * 100, precision).replace(/0+$/,'').replace(/\.$/,'') + '%';
            },
            write: function (value) {
                var parsedValue = parseFloat(value.replace(/[^0-9-.]/g, ''));
                percentageObservable(parseFloat(accounting.toFixed(parsedValue/100.0, precision + 2)));
            }
        });
    }


}())