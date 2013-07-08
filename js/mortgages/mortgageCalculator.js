if (mortgageCalculator === undefined) {
    var mortgageCalculator = {};
}

mortgageCalculator.CalculateMortgageCash = function(mortgage, scenario, year) {

    var initialCash = mortgage.Amount - mortgage.UpFrontFees;
    var cash = initialCash;

    var monthlyInvestment = Math.pow(1 + scenario.InvestmentRate, 1.0 / 12.0);
    var monthlyPayment = mortgage.BaseMonthlyPayment();
    var initialPrincipal = mortgage.Amount;
    var principal = initialPrincipal;

    for (var month = 0; month < 12 * year; month++) {

        if (month < mortgage.TermInYears * 12) {
            var monthlyInterest = principal * mortgage.Rate / 12.0;
            principal = principal - (monthlyPayment - principal * mortgage.Rate / 12.0);
            cash = (cash - monthlyPayment + monthlyInterest * scenario.TaxRate) * monthlyInvestment;
        } else {
            cash = cash * monthlyInvestment;
        }
    }


    return parseInt(accounting.toFixed(cash,0));
}

mortgageCalculator.CalculateMortgagePrincipal = function(mortgage, scenario, year) {

    var initialPrincipal = mortgage.Amount;
    var principal = initialPrincipal;

    var monthlyPayment = mortgage.BaseMonthlyPayment();

    for (var month = 0; month < 12 * year; month++) {

        if (month < mortgage.TermInYears * 12) {
            principal = principal - (monthlyPayment - principal * mortgage.Rate / 12.0);
        } else {
            principal = 0;
        }
    }

    return parseInt(accounting.toFixed(principal,0));
}

mortgageCalculator.CalculateMortgageHouseValue = function (mortgage, scenario, year) {

    var initialHouseValue = scenario.HouseValue;
    var houseValue = initialHouseValue;
    var yearlyInflation = 1 + scenario.InflationRate;

    for (var yearIndex = 0; yearIndex < year; yearIndex++) {
        houseValue = houseValue * yearlyInflation;
    }

    return parseInt(accounting.toFixed(houseValue,0));
}

mortgageCalculator.CalculateMortgageNominalValue = function (mortgage, scenario, year) {

    var cash = mortgageCalculator.CalculateMortgageCash(mortgage, scenario, year);
    var houseValue = mortgageCalculator.CalculateMortgageHouseValue(mortgage, scenario, year);
    var principal = mortgageCalculator.CalculateMortgagePrincipal(mortgage, scenario, year);

    return cash + houseValue - principal;

}