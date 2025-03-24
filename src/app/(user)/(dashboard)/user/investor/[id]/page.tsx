import React from 'react';
import ClientPage from './client-page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <ClientPage id={id} />
    </div>
  );
}
