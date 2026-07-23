export const metadata = { title: "Licensing" };

export default function Page() {
  return (
    <article className="narrow-shell prose-page">
      <div className="section-kicker">Text and image use</div>
      <h1>Licensing</h1>
      <p>
        Each translation on the archive carries its own copyright or license status. The
        details shown on an edition page apply to that edition only.
      </p>

      <h2>Public-domain editions</h2>
      <p>
        Bellows, Thorpe, Bray, and the original 1928 Hollander edition are presented from
        public-domain publications where the archive has a traceable text source.
      </p>

      <h2>Edward Pettit</h2>
      <p>
        Edward Pettit’s dual-language edition is shared under CC BY-NC 4.0. It requires
        attribution and may not be used here for commercial purposes without additional
        permission.
      </p>

      <h2>Modern copyrighted translations</h2>
      <p>
        A modern edition may be listed for reference without its full text being reproduced.
        Full translations are not added unless permission or a license allows it.
      </p>

      <h2>Quote cards</h2>
      <p>
        Quote cards keep the translator, stanza number, edition, and any required license
        notice attached to the quotation. Required credit cannot be removed.
      </p>
    </article>
  );
}
