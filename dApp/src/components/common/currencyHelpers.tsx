import { tokenTransctionService } from "@services/token-transaction.service";

export function getSymbol(currencyTicker: string){
    const currencySymbolMap = {
        'USD': '$',
        'EUR': '€',
        'JPY': 'JP¥',
        'GBP': '£',
        'AUD': 'A$',
        'CAD': 'C$',
        'CHF': 'CHF',
        'CNY': 'CN¥',     
        'SEK': 'kr',
        'NZD': 'NZ$',
        'MXN': 'MX$',     
        'SGD': 'S$',
        'HKD': 'HK$',
        'NOK': 'kr',
        'KRW': '₩',
        'TRY': '₺',
        'INR': '₹',
        'BRL': 'R$',
        'ZAR': 'R',
        'RUB': '₽'
      };
      return currencySymbolMap[currencyTicker] || 'Unknown Currency';
}

export async function convertPrice(currencyTicker: string, price: number){
  let rates = await tokenTransctionService.getExchangeRateFIAT();
  

}