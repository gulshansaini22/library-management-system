import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('books');
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [totalFine, setTotalFine] = useState(0);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    quantity: 1
  });

  const API_URL = 'http://localhost:8081';
  const FINE_PER_DAY = 50; // ₹50 per day

  // Load issued books from localStorage on app start
  useEffect(() => {
    const savedIssuedBooks = localStorage.getItem('issuedBooks');
    if (savedIssuedBooks) {
      const parsedBooks = JSON.parse(savedIssuedBooks);
      setIssuedBooks(parsedBooks);
    }
  }, []);

  // Save issued books to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('issuedBooks', JSON.stringify(issuedBooks));
  }, [issuedBooks]);

  // Calculate fine for a book
  const calculateFine = (dueDateStr) => {
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    if (today > dueDate) {
      const diffTime = Math.abs(today - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * FINE_PER_DAY;
    }
    return 0;
  };

  // Get days remaining or overdue
  const getDaysStatus = (dueDateStr) => {
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Update total fine whenever issuedBooks changes
  useEffect(() => {
    let fine = 0;
    issuedBooks.forEach(book => {
      fine += calculateFine(book.dueDate);
    });
    setTotalFine(fine);
  }, [issuedBooks]);

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/books/all`);
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const searchBooks = async () => {
    if (!searchTerm) {
      fetchBooks();
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/books/search?keyword=${searchTerm}`);
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const issueBook = (bookId) => {
    const book = books.find(b => b.id === bookId);
    if (book && book.available === 'true') {
      // Update book availability
      const updatedBooks = books.map(b => 
        b.id === bookId ? { ...b, available: 'false', quantity: String(parseInt(b.quantity) - 1) } : b
      );
      setBooks(updatedBooks);
      
      // Calculate due date (14 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      
      // Add to issued books
      const newIssuedBook = {
        id: Date.now(),
        bookId: bookId,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        issuedBy: user?.email || 'Unknown',
        issuedToName: user?.name || user?.email,
        issuedToEmail: user?.email,
        issueDate: new Date().toLocaleDateString(),
        dueDate: dueDate.toLocaleDateString(),
        dueDateRaw: dueDate.toISOString(),
        status: 'ISSUED',
        fine: 0
      };
      
      const updatedIssuedBooks = [...issuedBooks, newIssuedBook];
      setIssuedBooks(updatedIssuedBooks);
      
      setMessage(`✅ Successfully issued "${book.title}"! Due date: ${dueDate.toLocaleDateString()}`);
      setTimeout(() => setMessage(''), 4000);
    } else {
      setMessage('❌ Book is not available for issue');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const returnBook = (issueId) => {
    const issuedBook = issuedBooks.find(b => b.id === issueId);
    if (issuedBook) {
      const fine = calculateFine(issuedBook.dueDate);
      const daysStatus = getDaysStatus(issuedBook.dueDate);
      
      // Update book availability back to available
      const updatedBooks = books.map(b => 
        String(b.id) === String(issuedBook.bookId) ? { ...b, available: 'true', quantity: String(parseInt(b.quantity) + 1) } : b
      );
      setBooks(updatedBooks);
      
      // Remove from issued books
      const updatedIssuedBooks = issuedBooks.filter(b => b.id !== issueId);
      setIssuedBooks(updatedIssuedBooks);
      
      if (fine > 0) {
        setMessage(`✅ Returned "${issuedBook.title}"! Late by ${-daysStatus} days. Fine: ₹${fine}`);
      } else {
        setMessage(`✅ Successfully returned "${issuedBook.title}"! Thank you.`);
      }
      setTimeout(() => setMessage(''), 4000);
    } else {
      setMessage('❌ Book return failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const addBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.isbn) {
      setMessage('❌ Please fill all required fields!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/books/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        fetchBooks();
        setNewBook({ title: '', author: '', isbn: '', category: '', quantity: 1 });
      } else {
        setMessage('❌ Failed to add book: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const deleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await fetch(`${API_URL}/api/books/delete/${bookId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          setMessage(`✅ ${data.message}`);
          fetchBooks();
        } else {
          setMessage('❌ Failed to delete book');
        }
      } catch (error) {
        setMessage('Error: ' + error.message);
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(true);
        setUser(data);
        setMessage('Login successful!');
        fetchBooks();
      } else {
        setMessage('Login failed: ' + (data.message || 'Invalid credentials'));
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Registration successful! Please login.');
        setIsRegistering(false);
        setEmail('');
        setPassword('');
        setName('');
      } else {
        setMessage('Registration failed: ' + (data.message || 'Try again'));
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setBooks([]);
    setMessage('Logged out successfully');
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Login/Register Page
  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="auth-box">
          <h1> Library Management System</h1>
          <h2>{isRegistering ? 'Register' : 'Login'}</h2>
          {message && <div className="message">{message}</div>}
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            {isRegistering && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
          </form>
          
          <button className="link-btn" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
          
          <div className="demo-creds">
            <p>Demo Credentials:</p>
            <p>Admin: admin@library.com / admin123</p>
            <p>User: user@library.com / user123</p>
          </div>
        </div>
      </div>
    );
  }

  // Main Library Page
  const isAdmin = user?.role === 'ADMIN';
  const myIssuedBooks = issuedBooks.filter(book => book.issuedBy === user?.email);
  
  // Calculate my total fine
  const myTotalFine = myIssuedBooks.reduce((total, book) => total + calculateFine(book.dueDate), 0);

  return (
    <div className="container">
      <div className="header">
        <h1> Library Management System</h1>
        <div className="user-info">
          <span>👋 Welcome, {user?.name || user?.email}!</span>
          <span className="role-badge">{isAdmin ? '👑 ADMIN' : '📖 USER'}</span>
          {!isAdmin && myTotalFine > 0 && (
            <span className="fine-badge">💰 Fine: ₹{myTotalFine}</span>
          )}
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={activeTab === 'books' ? 'tab active' : 'tab'} onClick={() => setActiveTab('books')}>
          📖 Books
        </button>
        <button className={activeTab === 'issued' ? 'tab active' : 'tab'} onClick={() => setActiveTab('issued')}>
          📋 My Issued Books ({myIssuedBooks.length})
          {myTotalFine > 0 && <span className="tab-badge">₹{myTotalFine}</span>}
        </button>
        {isAdmin && (
          <button className={activeTab === 'admin' ? 'tab active' : 'tab'} onClick={() => setActiveTab('admin')}>
            👑 Admin Panel
          </button>
        )}
      </div>

      {/* Books Tab */}
      {activeTab === 'books' && (
        <div className="books-section">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
            />
            <button onClick={searchBooks}>🔍 Search</button>
            <button onClick={fetchBooks}>📚 Show All</button>
          </div>

          <h2>📖 Books Collection ({books.length} books)</h2>
          {message && <div className="message">{message}</div>}
          
          <div className="books-grid">
            {books.length === 0 ? (
              <p>No books found.</p>
            ) : (
              books.map((book) => (
                <div key={book.id} className="book-card">
                  <h3>{book.title}</h3>
                  <p><strong>✍️ Author:</strong> {book.author}</p>
                  <p><strong>🔢 ISBN:</strong> {book.isbn}</p>
                  <p><strong>📂 Category:</strong> {book.category}</p>
                  <p><strong>📚 Available Copies:</strong> {book.quantity}</p>
                  <p className={book.available === 'true' ? 'available' : 'unavailable'}>
                    {book.available === 'true' ? '✅ Available for Issue' : '❌ Currently Issued'}
                  </p>
                  <button 
                    className="issue-btn"
                    onClick={() => issueBook(book.id)}
                    disabled={book.available !== 'true'}
                  >
                    {book.available === 'true' ? '📖 Issue This Book' : 'Not Available'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* My Issued Books Tab with Fine Display */}
      {activeTab === 'issued' && (
        <div className="issued-section">
          <h2>📋 My Issued Books</h2>
          {myTotalFine > 0 && (
            <div className="fine-warning">
              ⚠️ Total Fine Accumulated: <strong>₹{myTotalFine}</strong>
            </div>
          )}
          {message && <div className="message">{message}</div>}
          
          {myIssuedBooks.length === 0 ? (
            <div className="empty-state">
              <p>📭 No books issued yet.</p>
              <p>Go to <strong>Books</strong> tab to issue a book!</p>
            </div>
          ) : (
            <div className="books-grid">
              {myIssuedBooks.map((book) => {
                const daysStatus = getDaysStatus(book.dueDate);
                const fine = calculateFine(book.dueDate);
                const isOverdue = daysStatus < 0;
                
                return (
                  <div key={book.id} className={`book-card ${isOverdue ? 'overdue-card' : ''}`}>
                    <h3>{book.title}</h3>
                    <p><strong>✍️ Author:</strong> {book.author}</p>
                    <p><strong>📅 Issue Date:</strong> {book.issueDate}</p>
                    <p><strong>⏰ Due Date:</strong> {book.dueDate}</p>
                    <p className={isOverdue ? 'overdue' : daysStatus <= 3 ? 'warning' : 'available'}>
                      {isOverdue ? (
                        `⚠️ OVERDUE by ${-daysStatus} days`
                      ) : daysStatus <= 3 ? (
                        `⚠️ Due in ${daysStatus} days`
                      ) : (
                        `✅ ${daysStatus} days remaining`
                      )}
                    </p>
                    {fine > 0 && (
                      <p className="fine-amount">💰 Late Fine: ₹{fine}</p>
                    )}
                    <button className="return-btn" onClick={() => returnBook(book.id)}>
                      ↩️ Return Book
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Admin Panel */}
      {activeTab === 'admin' && isAdmin && (
        <div className="admin-section">
          <h2>👑 Admin Control Panel</h2>
          
          <div className="admin-card" style={{marginBottom: '20px', background: '#e3f2fd'}}>
            <h3>📊 System Status</h3>
            <p><strong>Total Issued Books:</strong> {issuedBooks.length}</p>
            <p><strong>Total Fines Collected:</strong> ₹{issuedBooks.reduce((total, book) => total + calculateFine(book.dueDate), 0)}</p>
          </div>
          
          <div className="admin-actions">
            <div className="admin-card">
              <h3>➕ Add New Book</h3>
              <input 
                type="text" 
                placeholder="Book Title *" 
                value={newBook.title}
                onChange={(e) => setNewBook({...newBook, title: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Author Name *" 
                value={newBook.author}
                onChange={(e) => setNewBook({...newBook, author: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="ISBN Number *" 
                value={newBook.isbn}
                onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Category" 
                value={newBook.category}
                onChange={(e) => setNewBook({...newBook, category: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="Quantity" 
                value={newBook.quantity}
                onChange={(e) => setNewBook({...newBook, quantity: parseInt(e.target.value)})}
              />
              <button onClick={addBook}>📚 Add Book to Library</button>
            </div>
            
            <div className="admin-card">
              <h3>📊 Currently Issued Books ({issuedBooks.length})</h3>
              {issuedBooks.length === 0 ? (
                <p>❌ No books currently issued.</p>
              ) : (
                issuedBooks.map((book) => {
                  const fine = calculateFine(book.dueDate);
                  return (
                    <div key={book.id} style={{borderTop: '1px solid #ddd', marginTop: '10px', paddingTop: '10px'}}>
                      <p><strong>📖 {book.title}</strong></p>
                      <p>👤 Issued to: {book.issuedToName}</p>
                      <p>📅 Due Date: {book.dueDate}</p>
                      {fine > 0 && <p className="fine-amount">💰 Fine: ₹{fine}</p>}
                      <button className="return-btn" style={{marginTop: '5px', padding: '5px 10px'}} onClick={() => returnBook(book.id)}>
                        ↩️ Return Book
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="admin-card">
              <h3>📊 Library Statistics</h3>
              <p><strong>📚 Total Books:</strong> {books.length}</p>
              <p><strong>✅ Available Books:</strong> {books.filter(b => b.available === 'true').length}</p>
              <p><strong>❌ Currently Issued:</strong> {issuedBooks.length}</p>
              <p><strong>💰 Total Fines:</strong> ₹{issuedBooks.reduce((total, book) => total + calculateFine(book.dueDate), 0)}</p>
            </div>
          </div>
          
          <h3>📚 All Books in System ({books.length} total)</h3>
          <div className="books-grid">
            {books.map((book) => (
              <div key={book.id} className="book-card admin-book">
                <h4>{book.title}</h4>
                <p>✍️ {book.author}</p>
                <p>📚 Quantity: {book.quantity}</p>
                <p>Status: {book.available === 'true' ? '🟢 Available' : '🔴 Issued'}</p>
                <div className="admin-buttons">
                  <button className="edit-btn">✏️ Edit</button>
                  <button className="delete-btn" onClick={() => deleteBook(book.id)}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;