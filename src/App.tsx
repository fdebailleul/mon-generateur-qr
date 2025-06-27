import React from 'react';
import './App.css';
import QRCodeGenerator from './components/QRCodeGenerator';

function App() {
  return (
    <>
      <header>
        <div className="logo">QRGen</div>
        <nav>
          <a href="#">Product</a>
          <a href="#">Resources</a>
          <a href="#">Support</a>
          <a href="#">About</a>
          <a href="#">Blog</a>
        </nav>
        <div className="auth">
          <a href="#" className="signin">Sign in</a>
          <a href="#" className="signup">Sign up</a>
        </div>
      </header>

      <main>
        <QRCodeGenerator />
      </main>

      <footer>
        <a href="#">Help Center</a> &bull;{' '}
        <a href="#">Privacy</a> &bull;{' '}
        <a href="#">Terms</a>
        <div>&copy; QRGen Co.</div>
      </footer>
    </>
  );
}

export default App;
