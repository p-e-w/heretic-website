---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  text: Take control of the most important technology of our time
  tagline: Heretic removes restrictions from language models, making sure they always follow your instructions
  image:
    src: /logo.png
    alt: Heretic logo
  actions:
    - theme: alt github
      text: GitHub
      link: https://github.com/p-e-w/heretic
    - theme: alt huggingface
      text: Hugging Face
      link: https://huggingface.co/heretic-org
    - theme: alt discord
      text: Discord
      link: https://discord.gg/gdXc48gSyT
    - theme: alt matrix
      text: Matrix
      link: https://matrix.to/#/#heretic:matrix.org
---


### Get started in minutes (Python 3.10+):

```sh
pip install -U heretic-llm
heretic Qwen/Qwen3-4B-Instruct-2507
```


Heretic supports most dense models, and many MoE and hybrid architectures.
It implements
traditional **directional ablation** ([Arditi et al. 2024](https://arxiv.org/abs/2406.11717)),
**projected abliteration** ([Lai 2025/1](https://huggingface.co/blog/grimjim/projected-abliteration))
and **MPOA** ([Lai 2025/2](https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration)),
as well as the experimental
**SOMA** ([Piras et al. 2025](https://arxiv.org/abs/2511.08379v2))
and **ARA** ([Weidmann 2026](https://github.com/p-e-w/heretic/pull/211))
methods.
Heretic has a built-in chat function for testing, a benchmark runner, Hugging Face integration, and much more.

<span style="color: #f68f0b;">**Heretic is widely used in industry and science for mission-critical applications where AI refusals create an unacceptable risk.**</span>
It has been used in multiple research papers spanning a variety of fields.
Processing a language model with Heretic can improve model intelligence and produce more reliable responses,
as demonstrated on the [UGI Leaderboard](https://huggingface.co/spaces/DontPlanToEnd/UGI-Leaderboard).
