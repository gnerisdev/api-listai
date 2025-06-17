import Decimal from 'decimal.js';

export class MathUtils {
  static getPercentValue(percent, total) {
    const decimalPercent = new Decimal(percent);
    const decimalTotal = new Decimal(total);
    return decimalPercent.div(100).times(decimalTotal);
  }

  static addPercentage(value, percent) {
    const decimalValue = new Decimal(value);
    const decimalPercent = new Decimal(percent);
    const factor = decimalPercent.div(100).plus(1);
    return decimalValue.times(factor).toNumber();
  }

  // Aplica o desconto do sistema (10%)
  static applySystemDiscount(value) {
    const decimalValue = new Decimal(value);
    const discount = this.getPercentValue(10, value);
    return decimalValue.minus(discount);
  }

  // Aplica a taxa da operadora de pagamento (5%)
  static applyPaymentOperatorFee(value) {
    const decimalValue = new Decimal(value);
    const fee = this.getPercentValue(5, value);
    return decimalValue.minus(fee);
  }

  // Calcula o valor final a ser recebido pelo cliente após ambos os descontos
  static calculateAmountReceived(value) {
    const afterSystemDiscount = this.applySystemDiscount(value);
    const finalAmount = this.applyPaymentOperatorFee(afterSystemDiscount);
    return finalAmount.toFixed(2);
  }

  static sum(values) {
    if (!values || values.length === 0) return new Decimal(0);
    return values.reduce((acc, val) => acc.plus(new Decimal(val)), new Decimal(0));
  }

  static subtract(values) {
    if (!values || values.length === 0) return new Decimal(0);
    return values.slice(1).reduce((acc, val) => acc.minus(new Decimal(val)), new Decimal(values[0]));
  }
}
