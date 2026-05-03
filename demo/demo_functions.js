/**
 * Demo file for CodeScribe - JavaScript Edition
 */


/**
 * Calculate the factorial of a non-negative integer.
 * 
 * @param {number} n - A non-negative integer to calculate factorial for.
 * @returns {number} The factorial of n (n!).
 * @throws {Error} If n is negative.
 * 
 * @example
 * calculateFactorial(5); // Returns: 120
 * calculateFactorial(0); // Returns: 1
 */
function calculateFactorial(n) {
    if (n < 0) {
        throw new Error("Factorial is not defined for negative numbers");
    }
    if (n === 0 || n === 1) {
        return 1;
    }
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}


function isPalindrome(text) {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}


function findPrimeNumbers(limit) {
    if (limit < 2) {
        return [];
    }
    const primes = [];
    for (let num = 2; num <= limit; num++) {
        let isPrime = true;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) {
            primes.push(num);
        }
    }
    return primes;
}


function mergeSortedArrays(arr1, arr2) {
    const merged = [];
    let i = 0, j = 0;
    
    while (i < arr1.length && j < arr2.length) {
        if (arr1[i] <= arr2[j]) {
            merged.push(arr1[i]);
            i++;
        } else {
            merged.push(arr2[j]);
            j++;
        }
    }
    
    return merged.concat(arr1.slice(i)).concat(arr2.slice(j));
}


function calculateAverage(numbers) {
    if (numbers.length === 0) {
        return 0;
    }
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}


function reverseWords(sentence) {
    return sentence
        .split(' ')
        .map(word => word.split('').reverse().join(''))
        .join(' ');
}


function findDuplicates(items) {
    const seen = new Set();
    const duplicates = new Set();
    
    for (const item of items) {
        if (seen.has(item)) {
            duplicates.add(item);
        } else {
            seen.add(item);
        }
    }
    
    return Array.from(duplicates);
}


function calculateFibonacci(n) {
    if (n <= 0) {
        return [];
    } else if (n === 1) {
        return [0];
    } else if (n === 2) {
        return [0, 1];
    }
    
    const fibSequence = [0, 1];
    for (let i = 2; i < n; i++) {
        fibSequence.push(fibSequence[i - 1] + fibSequence[i - 2]);
    }
    return fibSequence;
}


module.exports = {
    calculateFactorial,
    isPalindrome,
    findPrimeNumbers,
    mergeSortedArrays,
    calculateAverage,
    reverseWords,
    findDuplicates,
    calculateFibonacci
};

// Made with Bob
