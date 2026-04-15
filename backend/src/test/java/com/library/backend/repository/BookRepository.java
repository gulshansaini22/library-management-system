package com.library.backend.repository;

import com.library.backend.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitleContainingOrAuthorContaining(String title, String author);
    List<Book> findByTitleContaining(String title);
    List<Book> findByAuthorContaining(String author);
    boolean existsByIsbn(String isbn);
}