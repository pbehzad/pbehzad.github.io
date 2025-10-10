import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="space-y-10 text-center w-full">
      <h2 className="text-3xl font-light mb-8 opacity-90">Contact</h2>
      <div className="space-y-8 text-lg max-w-3xl mx-auto">
        <div className="space-y-6">
          <div className="opacity-80 font-light">
            <span className="opacity-60">Email: </span>
            <span>your.email@domain.com</span>
          </div>
          <div className="opacity-80 font-light">
            <span className="opacity-60">GitHub: </span>
            <span>github.com/yourusername</span>
          </div>
          <div className="opacity-80 font-light">
            <span className="opacity-60">Portfolio: </span>
            <span>parhambehzad.com</span>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/20 text-base opacity-70 space-y-4">
          <p>Available for commissions, collaborations, and consultation.</p>
          <p>Response time: Usually within 24-48 hours.</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;