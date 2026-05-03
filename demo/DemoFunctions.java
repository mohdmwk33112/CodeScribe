/**
 * Demo file for CodeScribe - Java Edition
 */

import java.util.*;

public class DemoFunctions {

    /**
     * Determines if a given string is a palindrome, ignoring non-alphanumeric characters and case sensitivity.
     *
     * Args:
     *     text (String): Input string to check for palindrome.
     *
     * Returns:
     *     boolean: True if the input string is a palindrome, false otherwise.
     *
     * Note: The function considers only alphanumeric characters and is case-insensitive, meaning it treats 'A' and 'a' as the same character and ignores spaces, punctuation, and special characters.
     */
    public static boolean isPalindrome(String text) {
        String cleaned = text.toLowerCase().replaceAll("[^a-z0-9]", "");
        String reversed = new StringBuilder(cleaned).reverse().toString();
        return cleaned.equals(reversed);
    }

    /**
     * Find all prime numbers up to a given limit.
     *
     * Args:
     *     limit (int): Upper bound for finding prime numbers.
     *
     * Returns:
     *     List<Integer>: List of prime numbers up to the limit.
     *
     * Note: This function uses a trial division method, which has a time complexity of O(n*sqrt(n)), and may not be efficient for large limits. It also only checks divisibility up to the square root of a number, taking advantage of the fact that a larger factor of the number would be a multiple of a smaller factor that has already been checked.
     */
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

    /**
     * Merge two sorted lists into a single sorted list.
     *
     * Args:
     *     list1 (List<Integer>): First sorted list of integers.
     *     list2 (List<Integer>): Second sorted list of integers.
     *
     * Returns:
     *     List<Integer>: A new sorted list containing all elements from both input lists.
     *
     * Note: This function assumes that input lists are already sorted in ascending order. If input lists are not sorted, the resulting merged list will not be sorted correctly. This function has a time complexity of O(n + m), where n and m are the sizes of the input lists, making it efficient for large inputs. However, it requires extra space to store the merged list, which can be a limitation for very large inputs.
     */
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
    
    /**
     * Calculate the average of a list of integers.
     *
     * Args:
     *     numbers (List<Integer>): List of integers to calculate average from.
     *
     * Returns:
     *     double: Average of the numbers in the list, or 0.0 if the list is empty.
     *
     * Note: This function does not handle the case where the sum of the numbers exceeds the maximum limit of an integer, which could result in an incorrect average. It also does not handle null input, which would result in a NullPointerException.
     */
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

    /**
     * Reverses the order of characters in each word of a sentence while preserving word order.
     *
     * Args:
     *     sentence (String): Input sentence to reverse words in.
     *
     * Returns:
     *     String: Sentence with each word reversed.
     *
     * Note: This function considers punctuation as part of a word and reverses it accordingly. It also assumes that words are separated by a single space character. If the input sentence contains multiple consecutive spaces, they will be treated as a single separator.
     */
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

    /**
     * Generate a list of the first n Fibonacci numbers.
     *
     * Args:
     *     n (int): Number of Fibonacci numbers to generate.
     *
     * Returns:
     *     List<Long>: List of the first n Fibonacci numbers.
     *
     * Note: This function uses a dynamic programming approach to calculate Fibonacci numbers, which reduces computational complexity from exponential to linear. However, it may cause an OutOfMemoryError for large values of n due to the storage of the entire Fibonacci sequence. The function also does not handle cases where n is a negative integer, instead returning an empty list as per the problem definition. The use of Long data type allows the function to handle larger Fibonacci numbers, but it may still overflow for very large values of n.
     */
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

    /**
     * Entry point of the application, demonstrating various mathematical and string operations.
     *
     * Args:
     *     args (String[]): Command line arguments, not utilized in this implementation.
     *
     * Returns:
     *     None: This method does not return any value, it prints results directly to the console.
     *
     * Notes:
     *     The method showcases five distinct calculations: factorial, palindrome check, prime number generation, average calculation, and Fibonacci sequence generation, each with its own method call.
     */
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
