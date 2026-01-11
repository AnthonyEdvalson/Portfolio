---
color: black
width: 8
code: PRJ.097
title: Deepslate Learning
category: 3D Transformers
subtitle: Large Voxel Model for minecraft
chip: blocks
height: 4
---
Deepslate is an experiment I did to try and get an LLM-like model for generating 3d voxel structures.

Every now and then I have a Minecraft phase, and I love to mess around in creative mode to make giant buildings. However most of this work is pretty formulaic, a big building often has a lot of repeated motifs. Most of the time is spent establishing motifs, then the rest of the structure is just repeating it.

I really like this build, but you can see that the same windows and domes are used all over the place.

![](assets/deepslate-build.png)


I figured it would be cool to have an LLM-like interface for generating these kind of buildings, you could start by making a section of the build, and then the model can extend it to create a whole structure.

I also was learning about LLMs at the time, and was sad that I didn't have the GPUs and training datasets to make anything unique. So I figured this would be the perfect project. I could learn about and take advantage of existing LLM architectures, but try to generalize them to work with 3d voxels.

# Dataset

I knew from the start I'd need a bunch of training data. Thankfully, I have a world with a bunch of enormous buildings in it that make for a great dataset. I took my largest build and wrote some python scripts to extract a bunch of training examples from it.

I could have given it multiple builds, but the total volume of this building is a few million blocks, with a bit of data augmentation this is more than enough for testing. Plus multiple buildings would be harder to learn, I wanted to give it a simple problem to solve and see how it handled it.

The building I used is this church and the big building behind it:

![](assets/deepslate-build2.png)

## Tokenization

Minecraft has around 900 different blocks and around 5000 block states.  Plus, if you don't care about weird blocks like "upside down curved warped wooden stairs", you can narrow this down quite a bit. For my testing here I managed to get away with only 20-30 blocks. The one build I was training off of had a very limited block palette, and I ignored certain things like tall grass blocks to limit it further.

Plus I'm betting that a Minecraft building has less complexity than written text, which means we can use a much smaller hidden dimension compared to LLMs, and fewer layers in general.

# The Model Architecture

I tried several different designs to see what worked best. I knew I was going with something very similar to open source LLMs at the time, with attention, feed forward networks, and positional embeddings. But the problems came from scaling to higher dimensions.

## The Memory Problem

My end goal was to support a 32x32x32 region of blocks as the context window. That's 32,768 blocks. In terms of hardware I wanted to do it all local on my GTX 3080 ti, which has 12 gigabytes of RAM. This is a problem. For comparison, GPT-3 had a context window of 2,048 and required very high end GPUs, costing in the millions of dollars.

The main problem is memory. Attention is great but has O(n^2) space complexity with respect to context length. 2x the context means 4x the memory. But in 3d, this becomes O(n^6). So 2x the context is 64x the memory.

Over the years there's been a bunch of tricks to try and reduce memory requirements of transformers, but all of those are meant for text. I wanted to come up with some that would take advantage of being in higher dimensional spaces.

### Causal Masking in 3D is Hard

Causal masking is super important for training these models efficiently. Imagine you have a sentence you are training the LLM on:

| 0   | 1    | 2   | 3    | 4   |
| --- | ---- | --- | ---- | --- |
| Hi! | Nice | to  | meet | you |

If you wanted, you could make a bunch of training examples from this and have it guess the next word on each example:

| In 0 | In 1 | In 2 | In 3 | In 4 | Output |
| ---- | ---- | ---- | ---- | ---- | ------ |
| -    | -    | -    | -    | -    | Hi!    |
| Hi!  | -    | -    | -    | -    | Nice   |
| Hi!  | Nice | -    | -    | -    | to     |
| Hi!  | Nice | to   | -    | -    | meet   |
| Hi!  | Nice | to   | meet | -    | you    |

This works fine, but is not the most efficient. What if we could train all 5 of these examples in a single example?

Instead the training example would look like this:

| In 0 | In 1 | In 2 | In 3 | In 4 | Out 0 | Out 1 | Out 2 | Out 3 | Out 4 |
| ---- | ---- | ---- | ---- | ---- | ----- | ----- | ----- | ----- | ----- |
| Hi!  | Nice | to   | meet | you  | Hi!   | Nice  | to    | meet  | you   |

Okay, but obviously if you gave this to a model, it would just copy the inputs to the outputs. it's not going to learn to "predict" what comes next if the correct prediction is just handed to it.

This is where causal masking comes in. Internally, you guarantee that no information from the future inputs can be used in an output. In this case, that means output 2 is only able to "see" inputs 0 and 1. Causal masking is a method where you take the results of the attention heads, and "mask" out all the results that are passing data from right to left.

Given my strict compute budget, I have to take advantage of this optimization. My training examples have ~32,000 values, so would be a 32,000x speedup in training.

### Solution 1: Swin

A common approach to problems that scale poorly is to split them into small problems. I found Swin, which is used for image classification tasks and saves memory by working on smaller chunks of the space, downsampling the results, and repeating. This is good for image classification, but to be generative we need a way to produce logits so I pulled a U-net and built a decoder that pulls info from the encoder at various levels of abstraction. Here's my chart to keep track of the whole thing:

![](assets/deepslate-swin.png)

This worked pretty well, but was slow to train. I hadn't added masking because I had only just realized how important it would be, and from this architecture it's pretty clear that masking would be very hard. So much data is getting mixed together and blended, and split back out. Adding masking would be difficult.

Plus, even if you could add masking, how would that work? With text there's only one way to mask, from the first word to the last. But in 3D you could take an arbitrary path. I realized I would need to think about the order the cubes would be generated from the start. So I came up with a similar, but slightly different system.

### Solution 2: Hilbert curves

To get the masking to work with a Swin-like architecture, I needed to try and fill up each cube region of space quickly. I think the picture explains it pretty well. This is in 2D and for a 4x4 region, but the concept generalizes to 3D easily.

![](assets/deepslate-hilbert.png)

You can still use the hierarchical structure, you can see how the yellow square's value is not determined directly by all the blue and purple ones, instead it only sees the aggregated value. In this case, each transformer only works on 4 values at a time, instead of the full 16.

This has space complexity of O(n^3 * b^3), where b is the width of the subregions that attention works over. I got good results with b=4, which will reduce memory by 99.8%

This system was way more promising and had much better results, but still had some challenges. The complexity in the layers definitely made it harder to work with and a bit slower. At the time I was using Keras which probably was a bad idea, a bit too high level for these kinds of small changes.

I also figured there might be a better approach that takes advantage of specific properties of the buildings I'm trying to generate, which led me to the next solution.

### Solution 3: Axial Attention

Why do attention as a volume? Instead of looking at a full region, it might be good enough to just look along the axis at each point.

What I was doing before, was using "cubic" attention, where you look at everything in a cube around the point (ignoring values from masking). But I wanted to explore other shapes. Ultimately, very few structures in Minecraft have diagonal structures that would require the cube to notice. The corners of the cube are quite far, and features tend to stick to the planes.

So I wanted to try axial and octahedral. With those you can use way fewer cubes to get the same coverage.

![](assets/deepslate-dies.png)

The downside, is that information has to go through more steps to move diagonally. But this is a decent tradeoff. If the memory requirements are slashed, I can use a ton more intermediate layers which will allow the information to get to where it's needed, just in a few more steps.

And with this, the optimization is big enough that there's no reason to use Swin or Hilbert curves any more. Although it would've been fun to have a practical application for 3d space filling curves, this meant I could use much more standard tools that were easier to tinker with.

The problem, was getting it to run fast.

### Tony's Janky Sparse Attention

The problem, is that the standard attention systems do masking in a horribly inefficient way. They work by calculating the attention for all combination of inputs, and then masking out all the ones you don't want. This saves no memory, because you still have a huge matrix of values being calculated, but ignored.

Lots of people have noticed this and have made clever optimizations, but I was feeling adventurous and this was just within my capabilities. So I didn't look up any spoilers and made my own version of sparse attention.

![](assets/deepslate-diag.png)

In that chart, the green diagonals are the attention mask. All the black values are calculated but discarded. To be less wasteful we should calculate the values in a way that has less empty space.

![](assets/deepslate-diag2.png)

So I made a bunch of charts to understand exactly what needs to change to get the same results, but in that diagonal space.

![](assets/deepslate-diag3.png)

The solution was to repeat and shift values by the diagonal offsets.

![](assets/deepslate-diag4.png)

And this works very well, memory is now O(n^3 * d), where d is the number of diagonals in the attention matrix. Ultimately I went with the axial attention, so d is quite small.

# Results

I unfortunately didn't reach my dream of 32x32x32 generations, but I was able to get 16x16x16 to work. The main limitation was still memory, but also training data. I could have gone a bit larger with the context, but it would have meant much fewer training examples since each would have been much larger.

Here's what looks like the start of a bridge or walkway

![](assets/deepslate-example2.png)

This appears to be a section of the top of a large tower, I love how much structure is going on here. I'd love to see it complete the rest of the structure.

![](assets/deepslate-example3.png)

And this seems to be the edge of a wall or bridge.

![](assets/deepslate-example4.png)

Overall I'm super happy with it! At the moment the output is just plotted with matplotlib, but one day I'd love to hook it up to a mod and make it more interactive. I've learned a ton about how transformers work, and had a lot of fun trying to extend it to higher dimensions. I'm definitely not out of ideas, with how to improve this, but I'm pushing against the limitations of my hardware and time. One day I'd love to revisit it.