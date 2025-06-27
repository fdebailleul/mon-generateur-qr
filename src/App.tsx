import React from 'react';
import './App.css';
import QRCodeGenerator from './components/QRCodeGenerator';

function App() {
  return (
    <>
      <header>
        <div className="logo">QRGen</div>
        <nav>
          <a href="/product">Product</a>
          <a href="/resources">Resources</a>
          <a href="/support">Support</a>
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
        </nav>
        <div className="auth">
          <a href="/signin" className="signin">Sign in</a>
          <a href="/signup" className="signup">Sign up</a>
        </div>
      </header>

      <main>
        <QRCodeGenerator />
      </main>

      <footer>
        <a href="/help">Help Center</a> &bull;{' '}
        <a href="/privacy">Privacy</a> &bull;{' '}
        <a href="/terms">Terms</a>
        <div>&copy; QRGen Co.</div>
      </footer>
    </>
  );
}

export default App;
