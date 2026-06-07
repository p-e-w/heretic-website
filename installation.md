---
outline: deep
---


# Installation

There are many sources you can install Heretic from. This is a conscious design feature of
the Heretic project infrastructure, intended to make the project resilient against disruptions
and to ensure Heretic is always available to anyone who wants to install it.

## PyPI

Prepare a Python 3.10+ environment with PyTorch 2.2+ installed as appropriate for your hardware.
Then run:

```sh
pip install -U heretic-llm
```

This will install the latest stable release of Heretic.

> [!IMPORTANT]
>
> While PyTorch 2.2 is the minimum version of PyTorch needed for Heretic to work,
> some models and configurations might require features only found in
> later versions. For example, loading MXFP4-quantized models like gpt-oss
> uses `torch.accelerator`, which was added in PyTorch 2.6.

## Git

Installing Heretic from Git ensures that you get the latest features and model compatibility
updates, though there may sometimes be regressions compared to the stable release.

### GitHub

```sh
pip install git+https://github.com/p-e-w/heretic.git
```

The Heretic GitHub repository has also been archived by Software Heritage:
[![Software Heritage](https://archive.softwareheritage.org/badge/origin/https://github.com/p-e-w/heretic/)](https://archive.softwareheritage.org/browse/origin/?origin_url=https://github.com/p-e-w/heretic)

### Codeberg

If for some reason you are unable to install from GitHub, you can use the
[official Codeberg mirror](https://codeberg.org/p-e-w/heretic) instead:

```sh
pip install git+https://codeberg.org/p-e-w/heretic.git
```

The Heretic Codeberg repository has also been archived by Software Heritage:
[![Software Heritage](https://archive.softwareheritage.org/badge/origin/https://codeberg.org/p-e-w/heretic/)](https://archive.softwareheritage.org/browse/origin/?origin_url=https://codeberg.org/p-e-w/heretic)

## Release archives

The official Heretic release archives are available through various channels.
You can install Heretic from such an archive by extracting the contents to a folder,
then running

```sh
pip install .
```

from that folder.

> [!TIP]
>
> All release archives are cryptographically signed and easily verifiable.
> See [Security](/security) for more information and verification instructions.

### GitHub

Every official release on the [releases page on GitHub](https://github.com/p-e-w/heretic/releases)
comes with an attached release archive and signature file.

### Internet Archive

All Heretic releases to date have been
[uploaded to the Internet Archive](https://archive.org/search?query=creator%3A%22p-e-w+%28Philipp+Emanuel+Weidmann%29%22).

### IPFS

All Heretic releases and their signatures are available over [IPFS](https://ipfs.tech/),
enabling decentralized retrieval. The CIDs are:

| Filename                            | CID                                                           |
| ----------------------------------- | ------------------------------------------------------------- |
| **heretic-1.3.0.zip**               | `bafybeianhsrnlkxdf5btyvgsaahqkhurmrowkuk4ymddz37wcnxz7gjxoe` |
| **heretic-1.3.0.zip.sigstore.json** | `bafkreiflkjpyazath4n4lhoi67rvgds4k3spcsqjloeby4uj2cs232s6ui` |
| **heretic-1.2.0.zip**               | `bafybeifxnfy6tkakofe5ktlmeayk6edhja6neuv37bldimiq76dncicqqa` |
| **heretic-1.2.0.zip.sigstore.json** | `bafkreiaz64yklnigwrgq63ibt5udpaupe3blqposfjdzkcytdf2whrly6q` |
| **heretic-1.1.0.zip**               | `bafkreibf3anxagvlhuvlsbbix5apc2jf2azz76lhuh27dyuzvc6ptiseka` |
| **heretic-1.1.0.zip.sigstore.json** | `bafkreiapgtrl6qyybalmswzfz7dm2a7a4svsjs2sg5svm2orua5druafty` |
| **heretic-1.0.1.zip**               | `bafkreiag3mlkc76bhwcudhm7osqxdhmvywmc4kncdbc5ajtnd7tih4ftem` |
| **heretic-1.0.1.zip.sigstore.json** | `bafkreibmtnfu2mtri3jcpewod3b2xj25xlo6xo4gyp7t3jyw5ttwmwubae` |

Please pin those files if you happen to run an IPFS node,
to help keep them available for everyone!
