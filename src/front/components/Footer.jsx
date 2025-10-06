export default function Footer() {
  return (
    <footer className="bg-light border-top py-3 mt-4">
      <div className="container text-center text-muted small">
        © {new Date().getFullYear()} Konoha Restaurant · 🍣🍥
      </div>
    </footer>
  );
}