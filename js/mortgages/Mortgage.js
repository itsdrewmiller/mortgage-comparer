function Mortgage(amountIncludingAmortizedFeesInCents, rate, termInYears, upFrontFeesInCents, houseValueInCents, insurance) {

    var self = this;

    self.Amount = amountIncludingAmortizedFeesInCents;
    self.Rate = rate;
    self.TermInYears = termInYears;
    self.UpFrontFees = upFrontFeesInCents;
    self.Insurance = insurance;

    self.RemainingLoan = function (year) {
        return accounting.toFixed(self.Amount - 12 * year * self.MonthlyPayment(),0);
    }

    self.BaseMonthlyPayment = function () {

        var principle = self.Amount;
        var monthlyInterest = self.Rate / 12.0;
        var months = self.TermInYears * 12;
        var monthlyPayment = principle * monthlyInterest / (1 - Math.pow(1 + monthlyInterest, -months))

        return accounting.toFixed(monthlyPayment,0);

    }
}

function MortgageInsurance(rate, minimumYears, maximumLTVInPoints, upFrontFactor) {
    this.Rate = (rate !== undefined) ? rate : 0;
    this.MinimumYears = minimumYears;
    this.MaximumLTV = maximumLTVInPoints;
    this.UpFrontFactor = (upFrontFactor !== undefined) ? upFrontFactor : 0;

    this.GetCostForMonth = function (year, mortgage, houseValue) {
        var costs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        if (this.Rate === 0) return costs;
        var pastMinimumYears = (year >= this.MinimumYears);
        var remainingLoan = mortgage.RemainingLoan(year);
        var lowEnoughLTV = (MaximumLTV <= 100*(remainingLoan / houseValue));
        if (pastMinimumYears && lowEnoughLTV) return costs;


        var monthlyPayment = mortgage.MonthlyPayment();

        // Get annual average remaining loan
        var loanAmounts = remainingLoan;
        var monthlyAmount = remainingLoan;
        for (var month = 1; month < 12; month++) {
            monthlyAmount = accounting.toFixed(monthlyAmount * mortage.Rate , 2) / 1200.0 + monthlyAmount - monthlyPayment;
            loanAmounts += monthlyAmount;
        }

        var averageBalance = loanAmounts / 12;
        var monthlyMip = accounting.toFixed(accounting.toFixed((this.Rate * averageBalance) / (1 + this.UpFrontFactor), 0) / 12, 0);

        for (var month = 0; month < 12; month++) {
            costs[month] = monthlyMip;
        }

        return costs;
    }
}