'use client';

import React from 'react';
import { useContact } from '@/services/hooks/useContent';

const Contact: React.FC = () => {
  const { contact, loading, error } = useContact();

  if (loading) {
    return (
      <div className="space-y-8 w-full text-center">
        <div className="text-sm font-bold uppercase opacity-70">LOADING...</div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="space-y-8 w-full text-center">
        <div className="text-sm font-bold uppercase text-red-500">ERROR LOADING CONTACT</div>
      </div>
    );
  }

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
            {contact.email}
          </div>
        </div>

        {contact.github && (
          <div className="border-2 border-white p-6 hover:bg-white hover:text-black transition-all duration-100">
            <div className="text-xs font-black uppercase mb-2">GITHUB</div>
            <div className="text-sm font-bold break-all">
              {contact.github}
            </div>
          </div>
        )}

        {contact.website && (
          <div className="border-2 border-white p-6 hover:bg-white hover:text-black transition-all duration-100">
            <div className="text-xs font-black uppercase mb-2">WEBSITE</div>
            <div className="text-sm font-bold break-all">
              {contact.website}
            </div>
          </div>
        )}

        <div className="w-16 h-1 bg-white mx-auto mt-8" />

        <div className="text-xs font-bold uppercase opacity-70">
          {contact.availability_status}
        </div>

      </div>

    </div>
  );
};

export default Contact;
