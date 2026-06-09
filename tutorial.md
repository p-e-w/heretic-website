---
outline: deep
---


# Tutorial

Welcome, friend! With Heretic, you can remove restrictions from language models,
or modify them in other interesting ways.

That's right, *you!*

You don't need to be a software engineer, you don't need a machine learning PhD,
you don't need to understand the intricacies of how language models work internally,
and you don't need expensive hardware.

## Prerequisites

Here's what you do need:

* **A GPU.** Both Nvidia and AMD GPUs are well supported by Heretic. While Heretic
  also supports processing language models in CPU-only mode, this is orders of magnitude
  slower than accelerated processing, and should only be attempted with tiny models.
  You will also need to install the CUDA Toolkit if you have an Nvidia GPU, and ROCm
  if you have an AMD GPU.

* **Sufficient VRAM.** Make sure that your GPU is a match for the model you want to
  process. As a rule of thumb, you need about 2.5 GB of VRAM per billion model parameters.
  So to process a model like [Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B) (which
  has 4 billion parameters), you need about 10 GB of VRAM.

* **Python.** If you run Linux, Python is almost always preinstalled, but on other
  platforms, you may have to [download](https://www.python.org/) and install it manually.
  Heretic requires Python 3.10 or later.

## Set up a Python virtual environment

We strongly recommend installing Heretic (and any other Python application) into its own
virtual environment, which you can set up with

```sh
python -m venv venv
source venv/bin/activate
```

## Install PyTorch

> [!TIP]
>
> If you are using a cloud computing platform,
> the appropriate version of PyTorch is often already preinstalled.

Heretic uses PyTorch to accelerate mathematical operations. Unlike all other dependencies
of Heretic, PyTorch must be installed manually because the correct installation command
depends on your GPU and accelerator library.

You can find full installation instructions
[on the PyTorch website](https://pytorch.org/get-started/locally/). In most cases, if you
have an Nvidia GPU, you will run

```sh
pip install torch torchvision
```

and if you have an AMD GPU, you will run

```sh
pip install torch torchvision --index-url https://download.pytorch.org/whl/rocm7.2
```

but it's a good idea to check the page linked above for the specific instructions for
your setup.

## Install Heretic

There are [many ways](/installation) to download and install Heretic.
Most users will want to run

```sh
pip install -U heretic-llm
```

and be done with it.

## Run Heretic

Pick a language model [on Hugging Face](https://huggingface.co/models?library=transformers)
and copy its model ID (the part of its URL after `https://huggingface.co/`). Then run

```sh
heretic Qwen/Qwen3.5-4B
```

Replace `Qwen/Qwen3.5-4B` with the model ID you copied above.

That's it! The process is fully automatic and will prompt you when you need to make
a decision. Heretic does not require configuration, although
[many configuration parameters](/configuration) are available, allowing you to control
almost every aspect of Heretic's operation.

Let's walk through what happens when Heretic processes a model:

### Startup

At the start of the program, Heretic identifies the GPU(s) available.
As you can see, even with a modest GPU (an RTX 3060 in this case) it's already
possible to process small models (4B in this case).

> [!TIP]
>
> Heretic supports loading models with 4-bit quantization using bitsandbytes,
> which can reduce the amount of VRAM required by about 70%.
> See the [`quantization`](/configuration#quantization) setting for details.

```
█░█░█▀▀░█▀▄░█▀▀░▀█▀░█░█▀▀  v1.3.0
█▀█░█▀▀░█▀▄░█▀▀░░█░░█░█░░
▀░▀░▀▀▀░▀░▀░▀▀▀░░▀░░▀░▀▀▀  https://github.com/p-e-w/heretic

Detected 1 CUDA device(s) (11.63 GB total VRAM)
CUDA Version: 12.8
Driver Version: 580.159.03
* CUDA 0: NVIDIA GeForce RTX 3060 (11.63 GB)
```

### Model loading

Heretic now loads the requested model (downloading it from Hugging Face unless it is
already cached), analyzes its architecture, and displays the amount of memory it occupies.

```
Loading model Qwen/Qwen3.5-4B...
* Trying dtype auto...
* LoRA adapters initialized (target types: down_proj, o_proj, out_proj)
* Transformer model with 32 layers
* Abliterable components:
  * attn.o_proj: 32 modules total
  * mlp.down_proj: 32 modules total

Resident system RAM: 1.83 GB
Allocated GPU VRAM: 8.47 GB
Reserved GPU VRAM: 8.52 GB
```

### Prompt loading

The prompt datasets used for calculating refusal directions are now being loaded.

```
Loading good prompts from mlabonne/harmless_alpaca...
* 400 prompts loaded

Loading bad prompts from mlabonne/harmful_behaviors...
* 400 prompts loaded
```

### Automatic batch size determination

Heretic does inference on prompts in batches, which dramatically speeds up processing.
This step determines the largest batch size your system can support, in order to maximize
processing speed.

```
Determining optimal batch size...
* Trying batch size 1... Ok (25 tokens/s)
* Trying batch size 2... Ok (44 tokens/s)
* Trying batch size 4... Ok (78 tokens/s)
* Trying batch size 8... Ok (122 tokens/s)
* Trying batch size 16... Ok (178 tokens/s)
* Trying batch size 32... Ok (225 tokens/s)
* Trying batch size 64... Failed (CUDA out of memory)
* Chosen batch size: 32
```

### Automatic response prefix determination

Reasoning models often start their responses with a thinking block (such as `<think>...</think>`).
Skipping the tokens in this block improves accuracy when calculating refusal directions, and
Heretic automatically tests for such prefixes in order to do this.

In this case, no prefix is found.

```
Checking for common response prefix...
* None found
```

### Evaluation prompt loading

The prompt datasets used for evaluating model performance are now being loaded,
and an initial evaluation is performed.

```
Loading good evaluation prompts from mlabonne/harmless_alpaca...
* 100 prompts loaded
* Obtaining first-token probability distributions...

Loading bad evaluation prompts from mlabonne/harmful_behaviors...
* 100 prompts loaded
* Counting model refusals...
* Initial refusals: 93/100
```

### Refusal directions calculation

Heretic modifies language models by ablating "refusal directions" from certain operators.
This step computes those directions based on the provided prompts.

```
Calculating per-layer refusal directions...
* Obtaining residual mean for good prompts...
* Obtaining residual mean for bad prompts...
```

### Parameter optimization

This is the heart of the process. Heretic searches for a combination of parameter values that,
when used to control ablation of the refusal directions, yields the best compromise between
refusal suppression and model quality.

This step can take some time, slightly under 3 hours in this case. An estimate for the remaining
amount of time, as well as memory stats, are displayed after every trial.

```
Running trial 1 of 200...
* Parameters:
  * direction_index = per layer
  * attn.o_proj.max_weight = 1.39
  * attn.o_proj.max_weight_position = 25.29
  * attn.o_proj.min_weight = 0.15
  * attn.o_proj.min_weight_distance = 2.39
  * mlp.down_proj.max_weight = 1.23
  * mlp.down_proj.max_weight_position = 20.65
  * mlp.down_proj.min_weight = 0.19
  * mlp.down_proj.min_weight_distance = 11.58
* Resetting model...
* Abliterating...
* Evaluating...
  * Obtaining first-token probability distributions...
  * KL divergence: 0.0126
  * Counting model refusals...
  * Refusals: 88/100

Elapsed time: 53s
Estimated remaining time: 2h 56m
Resident system RAM: 2.23 GB
Allocated GPU VRAM: 8.47 GB
Reserved GPU VRAM: 10.12 GB

Running trial 2 of 200...
* Parameters:
  * direction_index = per layer
  * attn.o_proj.max_weight = 1.49
  * attn.o_proj.max_weight_position = 25.36
  * attn.o_proj.min_weight = 0.01
  * attn.o_proj.min_weight_distance = 3.19
  * mlp.down_proj.max_weight = 1.49
  * mlp.down_proj.max_weight_position = 23.56
  * mlp.down_proj.min_weight = 0.33
  * mlp.down_proj.min_weight_distance = 11.33
* Resetting model...
* Abliterating...
* Evaluating...
  * Obtaining first-token probability distributions...
  * KL divergence: 0.0125
  * Counting model refusals...
  * Refusals: 88/100

Elapsed time: 1m 46s
Estimated remaining time: 2h 55m
Resident system RAM: 2.16 GB
Allocated GPU VRAM: 8.47 GB
Reserved GPU VRAM: 10.13 GB

[... 198 more trials ...]
```

### Trial selection

After the optimization run is complete, you will be shown the
[Pareto front](https://en.wikipedia.org/wiki/Pareto_front) of all trials,
and asked to choose which combination of refusal count and
[KL divergence](https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence)
(a rough measure of the difference between the modified model and the original one)
you want.

> [!IMPORTANT]
>
> The trial with the lowest number of refusals is **not** always the best choice.
> Any trial with a refusal count below 10 can be assumed to strongly suppress refusals,
> and among those, the trial with the lowest KL divergence should be chosen because
> it has the best chance of preserving the original model's intelligence.

```
Optimization finished!

The following trials resulted in Pareto optimal combinations of refusals
and KL divergence. After selecting a trial, you will be able to save the
model, upload it to Hugging Face, chat with it to test how well it works,
or run standard benchmarks on it. You can return to this menu later to
select a different trial. Note that KL divergence values above 0.5 usually
indicate significant damage to the original model's capabilities.

? Which trial do you want to use? (Use arrow keys)
 » [Trial  91] Refusals: 11/100, KL divergence: 0.0508
   [Trial  81] Refusals: 21/100, KL divergence: 0.0366
   [Trial 116] Refusals: 30/100, KL divergence: 0.0296
   [Trial  93] Refusals: 45/100, KL divergence: 0.0120
   [Trial  70] Refusals: 74/100, KL divergence: 0.0112
   [Trial  37] Refusals: 75/100, KL divergence: 0.0109
   [Trial  83] Refusals: 76/100, KL divergence: 0.0077
   [Trial  85] Refusals: 77/100, KL divergence: 0.0059
   [Trial 126] Refusals: 80/100, KL divergence: 0.0035
   [Trial  47] Refusals: 86/100, KL divergence: 0.0032
   [Trial 119] Refusals: 87/100, KL divergence: 0.0011
   [Trial 113] Refusals: 91/100, KL divergence: 0.0010
   [Trial  49] Refusals: 93/100, KL divergence: 0.0006
   Run additional trials
   Exit program
```

### Action selection

After choosing a trial, you can now decide what you want to do with the resulting model.
If you opt to upload the model to Hugging Face and you aren't already logged into Hugging Face
on your system, you will be prompted to enter an access token, which you can get from
the Hugging Face website as explained [here](https://huggingface.co/docs/hub/en/security-tokens).
Make sure the token has write permissions, as otherwise you won't be able to upload a model
with it.

```
Restoring model from trial 91...
* Parameters:
  * direction_index = 19.93
  * attn.o_proj.max_weight = 1.36
  * attn.o_proj.max_weight_position = 18.63
  * attn.o_proj.min_weight = 1.21
  * attn.o_proj.min_weight_distance = 16.30
  * mlp.down_proj.max_weight = 1.44
  * mlp.down_proj.max_weight_position = 18.86
  * mlp.down_proj.min_weight = 1.16
  * mlp.down_proj.min_weight_distance = 12.35
* Resetting model...
* Abliterating...

? What do you want to do with the decensored model? (Use arrow keys)
 » Save the model to a local folder
   Upload the model to Hugging Face
   Chat with the model
   Benchmark the model
   Return to the trial selection menu
```

## Next steps

Once you have successfully processed your first model with Heretic, it's time to explore
[the many configuration parameters](/configuration) Heretic offers that give you control
over what it does.

If you encounter any problems while using Heretic, or if you have suggestions or ideas for
improving Heretic, please file an issue [on GitHub](https://github.com/p-e-w/heretic),
or join us [on Discord](https://discord.gg/gdXc48gSyT) or
[on Matrix](https://matrix.to/#/#heretic:matrix.org)!
