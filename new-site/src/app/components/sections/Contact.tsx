import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="space-y-8 w-full text-center">

      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight border-b-4 border-white pb-2 inline-block">
          CONTACT
        </h2>
      </div>

      {/* Content - Ultra Minimal */}
      <div className="space-y-6 max-w-2xl mx-auto">

        <div className="border-2 border-white p-6 hover:bg-white hover:text-black transition-all duration-100">
          <div className="text-xs font-black uppercase mb-2">EMAIL</div>
          <div className="text-sm font-bold break-all">
            YOUR.EMAIL@DOMAIN.COM
          </div>
        </div>

        <div className="border-2 border-white p-6 hover:bg-white hover:text-black transition-all duration-100">
          <div className="text-xs font-black uppercase mb-2">GITHUB</div>
          <div className="text-sm font-bold break-all">
            GITHUB.COM/YOURUSERNAME
          </div>
        </div>

        <div className="border-2 border-white p-6 hover:bg-white hover:text-black transition-all duration-100">
          <div className="text-xs font-black uppercase mb-2">WEBSITE</div>
          <div className="text-sm font-bold break-all">
            PARHAMBEHZAD.COM
          </div>
        </div>

        <div className="w-16 h-1 bg-white mx-auto mt-8" />

        <div className="text-xs font-bold uppercase opacity-70">
          AVAILABLE FOR COMMISSIONS & COLLABORATIONS
        </div>

      </div>

    </div>
  );
};

export default Contact;
