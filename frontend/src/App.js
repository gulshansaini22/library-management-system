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

  const API_URL = 'http://localhost:8081';

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
      const updatedBooks = books.map(b => 
        b.id === bookId ? { ...b, available: 'false', quantity: parseInt(b.quantity) - 1 } : b
      );
      setBooks(updatedBooks);
      setMessage(`✅ Successfully issued "${book.title}"! Please return by due date.`);
      
      const newIssuedBook = {
        id: Date.now(),
        bookId: bookId,
        title: book.title,
        issueDate: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'ISSUED'
      };
      setIssuedBooks([...issuedBooks, newIssuedBook]);
      
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('❌ Book is not available for issue');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const returnBook = (bookId) => {
    const issuedBook = issuedBooks.find(b => b.id === bookId);
    if (issuedBook) {
      const updatedBooks = books.map(b => 
        b.id == issuedBook.bookId ? { ...b, available: 'true', quantity: parseInt(b.quantity) + 1 } : b
      );
      setBooks(updatedBooks);
      setIssuedBooks(issuedBooks.filter(b => b.id !== bookId));
      setMessage(`✅ Successfully returned "${issuedBook.title}"! Thank you.`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('❌ Book return failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const addBook = () => {
    setMessage('Add book feature - Coming soon!');
    setTimeout(() => setMessage(''), 3000);
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
    setIssuedBooks([]);
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
          <h1>📚 Library Management System</h1>
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
  
  return (
    <div className="container">
      <div className="header">
        <h1>📚 Library Management System</h1>
        <div className="user-info">
          <span>👋 Welcome, {user?.name || user?.email}!</span>
          <span className="role-badge">{isAdmin ? '👑 ADMIN' : '📖 USER'}</span>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={activeTab === 'books' ? 'tab active' : 'tab'} onClick={() => setActiveTab('books')}>
          📖 Books
        </button>
        <button className={activeTab === 'issued' ? 'tab active' : 'tab'} onClick={() => setActiveTab('issued')}>
          📋 My Issued Books
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

      {/* Issued Books Tab */}
      {activeTab === 'issued' && (
        <div className="issued-section">
          <h2>📋 My Issued Books</h2>
          {message && <div className="message">{message}</div>}
          
          {issuedBooks.length === 0 ? (
            <div className="empty-state">
              <p>📭 No books issued yet.</p>
              <p>Go to <strong>Books</strong> tab to issue a book!</p>
            </div>
          ) : (
            <div className="books-grid">
              {issuedBooks.map((book) => (
                <div key={book.id} className="book-card">
                  <h3>{book.title}</h3>
                  <p><strong>📅 Issue Date:</strong> {book.issueDate}</p>
                  <p><strong>⏰ Due Date:</strong> {book.dueDate}</p>
                  <p><strong>Status:</strong> <span className="available">Currently Issued</span></p>
                  <button className="return-btn" onClick={() => returnBook(book.id)}>
                    ↩️ Return Book
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Panel - Only for Admin */}
      {activeTab === 'admin' && isAdmin && (
        <div className="admin-section">
          <h2>👑 Admin Control Panel</h2>
          
          <div className="admin-actions">
            <div className="admin-card">
              <h3>➕ Add New Book</h3>
              <input type="text" placeholder="Book Title" />
              <input type="text" placeholder="Author Name" />
              <input type="text" placeholder="ISBN Number" />
              <input type="text" placeholder="Category" />
              <input type="number" placeholder="Quantity" />
              <button onClick={addBook}>📚 Add Book to Library</button>
            </div>
            
            <div className="admin-card">
              <h3>👥 Manage Users</h3>
              <button>📋 View All Registered Users</button>
              <button>🚫 Suspend User Account</button>
              <button>👑 Make Admin</button>
              <button>🗑️ Delete User</button>
            </div>
            
            <div className="admin-card">
              <h3>📊 Library Reports</h3>
              <button>📖 Currently Issued Books</button>
              <button>⏰ Overdue Books Report</button>
              <button>📈 Most Popular Books</button>
              <button>📉 Low Stock Alert</button>
            </div>
          </div>
          
          <h3>📚 All Books in System ({books.length} total)</h3>
          <div className="books-grid">
            {books.map((book) => (
              <div key={book.id} className="book-card admin-book">
                <h4>{book.title}</h4>
                <p>✍️ {book.author}</p>
                <p>📚 Quantity: {book.quantity}</p>
                <p>✅ Available: {book.quantity}</p>
                <div className="admin-buttons">
                  <button className="edit-btn">✏️ Edit Book</button>
                  <button className="delete-btn">🗑️ Delete Book</button>
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