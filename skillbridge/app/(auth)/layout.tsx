export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-sky-100 to-teal-100">
      <div className="w-full max-w-md px-4 py-8">
        {children}
      </div>
    </div>
  );
}
