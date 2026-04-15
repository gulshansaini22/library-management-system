package com.library.backend.service;

import com.library.backend.entity.Book;
import com.library.backend.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {
    
    @Autowired
    private BookRepository bookRepository;
    
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
    
    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }
    
    public List<Book> searchBooks(String keyword) {
        return bookRepository.findByTitleContainingOrAuthorContaining(keyword, keyword);
    }
    
    public Book addBook(Book book) {
        return bookRepository.save(book);
    }
    
    public Book updateBook(Long id, Book bookDetails) {
        Book book = bookRepository.findById(id).orElseThrow();
        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setIsbn(bookDetails.getIsbn());
        book.setQuantity(bookDetails.getQuantity());
        book.setPublisher(bookDetails.getPublisher());
        book.setPublicationYear(bookDetails.getPublicationYear());
        book.setCategory(bookDetails.getCategory());
        return bookRepository.save(book);
    }
    
    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }
    
    public boolean updateAvailableQuantity(Long bookId, int change) {
        Book book = bookRepository.findById(bookId).orElse(null);
        if (book != null) {
            int newQuantity = book.getAvailableQuantity() + change;
            if (newQuantity >= 0 && newQuantity <= book.getQuantity()) {
                book.setAvailableQuantity(newQuantity);
                bookRepository.save(book);
                return true;
            }
        }
        return false;
    }
}
