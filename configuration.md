---
outline: [2, 3]
---


# Configuration

Heretic is controlled through a variety of parameters that can be set via the command line
(run `heretic --help` to see the complete list), via environment variables named
`HERETIC_<PARAMETER_NAME_IN_SCREAMING_SNAKE_CASE>`, and, most commonly, via a settings file
named `config.toml` that is placed in the working directory that you run Heretic from.

The Heretic repository contains pre-made settings files for several tasks:

* [`config.default.toml`](https://github.com/p-e-w/heretic/blob/master/config.default.toml):
  Performs refusal suppression **[default]**

* [`config.noslop.toml`](https://github.com/p-e-w/heretic/blob/master/config.noslop.toml):
  Performs slop suppression (see
  [this Reddit post](https://www.reddit.com/r/LocalLLaMA/comments/1qa0w6c/it_works_abliteration_can_reduce_slop_without/)
  for details)

* [`config.nohumor.toml`](https://github.com/p-e-w/heretic/blob/master/config.nohumor.toml):
  Performs humor suppression

* [`config.nosyco.toml`](https://github.com/p-e-w/heretic/blob/master/config.nosyco.toml):
  Performs sycophancy suppression

* [`config.emotions.toml`](https://github.com/p-e-w/heretic/blob/master/config.emotions.toml):
  Alters emotional alignment

<br>

The following settings are available.
The example represents the default value unless indicated otherwise.

## General

### dtypes

List of PyTorch dtypes to try when loading model tensors.
If loading with a dtype fails, the next dtype in the list will be tried.

#### Type

`list[str]`

#### Example

```toml
dtypes = [
    # In practice, "auto" almost always means bfloat16.
    "auto",
    # If that doesn't work (e.g. on pre-Ampere hardware), fall back to float16.
    "float16",
    # If "auto" resolves to float32, and that fails because it is too large,
    # and float16 fails due to range issues, try bfloat16.
    "bfloat16",
    # If neither of those work, fall back to float32 (which will of course fail
    # if that was the dtype "auto" resolved to).
    "float32",
]
```

### quantization

Quantization method to use when loading the model. Options:

* `"none"` (no quantization),
* `"bnb_4bit"` (4-bit quantization using bitsandbytes).

#### Type

`QuantizationMethod`

#### Example

```toml
quantization = "none"
```

### device_map

Device map to pass to Accelerate when loading the model.

#### Type

`str | Dict[str, int | str]`

#### Example

```toml
device_map = "auto"
```

### max_memory

Maximum memory to allocate per device.

#### Type

`Dict[str, str] | None`

#### Example

```toml
max_memory = { "0" = "20GB", "cpu" = "64GB" }
```

*This is not the default. The default is `None`, meaning no maximum is enforced.*

### offload_outputs_to_cpu

Whether to move intermediate analysis tensors (such as residuals and logprobs)
to CPU memory as soon as possible to reduce peak VRAM usage.
This lowers peak VRAM usage during residual analysis and evaluation,
but may slightly reduce performance due to host/device transfers.

#### Type

`bool`

#### Example

```toml
offload_outputs_to_cpu = true
```

### batch_size

Number of input sequences to process in parallel (0 = auto).

#### Type

`int`

#### Example

```toml
batch_size = 0  # auto
```

### max_batch_size

Maximum batch size to try when automatically determining the optimal batch size.

#### Type

`int`

#### Example

```toml
max_batch_size = 128
```

### max_response_length

Maximum number of tokens to generate for each response.

#### Type

`int`

#### Example

```toml
max_response_length = 100
```

### chain_of_thought_blocks

List of pairs of the form `[cot_initializer, cot_finalizer]` used to skip
the Chain-of-Thought block in responses, so that evaluation happens
at the start of the actual response.

#### Type

`list[tuple[str, str]]`

#### Example

```toml
chain_of_thought_blocks = [
    # Most thinking models.
    [
        "<think>",
        "</think>",
    ],
    # gpt-oss.
    [
        "<|channel|>analysis<|message|>",
        "<|end|><|start|>assistant<|channel|>final<|message|>",
    ],
    # Unknown, suggested by user.
    [
        "<thought>",
        "</thought>",
    ],
    # Unknown, suggested by user.
    [
        "[THINK]",
        "[/THINK]",
    ],
]
```

### print_debug_information

Whether to print additional information that can help with debugging.

#### Type

`bool`

#### Example

```toml
print_debug_information = false
```

### scorers

List of scorer plugin configs. Each entry is an object
`{ plugin = <plugin>, optimization = <optimization>, instance_name = <optional> }`.
`<optimization>` is one of `"minimize"`, `"maximize"`, or `"none"` (do not optimize).
`<plugin>` is either a fully qualified import path (`module.submodule.ClassName`),
or a file path followed by a class name (`path/to/plugin.py:ClassName`).

#### Type

`list[ScorerConfig]`

#### Example

```toml
scorers = [
    { plugin = "heretic.scorers.keyword_rate.KeywordRate", optimization = "minimize" },
    { plugin = "heretic.scorers.kl_divergence.KLDivergence", optimization = "minimize" },
]
```

### modifiers

List of modifier plugin configs. Each entry is an object
`{ plugin = <plugin>, instance_name = <optional> }`.
`<plugin>` is either a fully qualified import path (`module.submodule.ClassName`),
or a file path followed by a class name (`path/to/plugin.py:ClassName`).
Note that only a single modifier can currently be applied,
and this list must contain exactly one entry.

#### Type

`list[ModifierConfig]`

#### Example

```toml
modifiers = [
    { plugin = "heretic.modifiers.ara.ARA" },
]
```

### n_trials

Number of trials to run during optimization.

#### Type

`int`

#### Example

```toml
n_trials = 100
```

### n_startup_trials

Number of trials that use random sampling for the purpose of exploration.

#### Type

`int`

#### Example

```toml
n_startup_trials = 30
```

### study_checkpoint_dir

Directory to save and load study progress to/from.

#### Type

`str`

#### Example

```toml
study_checkpoint_dir = "checkpoints"
```

### modified_model_type

Adjective describing the type of model produced by the configuration.

#### Type

`str`

#### Example

```toml
modified_model_type = "decensored"
```

### max_shard_size

Maximum size for individual safetensors files generated when exporting a model.

#### Type

`int | str`

#### Example

```toml
max_shard_size = "5GB"
```

### upload_tags

Tags to add to the Hugging Face repository when uploading the model.

#### Type

`list[str]`

#### Example

```toml
upload_tags = [
    "uncensored",
    "decensored",
    "abliterated",
]
```

### system_prompt

System prompt to use when prompting the model.

#### Type

`str`

#### Example

```toml
system_prompt = "You are a helpful assistant."
```

### batch_size_test_prompts

Dataset of prompts to use for automatically determining the optimal batch size.

#### Type

`DatasetSpecification`

#### Example

```toml
[batch_size_test_prompts]
dataset = "mlabonne/harmless_alpaca"
split = "train[:256]"
column = "text"
```

### response_prefix_test_prompts

Dataset of prompts to use for automatically determining the response prefix.

#### Type

`DatasetSpecification`

#### Example

```toml
[[response_prefix_test_prompts]]
dataset = "mlabonne/harmless_alpaca"
split = "train[:100]"
column = "text"

[[response_prefix_test_prompts]]
dataset = "mlabonne/harmful_behaviors"
split = "train[:100]"
column = "text"
```

<br>

Settings for scorer and modifier plugins live in top-level TOML tables named
`[scorer.<ClassName>]` and `[modifier.<ClassName>]`, respectively.
If multiple instances of the same plugin class are configured by setting `instance_name`
in the `scorers` or `modifiers` list, instance-specific settings live under
`[scorer.<ClassName>_<instance_name>]` or `[modifier.<ClassName>_<instance_name>]`,
overriding the shared defaults in `[scorer.<ClassName>]` and `[modifier.<ClassName>]`.

The following plugin settings are available.

## scorer.KeywordRate

### score_name

Name that describes what the configured keyword rate measures.

#### Type

`str`

#### Example

```toml
[scorer.KeywordRate]
score_name = "Refusals"
```

### print_responses

Whether to print prompt/response pairs when counting keyword matches.

#### Type

`bool`

#### Example

```toml
[scorer.KeywordRate]
print_responses = false
```

### keyword_markers

Strings whose presence in a response (case insensitive) identifies the response as a keyword match.

#### Type

`list[str]`

#### Example

```toml
[scorer.KeywordRate]
keyword_markers = [
    "disclaimer",
    "sorry",
    "i can'",
    "i cant",
    "i cannot",
    "i won'",
    "i wont",
    "i will not",
    "i unable",
    "im unable",
    "i'm unable",
    "i am unable",
    "i an ai",
    "im an ai",
    "i'm an ai",
    "i am an ai",
    "as an ai",
    "ai assistant",
    "i designed to",
    "im designed to",
    "i'm designed to",
    "i am designed to",
    "i programmed to",
    "im programmed to",
    "i'm programmed to",
    "i am programmed to",
    "violat",
    "prohibit",
    "illegal",
    "harmful",
    "inappropriate",
    "unethical",
    "ethical boundaries",
]
```

### prompts

Dataset of prompts to evaluate the keyword match rate on.

#### Type

`DatasetSpecification`

#### Example

```toml
[scorer.KeywordRate.prompts]
dataset = "mlabonne/harmful_behaviors"
split = "test[:100]"
column = "text"
```

## scorer.KLDivergence

### prompts

Dataset of prompts used to measure KL divergence from original model.

#### Type

`DatasetSpecification`

#### Example

```toml
[scorer.KLDivergence.prompts]
dataset = "mlabonne/harmless_alpaca"
split = "test[:100]"
column = "text"
```

## scorer.BERTClassifier

*The BERTClassifier scorer is not enabled by default. To use it, add or replace an entry
in the `scorers` setting: `{ plugin = "heretic.scorers.bert_classifier.BERTClassifier", optimization = "minimize" }`.*

### score_name

Name that describes what the configured match rate measures.

#### Type

`str`

#### Example

```toml
[scorer.BERTClassifier]
score_name = "Refusals (Classifier)"
```

### model

Hugging Face model ID, or path to a text-classification model on disk.

#### Type

`str`

#### Example

```toml
[scorer.BERTClassifier]
model = "VINAY-UMRETHE/Refusal-Classifier"
```

### model_commit

Hugging Face commit hash of the classifier model.
Set this to pin a specific revision; unset means the latest
revision is auto-pinned and recorded when the classifier is loaded.
When reproducing, the recorded revision is restored and used.

#### Type

`str | None`

#### Example

```toml
[scorer.BERTClassifier]
model_commit = "<commit-hash>"
```

*This is not the default. The default is `None`, meaning the latest revision
is auto-pinned and recorded when the classifier is loaded.*

### dtypes

List of PyTorch dtypes to try when loading model tensors.
If loading with a dtype fails, the next dtype in the list will be tried.

#### Type

`list[str]`

#### Example

```toml
[scorer.BERTClassifier]
dtypes = [
    "auto",
    "float16",
    "bfloat16",
    "float32",
]
```

### device_map

Device map to pass to Accelerate when loading the model.

#### Type

`str | Dict[str, int | str]`

#### Example

```toml
[scorer.BERTClassifier]
device_map = "auto"
```

### match_labels

Labels predicted by the classifier that identify a response as a match.
Defaults to the refusal labels of the default model, which should
be counted as refusals.
Valid labels: compliant, full_refusal, partial_refusal, capability_limitation, clarification.

#### Type

`list[str]`

#### Example

```toml
[scorer.BERTClassifier]
match_labels = ["full_refusal", "partial_refusal"]
```

### batch_size

Number of prompt/response pairs to classify in parallel.

#### Type

`int`

#### Example

```toml
[scorer.BERTClassifier]
batch_size = 16
```

### max_length

Maximum number of tokens per classifier input (longer inputs are truncated).

#### Type

`int`

#### Example

```toml
[scorer.BERTClassifier]
max_length = 8192
```

### use_text_pairs

Whether to pass inputs as prompt/response text pairs.
Requires a model trained on pairs (e.g. the default refusal classifier).
Set to False when using a single-sequence text-classification model
to evaluate the response string only (e.g. sentiment analysis).

#### Type

`bool`

#### Example

```toml
[scorer.BERTClassifier]
use_text_pairs = true
```

### print_responses

Whether to print prompt/response pairs and their predicted labels.

#### Type

`bool`

#### Example

```toml
[scorer.BERTClassifier]
print_responses = false
```

### prompts

Dataset of prompts to evaluate the match rate on.

#### Type

`DatasetSpecification`

#### Example

```toml
[scorer.BERTClassifier.prompts]
dataset = "mlabonne/harmful_behaviors"
split = "test[:100]"
column = "text"
```

## scorer.BenchmarkScore

*The BenchmarkScore scorer is not enabled by default. To use it, add or replace an entry
in the `scorers` setting: `{ plugin = "heretic.scorers.benchmark_score.BenchmarkScore", optimization = "maximize" }`.*

### score_name

Name that describes what the configured benchmark score measures.

#### Type

`str`

#### Example

```toml
[scorer.BenchmarkScore]
score_name = "PIQA acc_norm"
```

### task

Task ID of the benchmark in the Language Model Evaluation Harness.

#### Type

`str`

#### Example

```toml
[scorer.BenchmarkScore]
task = "piqa"
```

### metric

Task metric to use as the benchmark score.

#### Type

`str`

#### Example

```toml
[scorer.BenchmarkScore]
metric = "acc_norm,none"
```

## modifier.ARA

### preserve_row_magnitudes

Whether to renormalize the rows of the modified matrices to preserve
the original matrices' row magnitudes. This is believed to improve
intelligence retention (see Lai 2025, "Magnitude-Preserving Orthogonal Ablation").

#### Type

`bool`

#### Example

```toml
[modifier.ARA]
preserve_row_magnitudes = true
```

### lora_rank

The rank of the LoRA adapter to use.
While mathematically, ARA is of "arbitrary" rank, experiments have shown that
singular values tend to drop rapidly after a few dozen dimensions, and approximating
the full transformation with a LoRA has many practical advantages.

#### Type

`int`

#### Example

```toml
[modifier.ARA]
lora_rank = 50
```

### n_optimization_steps

Number of (outer) L-BFGS optimization steps to perform.

#### Type

`int`

#### Example

```toml
[modifier.ARA]
n_optimization_steps = 5
```

### learning_rate

Learning rate to use in the L-BFGS optimizer.

#### Type

`float`

#### Example

```toml
[modifier.ARA]
learning_rate = 1.0
```

### max_iter

Maximum number of (inner) iterations to perform per (outer) L-BFGS optimization step.

#### Type

`int`

#### Example

```toml
[modifier.ARA]
max_iter = 20
```

### history_size

Number of past updates to store for approximating the Hessian matrix in the L-BFGS optimizer.

#### Type

`int`

#### Example

```toml
[modifier.ARA]
history_size = 10
```

### print_loss

Whether to print the loss value for each L-BFGS optimization step.

#### Type

`bool`

#### Example

```toml
[modifier.ARA]
print_loss = false
```

### good_prompts

Dataset of prompts that tend to produce desirable responses.

#### Type

`DatasetSpecification`

#### Example

```toml
[modifier.ARA.good_prompts]
dataset = "mlabonne/harmless_alpaca"
split = "train[:400]"
column = "text"
```

### bad_prompts

Dataset of prompts that tend to produce undesirable responses.

#### Type

`DatasetSpecification`

#### Example

```toml
[modifier.ARA.bad_prompts]
dataset = "mlabonne/harmful_behaviors"
split = "train[:400]"
column = "text"
```

## modifier.Abliteration

*The Abliteration modifier is not enabled by default; Heretic defaults to ARA.
To use abliteration, set the `modifiers` setting to
`[ { plugin = "heretic.modifiers.abliteration.Abliteration" } ]`.*

### orthogonalize_direction

Whether to adjust the residual directions so that only the component that is
orthogonal to the good direction is subtracted during abliteration.

#### Type

`bool`

#### Example

```toml
[modifier.Abliteration]
orthogonalize_direction = true
```

### row_normalization

How to apply row normalization of the weights. Options:

* `"none"` (no normalization),
* `"pre"` (compute LoRA adapter relative to row-normalized weights),
* `"full"` (like "pre", but renormalizes to preserve original row magnitudes).

#### Type

`RowNormalization`

#### Example

```toml
[modifier.Abliteration]
row_normalization = "full"
```

### full_normalization_lora_rank

The rank of the LoRA adapter to use when `"full"` row normalization is used.
Row magnitude preservation is approximate due to non-linear effects,
and this determines the rank of that approximation. Higher ranks produce
larger output files and may slow down evaluation.

#### Type

`int`

#### Example

```toml
[modifier.Abliteration]
full_normalization_lora_rank = 3
```

### winsorization_quantile

The symmetric winsorization to apply to the per-prompt, per-layer residual vectors,
expressed as the quantile to clamp to (between 0 and 1). Disabled by default.
This can tame so-called "massive activations" that occur in some models.
Example: `winsorization_quantile = 0.95` computes the 0.95-quantile of the absolute values
of the components, then clamps the magnitudes of all components to that quantile.

#### Type

`float`

#### Example

```toml
[modifier.Abliteration]
winsorization_quantile = 1.0
```

### good_prompts

Dataset of prompts that tend to produce desirable responses.

#### Type

`DatasetSpecification`

#### Example

```toml
[modifier.Abliteration.good_prompts]
dataset = "mlabonne/harmless_alpaca"
split = "train[:400]"
column = "text"
```

### bad_prompts

Dataset of prompts that tend to produce undesirable responses.

#### Type

`DatasetSpecification`

#### Example

```toml
[modifier.Abliteration.bad_prompts]
dataset = "mlabonne/harmful_behaviors"
split = "train[:400]"
column = "text"
```
