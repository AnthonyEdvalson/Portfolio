---
color: orange
width: 4
code: PRJ.065
title: MIPS in Factorio
category: Project
subtitle: Creating a microprocessor in a video game
date: "2019"
---
> INCOMPLETE

In college I took a class on computer architecture, and it was by far my favorite class. Mostly because it was a side of CS I had almost no exposure to up until that point. And with me, when I learn about something cool and interesting, I turn it into a project. So, I decided to make a MIPS compliant processor in Factorio.

[MIPS](https://en.wikipedia.org/wiki/MIPS_architecture) is mostly dead these days (ARM has replaced it) but it used to be a very popular instruction set. It's nice because it's a very old instruction set so there's a lot of compromises made to make the silicon (or in this case, Factorio combinators) easier to design. And since it used to be popular, there's a lot of compilers that still support it.

So, I realized if I implemented the processor in Factorio, I could compile and run C++ code on it which would be a lot of fun. It's particularly meta because Factorio is written in C++.

Also, I'm going to assume that if you're reading obscure developer portfolio websites like this one that you know what Factorio is. If you haven't played it I can't recommend it enough. But all you need to know for this project is that you can create circuits that do simple operations like add, subtract, and compare.

> Note: this was before Factorio 2.0, so I didn't have any of the improvements to combinators or selectors when making this, it probably could be made a lot simpler and faster now.

---



- Memory
- Registers
- Control
- ALU
- Some videos / gifs would be nice

- Made a script to compile C code to MIPS and manually enter in the commands


# Does it really work?

Yep! But very slowly. I didn't implement pipelining because I don't hate myself so it runs at 2hz, over 1/2,000,000,000 the speed of a modern processor!

But it does work, I wrote a script that generates the Fibonacci sequence in C++, compiled it, and wrote a script to import the assembly to Factorio. And surprisingly it worked just fine! (although you have to manually inspect memory to see the output)

Theoretically you could use this in an actual Factorio base to control production of resources, but it would be pretty slow and complete overkill. At that point you should just install one of the many mods that adds actual computers to the game.