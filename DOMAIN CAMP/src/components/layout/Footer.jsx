import React from 'react';
import { Film, Github, Twitter, Instagram, Heart } from 'lucide-react';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <Film className="logo-icon" />
            <span className="logo-text text-gradient">CineVerse</span>
          </div>
          <p className="footer-tagline">Your ultimate portal to the universe of cinema.</p>
        </div>

        <div className="footer-links-group">
          <div className="footer-links-col">
            <h4>Explore</h4>
            <a href="/">Discover</a>
            <a href="/search">Search</a>
            <a href="/watchlist">Watchlist</a>
          </div>
          <div className="footer-links-col">
            <h4>Legals</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">API Terms</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p className="copyright">&copy; {new Date().getFullYear()} CineVerse. Powered by TMDB API. All rights reserved.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="https://github.com/MananXchoudhary/CineVerse" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18} /></a>
          </div>
          <p className="dev-credit">
            Made with <Heart className="heart-icon" size={12} /> for FSD Domain Camp
          </p>
        </div>
      </div>
    </footer>
  );
};
