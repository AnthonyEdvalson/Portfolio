---
color: orange
width: 4
height: 3
code: PRJ.065
title: Assembly Line
category: Project
subtitle: Creating a microprocessor in Factorio
chip: fips
---
The "Assembly Line" is a fully compliant MIPS processor implemented entirely in the video game Factorio. This means I can write code in a language like C++, compile it, and run it on the circuitry I designed in the game.

# Version I

Years ago, I took a class on computer architecture, and it was by far my favorite. Mostly because it was a side of CS I had almost no exposure to. And when I learn about something cool, it turns into a project.

So I wanted to make my own processor using the [MIPS](https://en.wikipedia.org/wiki/MIPS_architecture) instruction set. If you’re unfamiliar with instruction sets, they’re the specification of what 1s and 0s to send to the processor to make it do a thing. If you're reading this on a Mac or phone, the processor is probably designed with the ARM specification. If it's Windows or Linux, it's probably a variant of x86.

MIPS is a mostly dead instruction set, but it used to be very popular back in the day. It was designed in an age where developing microchips was a lot harder than it is now, and so there's a lot of compromises to make it very easy to implement. Plus, it used to be popular so most compilers can take code and convert it to MIPS instructions, so it’s perfect for this project.

(Also, I'm going to assume that if you're reading obscure developer portfolio websites like this one that you know what Factorio is. But if you don't, all you need to know is that it’s a game about making factories that has some basic circuitry components)

## How it went

The first iteration of the processor was made many years ago while I was in college. It ran at 2 Hz, skipped many of the hard to implement instructions, and there was no display, so the output had to be found by manually inspecting memory cells. But I was able to take a C++ program that calculates Fibonacci numbers and get it to run on it. 

![](assets/fips-old.png)

As someone with no computer engineering experience, I was just happy it ran at all. But when I was writing up this post about seven years later, it didn’t sit right with me.

The implementation was very by-the-book, and not the most interesting. Plus Factorio had a few updates that would let me optimize it quite a lot. So, I decided to take another crack at it over the winter holidays and see how far I could get.

# Version II

So I said addiu to the old design and redid the entire thing from scratch. The new processor runs at a blazing 5 Hz, over twice as fast as the original. It also has a much simpler design and has fully implemented all the main MIPS instructions. Here's the processor running a test program:

![](assets/fips-overview.mov)

The largest change was restructuring the design to take advantage of how Factorio’s circuitry works instead of blindly copying established designs.

Specifically, the biggest change compared to silicon-based processors is that Factorio wires can carry tons more data. Normally a wire can only transfer a single bit of information, but in Factorio wires can carry a 32-bit signed integer for many signals simultaneously. They're more like hash maps than booleans. So it makes sense to load up lots of info on the same wires, and then every module can read whatever it might want. Super easy and modular.

Also, the basic unit of computation in Factorio is the combinator, which is much more capable than a transistor. The main difference is that some combinators can check multiple conditions at once. This means the processor will be faster if you can combine multiple combinators, since each combinator always takes 1/60th of a second to compute the result regardless of how much work it is doing.

These two factors push the design away from the typical layout of having discrete, general-purpose modules with control signals to carefully coordinate their behaviors, to a design with highly specialized, self-contained instruction handlers each acting independently with a sort of mesh network allowing them to coordinate.

## Signal Busses

There's two signal busses that act as the backbone for the system. The idea is that all the registers and memory feed into the "state bus". Then the ALU uses that to compute the "action bus". When the clock signal is received, all the state modules read the action bus and update. Then the cycle repeats.

I technically could have had one signal connecting everything together, but for planning it was useful to be explicit about which signals are coming from the state, and which signals will cause something to happen on the next clock cycle.

Here are the actual signal values if you're curious. tbh this is mostly for my reference, you don't need to understand these to follow along.

**State signals**

| Signal  | Name                      | Description                          |
| :-----: | ------------------------- | ------------------------------------ |
|  **P**  | Program Counter           | PC                                   |
| **P**** | Program Counter (shifted) | PC >> 2                              |
|  **O**  | Opcode                    | Instruction[31-26]                   |
|  **F**  | Funct                     | Instruction[5-0]                     |
|  **R**  | Register rs index         | Instruction[25-21]                   |
|  **T**  | Register rt index         | Instruction[20-16]                   |
|  **D**  | Register rd index         | Instruction[15-11]                   |
|  **S**  | Shift amount              | Instruction[10-6]                    |
|  **I**  | Immediate (sign extended) | Instruction[15-0]                    |
| **I**** | Immediate (unsigned)      | Instruction[15-0], no sign extension |
|  **J**  | Jump target               | Instruction[25-0]                    |
|  **A**  | Register A value          | reg[rs]                              |
|  **B**  | Register B value          | reg[rt]                              |
|  **H**  | HI register               | High multiply register               |
|  **L**  | LO register               | Low multiply register                |
|  **M**  | Memory value              | mem[reg[rs] + offset]                |
|  **%**  | Memory sub-word offset    | (reg[rs] + offset) % 4               |

**Action Signals**

| Signal | Name                         | Description                                           |
| :----: | ---------------------------- | ----------------------------------------------------- |
| **V**  | Value 1                      | Computed value from ALU                               |
| **W**  | Value 1 destination          | 0: none<br>2: PC ← V<br>4: mem[addr] ← V<br>5: HI ← V |
| **X**  | Value 2                      | Secondary computed value                              |
| **Y**  | Value 2 destination register | Target register index for when Z=1                    |
| **Z**  | Value 2 destination          | 0: none<br>1: reg[Y] ← X<br>2: LO ← X                 |

Here's the high-level design. The letters are signal names. Everything is arranged so execution flows from top to bottom, things that are lower are computed later. This is true in the diagram, and in the actual processor layout to make it easier to manage the timings.

![](assets/fips-flow.png)

There's a lot of micro-optimizations. For example, there's two program counter values. P** (equal to P >> 2) is what's actually stored in PC since that's a format that the program module can use more quickly. But since the ALU expects unshifted values, we still have to take a tick to shift the values back, but this is fine since that connection isn't on the critical path.

There's also no dedicated control circuitry. Instead the ALU has a module for each instruction that outputs signals saying what the results are, and what to do with them. Here's a video of it in action. Green lights show the active instruction.

![](assets/fips-alu%201.mov)
# Memory

My first design had these huge memory banks. Each word required 2x4 tiles of space to store plus complex addressing systems to handle reads and writes. This meant I could only support a few hundred bytes of memory before it took up huge amounts of space.

But with new versions of Factorio, the selector combinator was added, which makes a more compact memory system viable. It makes it easy for a single memory module to store a set of signals, instead of individual ones. The new memory module can store an int32 for every possible signal in the game, and there's about 3000 valid signals. This means you can store 12KB with only this much circuitry:

![](assets/fips-mem2.png)

As the name implies, the selector combinator “selects” from a set of signals that you specify. So I had to specify all 3000 signals individually. If I did this by hand it would have sucked. So instead I wrote some scripts to generate a blueprint containing a constant combinator with all the signals (actually, 3 combinators since I found each has a 1k signal limit).

> If I really wanted to, I could have multiple memory cells to get past the 12KB limit, but at the current clock speeds it would take about an hour to write to all the available memory. So there’s no practical reason you’d need to do that. But also, there’s no practical reason to be doing any of this.

# Multiplying is hard

This was the most technically challenging part of the whole project.

MIPS has a lot of special design around multiplication. One of these quirks is that multiplying stores the result in two special registers, HI and LO. The reason there’s two registers is so that you can access the full 64-bit result of the multiplication. This is nice if you are someone who wants to multiply big numbers, but not nice if you’re implementing it in Factorio.

Factorio signals are all signed 32-bit integers. So there's no way to get a 64-bit product unless you do some clever math. The canonical way to do this is to split each input into two 16-bit values, and take the products in pairs so nothing overflows (plus some extra logic to handle carrying). Here’s the canonical implementation in C:

```
uint32_t a_lo = a & 0xFFFF;
uint32_t a_hi = a >> 16;
uint32_t b_lo = b & 0xFFFF;
uint32_t b_hi = b >> 16; 

uint32_t p0 = a_lo * b_lo;
uint32_t p1 = a_hi * b_lo;
uint32_t p2 = a_lo * b_hi;
uint32_t p3 = a_hi * b_hi;

uint32_t mid = p1 + p2;
uint32_t mid_carry = (mid < p1) ? 1 : 0;

uint32_t lo_result = p0 + (mid << 16);
uint32_t lo_carry = (lo_result < p0) ? 1 : 0;

uint32_t hi_result = p3 + (mid >> 16) + lo_carry + (mid_carry << 16);   
```

This is nice and all, but not very fast in Factorio. Combinators run in parallel, so if you can avoid dependent calculations, it all runs much faster. Also, this solution only works for positive numbers and requires logical shifts, which Factorio does not have.

The naive implementation would take 9 ticks to compute, which is super slow. The next slowest ALU operation is 2 ticks, so this adds 7 ticks to the overall clock speed, nearly halving the speed. So I made it a personal goal to implement `mult` in 3 ticks.

I found that 3 is possible but requires some truly disgusting optimizations. Let’s go over them.

First, we can do implicit additions. Combinators can have multiple inputs, so if they receive multiple signals of the same type, they are summed before being processed. This takes no additional time, so we can do simple additions in zero ticks if we are clever with the wiring. With some reshuffling of the algorithm to take advantage of this, I got it down to 4 ticks.

But that last tick was the hardest to shave off. Using some new features that allow conditional combinators to do multiple checks at once, I was able to have fewer computations on tick 4, but one of the carry calculations wasn’t moving.

To get the last tick removed, I had to do a ton of redundant but slightly different calculations in parallel to compute a bunch of offsets that are all designed to sum to the correct answer. Plus I also had to come up with a way to do a 1-tick logical shift operation by combining an arithmetic shift with a conditional and more of the zero-tick addition trick. After adding some additional logic to handle negative values and unsigned products, this is the final, truly vile, optimized 64-bit multiplication method:

```
// Tick 1 - Process each input in a bunch of ways
a_lo = a & 0xFFFF
a_shr = a >> 16
a_hi_corr = (a < 0) ? 65536 : 0
a_hi_pos = a & 0xFFFF0000

b_lo = b & 0xFFFF
b_shr = b >> 16  
b_hi_corr = (b < 0) ? 65536 : 0
b_hi_pos = b & 0xFFFF0000

neg_a = 0 - a
neg_b = 0 - b

// Tick 2 - Calculate products of subcomponents, summing inputs in ways that are equivalent to logical shifting
ll = a_lo * b_lo
hh = (a_shr + a_hi_corr) * (b_shr + b_hi_corr)
lh = a_lo * (b_shr + b_hi_corr)
hl = (a_shr + a_hi_corr) * b_lo

lh_shl = a_lo * b_hi_pos
hl_shl = a_hi_pos * b_lo

a_sign_corr = (a < 0) AND (is_signed > 0) ? neg_b : 0
b_sign_corr = (b < 0) AND (is_signed > 0) ? neg_a : 0

// Tick 3 - Find components that can sum to the answer, with some insanely messy logic comparisons to get something equivalent to an unsigned comparison
mid_shr_arith = (lh + hl) >> 16
mid_shr_corr = (lh + hl < 0) ? 65536 : 0

mid_ov_corr = ((lh < 0 AND lh + hl >= 0) OR (lh >= 0 AND lh + hl >= 0 AND mid < lh) OR (lh < 0 AND lh + hl < 0 AND mid < lh)) ? 0x10000 : 0
lo_ov_corr = ((ll < 0 AND ll + lh_shl + hl_shl >= 0) OR (ll >= 0 AND ll + lh_shl + hl_shl >= 0 AND ll + lh_shl + hl_shl < ll) OR (ll < 0 AND ll + lh_shl + hl_shl < 0 AND ll + lh_shl + hl_shl < ll)) ? 1 : 0

// Outputs - Uses zero-tick sum trick to compute immediately
lo = ll + lh_shl + hl_shl
hi = hh + mid_shr_arith + mid_shr_corr + mid_ov_corr + lo_ov_corr + a_sign_corr + b_sign_corr
```

There was a brief period of time where I actually understood what each part was doing, but writing this a couple days later I can say with confidence that time has passed.

All this is probably overkill. The MIPS spec was designed to handle multiplication taking multiple clock cycles to complete, so I could’ve used the unoptimized implementation without issue. But I do think the design is overall much more elegant this way. As weird as the actual computation is, it keeps the multiply instruction behaving the same as all the instructions. And I like that it avoids adding special cases.

Also, there's a part of me that loves the absurd complexity of an algorithm that is ultimately doing something very simple because it is so over-optimized for speed to be incomprehensible. It gives me the same feeling of a particularly arcane regex, or the [fast inverse square root algorithm](https://github.com/francisrstokes/githublog/blob/main/2024%2F5%2F29%2Ffast-inverse-sqrt.md).

# Side Quest: Binary Calculator

While making this processor, I ran into some difficulties with doing math in hex and with figuring out what integer values to use to mask specific bits. All online binary calculators are literally trash (if you know of a good one, please let me know. Google's search results are full of shitty form-based calculators). So I made a binary calculator to help with this.

![](assets/fips-butterfly.png)

I wanted something quick and simple that would support viewing values in base 10, 16, and 2 with convenient input methods for each. tbh I added more features than I should have (I didn't need to add bfloat16 support), but I figured I'd be using it for other projects in the future and maybe someone else might find it useful. I made it public so anyone can use it. Yes, anyone. Even you! The link is [here](https://anthonyedvalson.github.io/butterfly/)!

# Programming

To compile and load programs into the system, I made a Python script. In my first iteration, this was done using pyautogui to automatically click on the screen and type in instructions one by one. This wasn’t going to work for some of the longer programs I wanted to write, so I made a script that automatically compiles the assembly, converts the instructions to the relevant Factorio signals, and generates a blueprint that I could paste into the world easily.

Here's the result of my first test, where I compiled C code that generates the Fibonacci sequence, and it works!

![](assets/fips-fib.mov)
# Testing

I wanted to be more rigorous with this new iteration of the processor, so I had Claude write a few thousand lines of assembly to test every instruction's edge cases and write some simple algorithms.

These would check all the behaviors of every instruction and make sure they work as expected. If there was a problem, it would print an error code and halt execution so I could look at the registers and see what happened.

While doing this, I also developed a bunch of debugging tools that hooked into the processor internals. This included a system that shows the current and surrounding instructions, plus the ability to add breakpoints in execution. Here it is in action:

![](assets/fips-debug.mov)

# How to get it

If you want to try to mess around with the processor, I have a [GitHub repo](https://github.com/AnthonyEdvalson/Factorio-MIPS).

In it is the blueprint you can paste in, plus the scripts for compiling programs and the test scripts I used to verify all the instructions work.

# Wrapup

It was weird doing this project again so much later, but I'm glad I did. I hadn't realized all the flaws in the original design until I revisited it. I'm much happier with version two; the solutions are a lot simpler and cleverer. It's been interesting to see how my problem-solving has changed over time.

Maybe I'll revisit this project in another ten years and make a third version, but if I did, the big improvement would be to add pipelining so it runs even faster. I think I could get the clock speed up to 10 Hz with that.