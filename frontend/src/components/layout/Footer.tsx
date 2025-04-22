export function Footer() {
  return (
    <footer className="bg-blue-950 border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center">
          <p className="text-sm text-yellow-500">
            © {new Date().getFullYear()} URL Shortener. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
