package com.library.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "http://localhost:3000")
public class BookController {
    
    @GetMapping("/all")
    public Map<String, Object> getAllBooks() {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, String>> books = new ArrayList<>();
        
        Map<String, String> book1 = new HashMap<>();
        book1.put("id", "1");
        book1.put("title", "The Great Gatsby");
        book1.put("author", "F. Scott Fitzgerald");
        book1.put("isbn", "978-0-7432-7356-5");
        book1.put("available", "true");
        
        Map<String, String> book2 = new HashMap<>();
        book2.put("id", "2");
        book2.put("title", "To Kill a Mockingbird");
        book2.put("author", "Harper Lee");
        book2.put("isbn", "978-0-06-112008-4");
        book2.put("available", "true");
        
        Map<String, String> book3 = new HashMap<>();
        book3.put("id", "3");
        book3.put("title", "1984");
        book3.put("author", "George Orwell");
        book3.put("isbn", "978-0-452-28423-4");
        book3.put("available", "false");
        
        books.add(book1);
        books.add(book2);
        books.add(book3);
        
        response.put("books", books);
        response.put("message", "Books fetched successfully");
        return response;
    }
    
    @GetMapping("/search")
    public Map<String, Object> searchBooks(@RequestParam String keyword) {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, String>> books = new ArrayList<>();
        
        if (keyword.toLowerCase().contains("gatsby") || keyword.toLowerCase().contains("fitzgerald")) {
            Map<String, String> book = new HashMap<>();
            book.put("id", "1");
            book.put("title", "The Great Gatsby");
            book.put("author", "F. Scott Fitzgerald");
            book.put("isbn", "978-0-7432-7356-5");
            book.put("available", "true");
            books.add(book);
        }
        
        response.put("books", books);
        response.put("message", "Search completed");
        return response;
    }
}