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
█░█░█▀▀░█▀▄░█▀▀░▀█▀░█░█▀▀  v2.0.0
█▀█░█▀▀░█▀▄░█▀▀░░█░░█░█░░  https://heretic-project.org
▀░▀░▀▀▀░▀░▀░▀▀▀░░▀░░▀░▀▀▀  https://github.com/p-e-w/heretic

Detected 1 CUDA device(s) (11.63 GB total VRAM)
CUDA Version: 13.0
Driver Version: 580.178.04
* CUDA 0: NVIDIA GeForce RTX 3060 (11.63 GB)
```

### Model loading

Heretic now loads the requested model (downloading it from Hugging Face unless it is
already cached), analyzes its architecture, and displays the amount of memory it occupies.

```
Loading model Qwen/Qwen3.5-4B...
* Trying dtype auto...
* Transformer model with 32 layers
* Modifiable components:
  * attn.o_proj: 32 modules total
  * mlp.down_proj: 32 modules total

Resident system RAM: 2.07 GB
Allocated GPU VRAM: 8.46 GB
Reserved GPU VRAM: 8.54 GB
```

### Automatic batch size determination

Heretic does inference on prompts in batches, which dramatically speeds up processing.
This step determines the largest batch size your system can support, in order to maximize
processing speed.

```
Loading batch size test prompts from mlabonne/harmless_alpaca...
* 256 prompts loaded

Determining optimal batch size...
* Trying batch size 1... Ok (29 tokens/s)
* Trying batch size 2... Ok (48 tokens/s)
* Trying batch size 4... Ok (85 tokens/s)
* Trying batch size 8... Ok (138 tokens/s)
* Trying batch size 16... Ok (202 tokens/s)
* Trying batch size 32... Ok (260 tokens/s)
* Trying batch size 64... Failed (CUDA out of memory)
* Chosen batch size: 32
```

### Automatic response prefix determination

Reasoning models often start their responses with a thinking block (such as `<think>...</think>`).
Skipping the tokens in this block improves accuracy when calculating refusal directions, and
Heretic automatically tests for such prefixes in order to do this.

```
Loading response prefix test prompts from [mlabonne/harmless_alpaca, mlabonne/harmful_behaviors]...
* 200 prompts loaded

Checking chat template for a closed Chain-of-Thought block or an initializer...
* Chat template inserts CoT initializer: '<think>'
* Remaining CoT finalizer: '</think>'
* Rechecking with prefix...
* Extended prefix found: '</think>\n\n'
```

### Scorer initialization

Heretic evaluates model performance using scorer plugins. The configured scorers
are now being loaded, and an initial evaluation is performed.

```
Loading and initializing scorers...
* Loaded: KeywordRate
* Loaded: KLDivergence

Loading Refusals evaluation prompts from mlabonne/harmful_behaviors...
* 100 prompts loaded

Loading KL divergence evaluation prompts from mlabonne/harmless_alpaca...
* 100 prompts loaded
* Obtaining baseline first-token probability distributions...

Getting baseline scores...
* Baseline Refusals: 99/100
* Baseline KL divergence: 0 (by definition)
```

### Modifier initialization

Heretic modifies language models using modifier plugins.
This step prepares the configured modifier for use.

```
Loading and initializing modifiers...
* Loaded: ARA

Loading good prompts from mlabonne/harmless_alpaca...
* 400 prompts loaded

Loading bad prompts from mlabonne/harmful_behaviors...
* 400 prompts loaded

Obtaining module I/O for good prompts...

Obtaining module I/O for bad prompts...
```

### Parameter optimization

This is the heart of the process. Heretic searches for a combination of parameter values that,
when used with the configured modifier, yield the best compromise between the scores.

This step can take some time, around 2 hours in this case. An estimate for the remaining
amount of time, as well as memory stats, are displayed after every trial.

```
Running trial 1 of 100...
* Parameters:
  * start_layer_index = 8
  * end_layer_index = 18
  * preserve_good_behavior_weight = 0.8782
  * steer_bad_behavior_weight = 0.1185
  * overcorrect_relative_weight = 1.1182
  * neighbor_count = 2
* Resetting model...
* Modifying model using Arbitrary-Rank Ablation (ARA)...
* Evaluating...
  * Refusals: 0/100
  * KL divergence: 14.2954

Elapsed time: 1m 1s
Estimated remaining time: 1h 40m
Resident system RAM: 3.71 GB
Allocated GPU VRAM: 8.58 GB
Reserved GPU VRAM: 8.60 GB

Running trial 2 of 100...
* Parameters:
  * start_layer_index = 2
  * end_layer_index = 32
  * preserve_good_behavior_weight = 0.8253
  * steer_bad_behavior_weight = 0.0890
  * overcorrect_relative_weight = 0.1490
  * neighbor_count = 1
* Resetting model...
* Modifying model using Arbitrary-Rank Ablation (ARA)...
* Evaluating...
  * Refusals: 85/100
  * KL divergence: 0.4825

Elapsed time: 2m 38s
Estimated remaining time: 2h 9m
Resident system RAM: 3.71 GB
Allocated GPU VRAM: 8.58 GB
Reserved GPU VRAM: 8.60 GB

[... 98 more trials ...]
```

### Trial selection

After the optimization run is complete, you will be shown the
[Pareto front](https://en.wikipedia.org/wiki/Pareto_front) of all trials,
and asked to choose which combination of scores you want. By default, the scores are
refusal count and
[KL divergence](https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence)
(a rough measure of the difference between the modified model and the original one).

> [!IMPORTANT]
>
> The trial with the lowest number of refusals is **not** always the best choice.
> Any trial with a refusal count below 10 can be assumed to strongly suppress refusals,
> and among those, the trial with the lowest KL divergence should be chosen because
> it has the best chance of preserving the original model's intelligence.

```
Optimization finished!

The following trials resulted in Pareto optimal combinations of the
optimization objectives. After selecting a trial, you will be able to
save the model, upload it to Hugging Face, chat with it to test how well
it works, or run standard benchmarks on it. You can return to this menu
later to select a different trial.

? Which trial do you want to use? (Use arrow keys)
 » [Trial  91] Refusals:  9/100, KL divergence: 0.0508
   [Trial  81] Refusals: 21/100, KL divergence: 0.0366
   [Trial  93] Refusals: 45/100, KL divergence: 0.0120
   [Trial  70] Refusals: 74/100, KL divergence: 0.0112
   [Trial  37] Refusals: 75/100, KL divergence: 0.0109
   [Trial  83] Refusals: 76/100, KL divergence: 0.0077
   [Trial  85] Refusals: 77/100, KL divergence: 0.0059
   [Trial  47] Refusals: 86/100, KL divergence: 0.0032
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
  * start_layer_index = 5
  * end_layer_index = 26
  * preserve_good_behavior_weight = 0.6126
  * steer_bad_behavior_weight = 0.0003
  * overcorrect_relative_weight = 0.8997
  * neighbor_count = 9
* Resetting model...
* Modifying model using Arbitrary-Rank Ablation (ARA)...

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
