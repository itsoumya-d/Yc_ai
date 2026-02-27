export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-violet-700 to-violet-900">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
