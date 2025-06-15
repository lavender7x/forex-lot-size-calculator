const allowedCurrencies = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'NZD', 'CNY', 'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'HKD'];

export function isValidCurrency(currency: string) {
    return allowedCurrencies.includes(currency.toLocaleUpperCase());
}

export function calculateOffset(prevNumber: number, currentNumber: number): number {
    const prevStr = String(prevNumber);
    const currStr = String(currentNumber);

    let offset = 0;

    if ((currStr.length - 1) % 3 === 0 && currStr.length > 1) {
        offset = 1;
    }

    if (currStr.length < prevStr.length && currStr.length % 3 === 0) {
        offset = -1;
    }

    return offset;
}

export function formatAmount(amount: number | undefined) {
    if (!amount) {
        return '';
    }

    const numbers = [...String(Math.round(amount))].reverse();
    const formatted = [];

    for (let i = 0; i < numbers.length; i++) {
        if (i % 3 === 0 && i > 0) {
            formatted.push(',');
        }
        formatted.push(numbers[i]);
    }

    formatted.reverse();
    formatted.push('$');

    return formatted.join('');
}

export function toNumber(val: string) {
    return Number(val.replace(/[^0-9]/g, ''));
}

export function keepFocusAtPosition(input: HTMLInputElement, prevNumber: number, currentNumber: number) {
    const savedPosition = input.selectionStart as number;
    const offset = calculateOffset(prevNumber, currentNumber)
    setTimeout(() => {
        input.focus();
        input.setSelectionRange(savedPosition + offset, savedPosition + offset);
    }, 10);
}
