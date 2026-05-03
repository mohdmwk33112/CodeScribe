List<Integer> expected = Arrays.asList(2, 3, 5, 7, 11, 13, 17, 19, 23, 29);
        List<Integer> actual = Main.findPrimeNumbers(30);
        assertEquals(expected, actual);
    }

    @Test
    public void testEdgeCase() { 
        List<Integer> expected = new ArrayList<>();
        List<Integer> actual = Main.findPrimeNumbers(1);
        assertEquals(expected, actual);
    }

    @Test
    public void testErrorCase() { 
        assertThrows(IllegalArgumentException.class, () -> Main.findPrimeNumbers(Integer.MIN_VALUE));
    }  // Note: This test will fail because the function does not throw an exception for negative numbers. It simply returns an empty list. You may need to adjust this test or the function itself.