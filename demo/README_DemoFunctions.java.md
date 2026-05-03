# DemoFunctions.java

## Overview

The DemoFunctions.java file is a comprehensive collection of mathematical and string manipulation functions designed to demonstrate various algorithms and techniques. The primary purpose of this file is to provide a set of reusable functions that can be utilized to solve a range of problems, including palindrome detection, prime number generation, sorted list merging, average calculation, and Fibonacci sequence generation. By including these functions, the file addresses common programming challenges and offers efficient solutions to real-world problems.

The file solves a variety of problems, such as determining whether a given string is a palindrome, finding all prime numbers up to a specified limit, merging two sorted lists, calculating the average of a list of integers, reversing the order of characters in each word of a sentence, and generating a list of Fibonacci numbers. These functions can be used in a wide range of applications, from data analysis and algorithm development to web development and scientific computing. The inclusion of a main method allows for easy demonstration and testing of the functions, making it a valuable resource for developers and programmers.

Key functionality in the DemoFunctions.java file includes the isPalindrome, findPrimeNumbers, mergeSortedLists, calculateAverage, reverseWords, and calculateFibonacci functions, each with its own unique implementation and application. Additionally, the file includes a calculateFactorial function and a main method that showcases the usage of these functions. The file's functionality is designed to be modular, flexible, and efficient, making it a useful tool for developers seeking to solve common programming problems or demonstrate complex algorithms and techniques.

## Functions

| Function | Description |
|----------|-------------|
| `isPalindrome` | Determines if a given string is a palindrome, ignoring non-alphanumeric characters and case sensitivity. Args: text (String): Input string to check for palindrome. Returns: boolean: True if the input string is a palindrome, false otherwise. Note: The function considers only alphanumeric characters and is case-insensitive, meaning it treats 'A' and 'a' as the same character and ignores spaces, punctuation, and special characters. |
| `findPrimeNumbers` | Find all prime numbers up to a given limit. Args: limit (int): Upper bound for finding prime numbers. Returns: List<Integer>: List of prime numbers up to the limit. Note: This function uses a trial division method, which has a time complexity of O(n*sqrt(n)), and may not be efficient for large limits. It also only checks divisibility up to the square root of a number, taking advantage of the fact that a larger factor of the number would be a multiple of a smaller factor that has already been checked. |
| `mergeSortedLists` | Merge two sorted lists into a single sorted list. Args: list1 (List<Integer>): First sorted list of integers. list2 (List<Integer>): Second sorted list of integers. Returns: List<Integer>: A new sorted list containing all elements from both input lists. Note: This function assumes that input lists are already sorted in ascending order. If input lists are not sorted, the resulting merged list will not be sorted correctly. This function has a time complexity of O(n + m), where n and m are the sizes of the input lists, making it efficient for large inputs. However, it requires extra space to store the merged list, which can be a limitation for very large inputs. |
| `calculateAverage` | Calculate the average of a list of integers. Args: numbers (List<Integer>): List of integers to calculate average from. Returns: double: Average of the numbers in the list, or 0.0 if the list is empty. Note: This function does not handle the case where the sum of the numbers exceeds the maximum limit of an integer, which could result in an incorrect average. It also does not handle null input, which would result in a NullPointerException. |
| `reverseWords` | Reverses the order of characters in each word of a sentence while preserving word order. Args: sentence (String): Input sentence to reverse words in. Returns: String: Sentence with each word reversed. Note: This function considers punctuation as part of a word and reverses it accordingly. It also assumes that words are separated by a single space character. If the input sentence contains multiple consecutive spaces, they will be treated as a single separator. |
| `calculateFibonacci` | Generate a list of the first n Fibonacci numbers. Args: n (int): Number of Fibonacci numbers to generate. Returns: List<Long>: List of the first n Fibonacci numbers. Note: This function uses a dynamic programming approach to calculate Fibonacci numbers, which reduces computational complexity from exponential to linear. However, it may cause an OutOfMemoryError for large values of n due to the storage of the entire Fibonacci sequence. The function also does not handle cases where n is a negative integer, instead returning an empty list as per the problem definition. The use of Long data type allows the function to handle larger Fibonacci numbers, but it may still overflow for very large values of n. |
| `main` | Entry point of the application, demonstrating various mathematical and string operations. Args: args (String[]): Command line arguments, not utilized in this implementation. Returns: None: This method does not return any value, it prints results directly to the console. Notes: The method showcases five distinct calculations: factorial, palindrome check, prime number generation, average calculation, and Fibonacci sequence generation, each with its own method call. |
| `calculateFactorial` | Calculate the factorial of a non-negative integer. <pre> calculateFactorial(5);  // Returns: 120 calculateFactorial(0);  // Returns: 1 </pre> |


## Detailed Documentation

### `isPalindrome`

**Signature:**
```java
public static boolean isPalindrome(String text) {
```

**Documentation:**
Determines if a given string is a palindrome, ignoring non-alphanumeric characters and case sensitivity. Args: text (String): Input string to check for palindrome. Returns: boolean: True if the input string is a palindrome, false otherwise. Note: The function considers only alphanumeric characters and is case-insensitive, meaning it treats 'A' and 'a' as the same character and ignores spaces, punctuation, and special characters.

**Parameters:**
- `String text`

**Returns:** `boolean`

---

### `findPrimeNumbers`

**Signature:**
```java
public static List<Integer> findPrimeNumbers(int limit) {
```

**Documentation:**
Find all prime numbers up to a given limit. Args: limit (int): Upper bound for finding prime numbers. Returns: List<Integer>: List of prime numbers up to the limit. Note: This function uses a trial division method, which has a time complexity of O(n*sqrt(n)), and may not be efficient for large limits. It also only checks divisibility up to the square root of a number, taking advantage of the fact that a larger factor of the number would be a multiple of a smaller factor that has already been checked.

**Parameters:**
- `int limit`

**Returns:** `List<Integer>`

---

### `mergeSortedLists`

**Signature:**
```java
public static List<Integer> mergeSortedLists(List<Integer> list1, List<Integer> list2) {
```

**Documentation:**
Merge two sorted lists into a single sorted list. Args: list1 (List<Integer>): First sorted list of integers. list2 (List<Integer>): Second sorted list of integers. Returns: List<Integer>: A new sorted list containing all elements from both input lists. Note: This function assumes that input lists are already sorted in ascending order. If input lists are not sorted, the resulting merged list will not be sorted correctly. This function has a time complexity of O(n + m), where n and m are the sizes of the input lists, making it efficient for large inputs. However, it requires extra space to store the merged list, which can be a limitation for very large inputs.

**Parameters:**
- `List<Integer> list1`
- `List<Integer> list2`

**Returns:** `List<Integer>`

---

### `calculateAverage`

**Signature:**
```java
public static double calculateAverage(List<Integer> numbers) {
```

**Documentation:**
Calculate the average of a list of integers. Args: numbers (List<Integer>): List of integers to calculate average from. Returns: double: Average of the numbers in the list, or 0.0 if the list is empty. Note: This function does not handle the case where the sum of the numbers exceeds the maximum limit of an integer, which could result in an incorrect average. It also does not handle null input, which would result in a NullPointerException.

**Parameters:**
- `List<Integer> numbers`

**Returns:** `double`

---

### `reverseWords`

**Signature:**
```java
public static String reverseWords(String sentence) {
```

**Documentation:**
Reverses the order of characters in each word of a sentence while preserving word order. Args: sentence (String): Input sentence to reverse words in. Returns: String: Sentence with each word reversed. Note: This function considers punctuation as part of a word and reverses it accordingly. It also assumes that words are separated by a single space character. If the input sentence contains multiple consecutive spaces, they will be treated as a single separator.

**Parameters:**
- `String sentence`

**Returns:** `String`

---

### `calculateFibonacci`

**Signature:**
```java
public static List<Long> calculateFibonacci(int n) {
```

**Documentation:**
Generate a list of the first n Fibonacci numbers. Args: n (int): Number of Fibonacci numbers to generate. Returns: List<Long>: List of the first n Fibonacci numbers. Note: This function uses a dynamic programming approach to calculate Fibonacci numbers, which reduces computational complexity from exponential to linear. However, it may cause an OutOfMemoryError for large values of n due to the storage of the entire Fibonacci sequence. The function also does not handle cases where n is a negative integer, instead returning an empty list as per the problem definition. The use of Long data type allows the function to handle larger Fibonacci numbers, but it may still overflow for very large values of n.

**Parameters:**
- `int n`

**Returns:** `List<Long>`

---

### `main`

**Signature:**
```java
public static void main(String[] args) {
```

**Documentation:**
Entry point of the application, demonstrating various mathematical and string operations. Args: args (String[]): Command line arguments, not utilized in this implementation. Returns: None: This method does not return any value, it prints results directly to the console. Notes: The method showcases five distinct calculations: factorial, palindrome check, prime number generation, average calculation, and Fibonacci sequence generation, each with its own method call.

**Parameters:**
- `String[] args`

**Returns:** `void`

---

### `calculateFactorial`

**Signature:**
```java
public static long calculateFactorial(int n) {
```

**Documentation:**
Calculate the factorial of a non-negative integer. <pre> calculateFactorial(5);  // Returns: 120 calculateFactorial(0);  // Returns: 1 </pre>

**Parameters:**
- `int n`

**Returns:** `long`

---

## Usage Examples

```java
// Example usage of isPalindrome function
public class Main {
    public static void main(String[] args) {
        System.out.println(PalindromeUtil.isPalindrome("A man, a plan, a canal: Panama"));  // prints: true
        System.out.println(PalindromeUtil.isPalindrome("Hello World"));  // prints: false
        System.out.println(PalindromeUtil.isPalindrome("Was it a car or a cat I saw?"));  // prints: true
    }
}

// Example usage of findPrimeNumbers function
public class Main {
    public static void main(String[] args) {
        List<Integer> primeNumbers = PrimeNumberUtil.findPrimeNumbers(30);
        System.out.println("Prime numbers up to 30: " + primeNumbers);  
        // prints: Prime numbers up to 30: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    }
}

// Example usage of mergeSortedLists function
public class Main {
    public static void main(String[] args) {
        List<Integer> list1 = Arrays.asList(1, 3, 5, 7);
        List<Integer> list2 = Arrays.asList(2, 4, 6, 8);
        List<Integer> mergedList = SortedListMerger.mergeSortedLists(list1, list2);
        System.out.println("Merged sorted list: " + mergedList);  
        // prints: Merged sorted list: [1, 2, 3, 4, 5, 6, 7, 8]
    }
}
```

---

*Generated by CodeScribe - AI-Powered Documentation Generator*
