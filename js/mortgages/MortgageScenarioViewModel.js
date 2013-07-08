function ScenarioViewModel(scenario) {
    var self = this;

    self.InvestmentRate = ko.observable(scenario.InvestmentRate);
    self.FormattedInvestmentRate = ko.percentageObservable(self.InvestmentRate, 2);

    self.InflationRate = ko.observable(scenario.InflationRate);
    self.FormattedInflationRate = ko.percentageObservable(self.InflationRate, 2);

    self.TaxRate = ko.observable(scenario.TaxRate);
    self.FormattedTaxRate = ko.percentageObservable(self.TaxRate, 2);

    self.HouseValue = ko.observable(scenario.HouseValue);
    self.FormattedHouseValue = ko.currencyObservable(self.HouseValue);

    self.Scenario = ko.computed(function () {
        return new Scenario(self.InflationRate(), self.InvestmentRate(), self.TaxRate(), self.HouseValue());
    });
}

function MortgageViewModel(mortgage) {
    var self = this;

    self.Amount = ko.observable(mortgage.Amount);
    self.FormattedAmount = ko.currencyObservable(self.Amount);

    self.UpFrontFees = ko.observable(mortgage.UpFrontFees);
    self.FormattedUpFrontFees = ko.currencyObservable(self.UpFrontFees);

    self.Rate = ko.observable(mortgage.Rate);
    self.FormattedRate = ko.percentageObservable(self.Rate);

    self.TermInYears = ko.observable(mortgage.TermInYears);

    self.Insurance = ko.observable(mortgage.Insurance);

    self.Mortgage = ko.computed(function () {
        return new Mortgage(self.Amount(), self.Rate(), self.TermInYears(), self.UpFrontFees(), self.Insurance());
    });
}

function MortgageScenarioViewModel() {

    var self = this;

    self.Mortgages = ko.observableArray();
    self.Mortgages.push(new MortgageViewModel(new Mortgage(30000000, .03, 15, 0)));

    self.CurrentMortgage = ko.observable(self.Mortgages()[0]);
    self.CurrentScenario = ko.observable(new ScenarioViewModel(new Scenario(.02, .08, .25, 36000000)));

    self.SelectMortgage = function (selectedMortgage) {
        self.CurrentMortgage(selectedMortgage);
    }


    // Find the maximum number of years across all the mortgages and return an array from 0 to that value
    self.Years = ko.computed(function () {

        var maxYears = 0;
        var arr = $(self.Mortgages()).map(function (index, value) { return value.TermInYears(); });
        var maxYear = Math.max.apply(Math, arr);

        var results = [];
        for (var year = 0; year <= maxYear; year++) {

            var nominalValues = [];
            var bestValue = 0;
            for (var mortgageIndex = 0; mortgageIndex < self.Mortgages().length; mortgageIndex++) {
                var mortgage = self.Mortgages()[mortgageIndex].Mortgage();
                var value = mortgageCalculator.CalculateMortgageNominalValue(mortgage, self.CurrentScenario().Scenario(), year);
                if (value > bestValue) { bestValue = value; }
                nominalValues.push(value);
            }

            var isBestValue = [];
            for (var mortgageIndex = 0; mortgageIndex < self.Mortgages().length; mortgageIndex++) {
                isBestValue.push(nominalValues[mortgageIndex] == bestValue);
            }

            results.push({ Year: year, NominalValues: nominalValues, IsBestValue: isBestValue });
        }
        return results;

    });

    self.NominalValue = function (mortgageView, year, index) {
        return accounting.toFixed(self.Years()[year].NominalValues[index] / 100.0,2);
    }


    self.Cash = function (mortgageView, year) {
        var cash = mortgageCalculator.CalculateMortgageCash(mortgageView.Mortgage(), self.CurrentScenario().Scenario(), year);
        return accounting.formatMoney(cash/100.0);
    }
    
    self.Principal = function (mortgageView, year) {
        var principal = mortgageCalculator.CalculateMortgagePrincipal(mortgageView.Mortgage(), self.CurrentScenario().Scenario(), year);
        return accounting.formatMoney(-principal/100.0);
    }

    self.HouseValue = function (mortgageView, year) {
        var houseValue = mortgageCalculator.CalculateMortgageHouseValue(mortgageView.Mortgage(), self.CurrentScenario().Scenario(), year);
        return accounting.formatMoney(houseValue/100.0);
    }

    self.AddMortgage = function () {
        self.Mortgages.push(new MortgageViewModel(self.CurrentMortgage().Mortgage()));
        self.CurrentMortgage(self.Mortgages()[self.Mortgages().length - 1]);
    }

    self.DeleteMortgage = function () {
        var oldIndex = self.Mortgages.indexOf(self.CurrentMortgage());
        self.Mortgages.remove(self.CurrentMortgage());
        self.CurrentMortgage(self.Mortgages()[Math.min(self.Mortgages().length - 1, oldIndex)]);
    }

}