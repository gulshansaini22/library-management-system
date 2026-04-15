package com.library.backend.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "issued_books")
public class IssuedBook {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;
    
    @Column(name = "issue_date", nullable = false)
    private Date issueDate = new Date();
    
    @Column(name = "due_date", nullable = false)
    private Date dueDate;
    
    @Column(name = "return_date")
    private Date returnDate;
    
    @Column(name = "status")
    private String status = "ISSUED"; // "ISSUED", "RETURNED", "OVERDUE"
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }
    
    public Date getIssueDate() { return issueDate; }
    public void setIssueDate(Date issueDate) { this.issueDate = issueDate; }
    
    public Date getDueDate() { return dueDate; }
    public void setDueDate(Date dueDate) { this.dueDate = dueDate; }
    
    public Date getReturnDate() { return returnDate; }
    public void setReturnDate(Date returnDate) { this.returnDate = returnDate; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}