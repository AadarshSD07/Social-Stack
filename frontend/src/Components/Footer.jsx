import React from "react";

export default function Footer() {
  return (
    <footer className="app-footer shadow-top shrink-0">
      <div className="footer-top">
        {/* Left */}
        <div className="footer-brand">
          <h4>Social Stack</h4>
          <p>A full-stack social platform demo</p>
        </div>

        {/* Center */}
        <div className="footer-tech">
          <span>React</span>
          <span>·</span>
          <span>Django</span>
          <span>·</span>
          <span>PostgreSQL</span>
          <span>·</span>
          <span>Docker</span>
        </div>

        {/* Right */}
        <div className="footer-links">
          <a
            href="https://github.com/AadarshSD07/Social-Stack"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Source
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        © 2025 Aadarsh
      </div>
    </footer>
  );
}