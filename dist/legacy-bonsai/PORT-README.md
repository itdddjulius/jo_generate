# Bonsai Studio
Open dist/index.html in a modern browser. Choose a seed and branching density, grow the tree, then download a PNG. The same settings reproduce the same tree.
## Upstream and changes
John Allbritten’s cbonsai generates configurable bonsai in a C and ncurses terminal. Its upstream README covers package installation, source builds, and static or animated growth. See UPSTREAM-README.md or https://gitlab.com/jallbrit/cbonsai.
Bonsai Studio adapts the movement distributions in cbonsai.c for trunks, left and right shoots, and foliage. Browser rendering uses Canvas, a seeded generator and a bounded branch model. Seeds are specific to this edition. The adapted source is in dist/index.html and is released under GPL-3.0-or-later. See LICENSE.
