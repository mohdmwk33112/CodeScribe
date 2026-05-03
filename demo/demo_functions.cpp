/**
 * Demo file for CodeScribe - C++ Edition
 */

#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <set>
#include <cmath>
#include <sstream>

using namespace std;

/**
 * @brief Calculate the factorial of a non-negative integer.
 * 
 * @param n A non-negative integer to calculate factorial for.
 * @return long long The factorial of n (n!).
 * @throws invalid_argument If n is negative.
 * 
 * @example
 * calculateFactorial(5);  // Returns: 120
 * calculateFactorial(0);  // Returns: 1
 */
long long calculateFactorial(int n) {
    if (n < 0) {
        throw invalid_argument("Factorial is not defined for negative numbers");
    }
    if (n == 0 || n == 1) {
        return 1;
    }
    long long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

bool isPalindrome(const string& text) {
    string cleaned;
    for (char c : text) {
        if (isalnum(c)) {
            cleaned += tolower(c);
        }
    }
    string reversed = cleaned;
    reverse(reversed.begin(), reversed.end());
    return cleaned == reversed;
}

vector<int> findPrimeNumbers(int limit) {
    vector<int> primes;
    if (limit < 2) {
        return primes;
    }
    
    for (int num = 2; num <= limit; num++) {
        bool isPrime = true;
        for (int i = 2; i <= sqrt(num); i++) {
            if (num % i == 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) {
            primes.push_back(num);
        }
    }
    return primes;
}

vector<int> mergeSortedVectors(const vector<int>& vec1, const vector<int>& vec2) {
    vector<int> merged;
    size_t i = 0, j = 0;
    
    while (i < vec1.size() && j < vec2.size()) {
        if (vec1[i] <= vec2[j]) {
            merged.push_back(vec1[i]);
            i++;
        } else {
            merged.push_back(vec2[j]);
            j++;
        }
    }
    
    while (i < vec1.size()) {
        merged.push_back(vec1[i]);
        i++;
    }
    
    while (j < vec2.size()) {
        merged.push_back(vec2[j]);
        j++;
    }
    
    return merged;
}

double calculateAverage(const vector<int>& numbers) {
    if (numbers.empty()) {
        return 0.0;
    }
    int sum = 0;
    for (int num : numbers) {
        sum += num;
    }
    return static_cast<double>(sum) / numbers.size();
}

string reverseWords(const string& sentence) {
    istringstream iss(sentence);
    string word;
    string result;
    bool first = true;
    
    while (iss >> word) {
        if (!first) {
            result += " ";
        }
        reverse(word.begin(), word.end());
        result += word;
        first = false;
    }
    
    return result;
}

template<typename T>
vector<T> findDuplicates(const vector<T>& items) {
    set<T> seen;
    set<T> duplicates;
    
    for (const T& item : items) {
        if (seen.find(item) != seen.end()) {
            duplicates.insert(item);
        } else {
            seen.insert(item);
        }
    }
    
    return vector<T>(duplicates.begin(), duplicates.end());
}

vector<long long> calculateFibonacci(int n) {
    vector<long long> fibSequence;
    
    if (n <= 0) {
        return fibSequence;
    } else if (n == 1) {
        fibSequence.push_back(0);
        return fibSequence;
    } else if (n == 2) {
        fibSequence.push_back(0);
        fibSequence.push_back(1);
        return fibSequence;
    }
    
    fibSequence.push_back(0);
    fibSequence.push_back(1);
    
    for (int i = 2; i < n; i++) {
        long long next = fibSequence[i - 1] + fibSequence[i - 2];
        fibSequence.push_back(next);
    }
    
    return fibSequence;
}

int main() {
    cout << "Factorial of 5: " << calculateFactorial(5) << endl;
    cout << "Is 'racecar' a palindrome? " << (isPalindrome("racecar") ? "true" : "false") << endl;
    
    vector<int> primes = findPrimeNumbers(20);
    cout << "Primes up to 20: ";
    for (int p : primes) {
        cout << p << " ";
    }
    cout << endl;
    
    vector<int> nums = {1, 2, 3, 4, 5};
    cout << "Average of [1,2,3,4,5]: " << calculateAverage(nums) << endl;
    
    vector<long long> fib = calculateFibonacci(10);
    cout << "Fibonacci sequence (10): ";
    for (long long f : fib) {
        cout << f << " ";
    }
    cout << endl;
    
    return 0;
}

// Made with Bob
