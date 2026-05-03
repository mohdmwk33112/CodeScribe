/**
 * Demo file for CodeScribe - Java Edition
 */

import java.util.*;

public class DemoFunctions {

    public static boolean isPalindrome(String text) {
        String cleaned = text.toLowerCase().replaceAll("[^a-z0-9]", "");
        String reversed = new StringBuilder(cleaned).reverse().toString();
        return cleaned.equals(reversed);
    }

    public static List<Integer> findPrimeNumbers(int limit) {
        List<Integer> primes = new ArrayList<>();
        if (limit < 2) {
            return primes;
        }
        
        for (int num = 2; num <= limit; num++) {
            boolean isPrime = true;
            for (int i = 2; i <= Math.sqrt(num); i++) {
                if (num % i == 0) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) {
                primes.add(num);
            }
        }
        return primes;
    }

    public static List<Integer> mergeSortedLists(List<Integer> list1, List<Integer> list2) {
        List<Integer> merged = new ArrayList<>();
        int i = 0, j = 0;
        
        while (i < list1.size() && j < list2.size()) {
            if (list1.get(i) <= list2.get(j)) {
                merged.add(list1.get(i));
                i++;
            } else {
                merged.add(list2.get(j));
                j++;
            }
        }
        
        while (i < list1.size()) {
            merged.add(list1.get(i));
            i++;
        }
        
        while (j < list2.size()) {
            merged.add(list2.get(j));
            j++;
        }
        
        return merged;
    }
    
    public static double calculateAverage(List<Integer> numbers) {
        if (numbers.isEmpty()) {
            return 0.0;
        }
        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }
        return (double) sum / numbers.size();
    }

    public static String reverseWords(String sentence) {
        String[] words = sentence.split(" ");
        StringBuilder result = new StringBuilder();
        
        for (int i = 0; i < words.length; i++) {
            String reversed = new StringBuilder(words[i]).reverse().toString();
            result.append(reversed);
            if (i < words.length - 1) {
                result.append(" ");
            }
        }
        
        return result.toString();
    }

    public static <T> List<T> findDuplicates(List<T> items) {
        Set<T> seen = new HashSet<>();
        Set<T> duplicates = new HashSet<>();
        
        for (T item : items) {
            if (seen.contains(item)) {
                duplicates.add(item);
            } else {
                seen.add(item);
            }
        }
        
        return new ArrayList<>(duplicates);
    }

    public static List<Long> calculateFibonacci(int n) {
        List<Long> fibSequence = new ArrayList<>();
        
        if (n <= 0) {
            return fibSequence;
        } else if (n == 1) {
            fibSequence.add(0L);
            return fibSequence;
        } else if (n == 2) {
            fibSequence.add(0L);
            fibSequence.add(1L);
            return fibSequence;
        }
        
        fibSequence.add(0L);
        fibSequence.add(1L);
        
        for (int i = 2; i < n; i++) {
            long next = fibSequence.get(i - 1) + fibSequence.get(i - 2);
            fibSequence.add(next);
        }
        
        return fibSequence;
    }

    public static void main(String[] args) {
        System.out.println("Factorial of 5: " + calculateFactorial(5));
        System.out.println("Is 'racecar' a palindrome? " + isPalindrome("racecar"));
        System.out.println("Primes up to 20: " + findPrimeNumbers(20));
        System.out.println("Average of [1,2,3,4,5]: " + calculateAverage(Arrays.asList(1,2,3,4,5)));
        System.out.println("Fibonacci sequence (10): " + calculateFibonacci(10));
    }
     /**
     * Calculate the factorial of a non-negative integer.
     * 
     * @param n A non-negative integer to calculate factorial for.
     * @return The factorial of n (n!).
     * @throws IllegalArgumentException If n is negative.
     * 
     * @example
     * <pre>
     * calculateFactorial(5);  // Returns: 120
     * calculateFactorial(0);  // Returns: 1
     * </pre>
     */
    public static long calculateFactorial(int n) {
        if (n < 0) {
            throw new IllegalArgumentException("Factorial is not defined for negative numbers");
        }
        if (n == 0 || n == 1) {
            return 1;
        }
        long result = 1;
        for (int i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
}

// Made with Bob
