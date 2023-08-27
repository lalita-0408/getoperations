const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const history = [];

function calculateExpression(numbers, operators) {
    const newNumbers = [];
    const newOperators = [];

    // First, calculate multiplications and divisions, and simplify the expression
    let currentNumber = parseFloat(numbers[0]);
    for (let i = 0; i < operators.length; i++) {
        if (operators[i] === '*' || operators[i] === '/') {
            const nextNumber = parseFloat(numbers[i + 1]);
            const operator = operators[i];

            if (operator === '*') {
                currentNumber *= nextNumber;
            } else if (operator === '/') {
                currentNumber /= nextNumber;
            }
        } else {
            newNumbers.push(currentNumber);
            newOperators.push(operators[i]);
            currentNumber = parseFloat(numbers[i + 1]);
        }
    }
    newNumbers.push(currentNumber);

    // Then, calculate additions and subtractions
    let result = newNumbers[0];
    for (let i = 0; i < newOperators.length; i++) {
        const number = newNumbers[i + 1];
        const operator = newOperators[i];

        switch (operator) {
            case '+':
                result += number;
                break;
            case '-':
                result -= number;
                break;
            default:
                throw new Error('Invalid operator');
        }
    }

    return result;
}

app.get('*', (req, res) => {
    const components = req.originalUrl.split('/').filter(Boolean);

    const numbers = [];
    const operators = [];

    for (let i = 0; i < components.length; i++) {
        if (i % 2 === 0) {
            numbers.push(components[i]);
        } else {
            const operator = components[i];
            switch (operator) {
                case 'plus':
                    operators.push('+');
                    break;
                case 'minus':
                    operators.push('-');
                    break;
                case 'into':
                    operators.push('*');
                    break;
                case 'divided':
                    operators.push('/');
                    break;
                default:
                    throw new Error('Invalid operator');
            }
        }
    }

    try {
        const result = calculateExpression(numbers, operators);
        const expressionString = numbers.map((num, index) => {
            if (index > 0) {
                return operators[index - 1] + ' ' + num;
            }
            return num;
        }).join(' ');
        const historyEntry = { question: expressionString, answer: result };

        if (history.length >= 20) {
            history.shift();
        }
        history.push(historyEntry);

        res.json({ question: expressionString, answer: result });
    } catch (error) {
        res.status(400).json({ error: 'Invalid expression or operator' });
    }
});

app.get('/history', (req, res) => {
    res.json(history);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
