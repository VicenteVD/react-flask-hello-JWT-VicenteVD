export default function Home() {
  return (
    <section className="py-4">
      <div className="p-5 mb-4 bg-light rounded-3">
        <div className="container py-5">
          <h1 className="display-5 fw-bold">Bienvenido a Konoha</h1>
          <p className="col-md-8 fs-5">
            Ramen, onigiri y dango como en la aldea oculta entre las hojas.
          </p>
          <a href="/menu" className="btn btn-primary btn-lg">Ver la carta</a>
        </div>
      </div>
    </section>
  );
}
