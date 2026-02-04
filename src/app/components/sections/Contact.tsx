'use client';

import React from 'react';
import { useContact } from '@/services/hooks/useContent';

const Contact: React.FC = () => {
  const { contact, loading, error } = useContact();

  if (loading) {
    return (
      <div className="w-full pt-8">
        <div className="text-sm font-normal uppercase opacity-40">loading...</div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="w-full pt-8">
        <div className="text-sm font-normal uppercase opacity-40">error loading contact</div>
      </div>
    );
  }

  return (
    <div className="w-full">

      <div className="sticky top-0 z-10 bg-black h-[15vh] md:h-[25vh] flex items-end">
        <h1 className="text-3xl md:text-6xl font-bold uppercase tracking-tight">
          Contact
        </h1>
      </div>

      <div className="flex flex-col gap-8 pt-8 md:pt-12 pl-4 md:pl-32">
        <div>
          <span className="text-xs font-normal uppercase opacity-40">email</span>
          <div className="text-sm font-normal mt-1">{contact.email}</div>
        </div>

        {contact.github && (
          <div>
            <span className="text-xs font-normal uppercase opacity-40">github</span>
            <div className="text-sm font-normal mt-1">{contact.github}</div>
          </div>
        )}

        {contact.website && (
          <div>
            <span className="text-xs font-normal uppercase opacity-40">website</span>
            <div className="text-sm font-normal mt-1">{contact.website}</div>
          </div>
        )}

        <div className="mt-8">
          <span className="text-xs font-normal opacity-30">{contact.availability_status}</span>
        </div>
      </div>

    </div>
  );
};

export default Contact;
