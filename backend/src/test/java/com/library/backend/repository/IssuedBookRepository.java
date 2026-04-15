package com.library.backend.repository;

import com.library.backend.entity.IssuedBook;
import com.library.backend.entity.User;
import com.library.backend.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IssuedBookRepository extends JpaRepository<IssuedBook, Long> {
    List<IssuedBook> findByUser(User user);
    List<IssuedBook> findByBook(Book book);
    List<IssuedBook> findByStatus(String status);
    boolean existsByUserAndBookAndStatus(User user, Book book, String status);
}