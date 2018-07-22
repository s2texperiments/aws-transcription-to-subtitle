const ONE_TO_NINETEEN = [
    "one", "two", "three", "four", "five",
    "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen",
    "sixteen", "seventeen", "eighteen", "nineteen"
];

const TENS = [
    "ten", "twenty", "thirty", "forty", "fifty",
    "sixty", "seventy", "eighty", "ninety"
];

const SCALES = ["thousand", "million", "billion", "trillion"];

// helper function for use with Array.filter
function isTruthy(item) {
    return !!item;
}

// convert a number into "chunks" of 0-999
function chunk(number) {
    let thousands = [];
    while (number > 0) {
        thousands = [...thousands, (number % 1000)];
        number = Math.floor(number / 1000);
    }
    return thousands;
}

// translate a number from 1-999 into English
function inEnglish(number) {
    let hundreds,  words = [];

    if (number < 20) {
        return ONE_TO_NINETEEN[number - 1]; // may be undefined
    }

    if (number < 100) {
        let ones = number % 10;
        let tens = Math.floor(number / 10);

        return [...words, TENS[tens - 1], inEnglish(ones)]
            .filter(isTruthy)
            .join("");
    }

    hundreds = Math.floor(number / 100);

    return [inEnglish(hundreds), "hundred", inEnglish(number % 100)]
        .filter(isTruthy)
        .join("");
}

// append the word for a scale. Made for use with Array.map
function appendScale(chunk, exp) {
    if (!chunk) {
        return null;
    }
    return [chunk, SCALES[exp - 1]].filter(isTruthy).join("");
}


function* numbers() {
    let i = 0;
    while (true) {
        i += 1;
        yield chunk(i)
            .map(inEnglish)
            .map(appendScale)
            .filter(isTruthy)
            .reverse()
            .join("");
    }
}

module.exports = {
    createGenerator: () => numbers()
};