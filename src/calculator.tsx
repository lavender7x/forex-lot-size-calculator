import { useCallback, useRef, useState } from 'react';
import './calculator.css';
import { formatAmount, isValidCurrency, keepFocusAtPosition, toNumber } from './utils';

export function Calculator() {
    const [accountBalance, setAccountBalance] = useState(1000);
    const prevAccountBalance = useRef<number>(accountBalance);

    const [riskPercent, setRiskPercent] = useState<string>();
    const [riskAmount, setRiskAmount] = useState<number>();
    const prevRiskAmount = useRef<number>(riskAmount || 0);

    const [base, setBase] = useState('EUR');
    const [quote, setQuote] = useState('USD');

    const [stopLoss, setStopLoss] = useState<number>(0);
    const [calculatedLotSize, setCalculatedLotSize] = useState<number>(0);

    const [error, setError] = useState<string>();

    const onBalanceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const enteredAccountBalanceNumber = toNumber(e.target.value);
        setAccountBalance(enteredAccountBalanceNumber);

        keepFocusAtPosition(e.target as HTMLInputElement, prevAccountBalance.current, enteredAccountBalanceNumber);

        prevAccountBalance.current = enteredAccountBalanceNumber;

        if (riskPercent !== undefined) {
            setRiskAmount(enteredAccountBalanceNumber * (Number(riskPercent) / 100));
        }
    }, [riskPercent]);


    const onRiskPercentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setRiskPercent(e.target.value);
        if (accountBalance) {
            setRiskAmount(accountBalance * (Number(e.target.value) / 100));
        }
    }, [accountBalance]);


    const onRiskAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const enteredRiskAmountNumber = toNumber(e.target.value);
        setRiskAmount(enteredRiskAmountNumber);

        keepFocusAtPosition(e.target as HTMLInputElement, prevRiskAmount.current, enteredRiskAmountNumber);

        prevRiskAmount.current = enteredRiskAmountNumber;

        setRiskPercent(String(Number((enteredRiskAmountNumber / accountBalance) * 100.0).toFixed(1)));
    }, [accountBalance]);

    const onCalculate = useCallback(() => {
        setError(undefined);

        if (!stopLoss || stopLoss <= 0) {
            setError('Please enter a valid stop loss value');
            return;
        }

        if (!riskAmount || riskAmount <= 0) {
            setError('Please enter a valid risk amount');
            return;
        }

        if (!isValidCurrency(base) || !isValidCurrency(quote)) {
            setError('Please enter a valid base or quote currency');
            return;
        }

        const promise = quote.toUpperCase() === 'USD'
            ? Promise.resolve(1)
            : fetch(`https://api.frankfurter.app/latest?from=USD&to=${quote}`).then(res => res.json()).then(data => Number(data.rates[quote]));

        promise.then(rate => {
            const pipDecimal = quote === 'JPY' ? 0.01 : 0.0001;
            const x = (riskAmount * rate) / stopLoss / pipDecimal;
            setCalculatedLotSize(x / 100_000);
        }).catch(() => {
            setError(`Error fetching exchange rate`);
        });

    }, [stopLoss, riskAmount, base, quote]);

    return (
        <div className="main-container">
            <div className="header">
                Lot Size Calculator
            </div>

            <div className="row-flex">
                <div>
                    <div className="label">Base</div>
                    <div><input type="text" value={base} onChange={e => setBase(e.target.value)} /></div>
                </div>

                <div>
                    <div className="label">Quote</div>
                    <input type="text" value={quote} onChange={e => setQuote(e.target.value)} />
                </div>
            </div>

            <div className="row">
                <div className="label">Account Balance</div>
                <div><input type="text" value={formatAmount(accountBalance)} onChange={e => onBalanceChange(e)} /></div>
            </div>

            <div className="row-flex">
                <div>
                    <div className="label">Risk %</div>
                    <div><input type="text" value={riskPercent} onChange={e => onRiskPercentChange(e)} /></div>
                </div>

                <div>
                    <div className="label">Risk Amount</div>
                    <div><input type="text" value={formatAmount(riskAmount)} onChange={e => onRiskAmountChange(e)} /></div>
                </div>
            </div>

            <div className="row">
                <div className="label">Stop Loss (Pips)</div>
                <div><input type="text" value={stopLoss} onChange={e => setStopLoss(Number(e.target.value))} /></div>
            </div>

            <div className="row">
                <button type="button" className="calculate-button" onClick={onCalculate}>Calculate</button>
            </div>

            <div className="row">
                <div className="label">Calculated Lot Size</div>
                <div className="result">{
                    error ? <span className="error">Error: {error}</span> : calculatedLotSize.toFixed(2)
                }</div>
            </div>

        </div>
    )
};

