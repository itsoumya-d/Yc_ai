export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
