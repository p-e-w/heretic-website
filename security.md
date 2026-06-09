# Security

The Heretic Project takes security seriously. We protect ourselves from supply chain attacks
by locking dependency versions with uv, delaying updates by 7 days, and automatically monitoring
dependencies for security advisories. All code that is committed to the master branch undergoes
rigorous inspection from both human maintainers and automated systems.

We also employ cryptographic signatures to ensure that both the official releases and individual
code commits are verifiable.

## Verifying release archives

All official releases of Heretic are signed using the [Sigstore](https://www.sigstore.dev/)
infrastructure, with the signer's identity verified at signing time through GitHub authentication.
This is attested by the Fulcio Certificate Authority and stored in the Rekor Transparency Log.

You can find the signatures (`.sigstore.json` files) attached to every release on GitHub,
as well as in [multiple other places](/installation#release-archives).

To verify a signature, install [Cosign](https://docs.sigstore.dev/quickstart/quickstart-cosign/)
and run

```sh
cosign verify-blob heretic-1.3.0.zip \
  --bundle heretic-1.3.0.zip.sigstore.json \
  --certificate-identity=pew@worldwidemann.com \
  --certificate-oidc-issuer=https://github.com/login/oauth
```

Adapt the filenames as needed.

**You do not need to import a key,** because the signer's identity was verified at signing time
and the certificate issued by Fulcio guarantees this.

## Verifying maintainer commits

The maintainer of Heretic (Philipp Emanuel Weidmann) signs every commit made by him with his GPG key.
You can verify those commits as follows:

1. Download the GPG key from either [GitHub](https://github.com/p-e-w.gpg) or
   [Codeberg](https://codeberg.org/p-e-w.gpg).

2. Import the key into your keyring with `gpg --import p-e-w.gpg`.

3. You can now verify individual commits with `git verify-commit <commit-hash>`, or view signatures
   for all commits with `git log --show-signature`.
