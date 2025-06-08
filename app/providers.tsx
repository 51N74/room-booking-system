// context/Providers.tsx (หรือ app/providers.tsx)
'use client'; // <-- สำคัญมาก! ประกาศว่าเป็น Client Component

import { AuthProvider } from '../context/AuthContext'; // ตรวจสอบ path ให้ถูกต้อง
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" />
    </AuthProvider>
  );
}