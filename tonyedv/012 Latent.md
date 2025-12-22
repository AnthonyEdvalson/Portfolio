---
color: orange
width: 5
height: 3
code: PRJ.077
title: Latent
category: Project
subtitle: Generative Ambient Music
chip: latent
---
Generative AI is really cool. A number of models like [Stable Diffusion](https://stability.ai/blog/stable-diffusion-public-release) or [Midjourney](https://www.midjourney.com/home/) have popped up around image generation due to the new developments in model architectures, and massive image datasets with descriptions to train those architectures. However, music has had a harder time catching on. Music tends to be more structured than images, is more information dense, and datasets are hard to come by due to strict copyright enforcement by music distributors.

Although there's a few passable music models out there now, there was not in 2022. At the time the models were very impressive, but a long ways off from generating music that anyone would want to listen to. Researchers seemed to be trying to solve the “Text to Music” problem, which is very difficult given how varied different music genres are. So instead I wanted to solve the “Make Music That Someone Would Actually Listen To” problem, which I believed could be done on consumer hardware and standard ML techniques. Latent is a proof of concept for this.

The biggest change I made in my approach is that I only consider generating songs that are easy to generate. Songs with vocals, many instruments, and complex structures are what cause modern generative music systems to break down. So I’m avoiding them entirely by focusing on ambient music. 

Ambient is a genre of music that focuses entirely on the "texture" of the sounds, instead of the words, melodies, or structures. It's a genre characterized by a lack of temporal structure, which makes it much easier to work with.

# Design

The core of Latent is a [Variational AutoEncoder](https://en.wikipedia.org/wiki/Variational_autoencoder) (VAE). VAEs are good at taking input data, and embedding it. What I’m doing with the VAE is making an encoder for timbre space. Timbre is the music term for the texture of a sound, it’s what makes a note played on a piano sound different from the same note on a guitar. If I can represent timbres as a space, then a song can be represented as a path through that space, changing over time.

But first, the VAE requires data. So, I manually curated ~15,000 ambient music songs to pick the ones with good quality, and were suitable for timbre extraction. They mostly were obtained from scouring ambient music playlists on Spotify. I threw them all into my own playlist for later analysis (actually, I had to put them in two playlists, apparently Spotify has an 11,000 song limit on them). Each song had 3 samples extracted from it at different times, so 45,000 datapoints.

> 2025 Note: I don’t love that this is how I obtained the data for this project. I did it this way because this is just for personal learning and research. Also the concerns around copyright and AI weren’t a big thing in 2022. I don’t plan on ever releasing model weights or a dataset, but if I did I would’ve considered different data collection methods, and in the future I'll avoid scraping copyrighted work, even if it is just for myself.

All the samples were manually inspected to ensure they were actually good, lots of datapoints had "transients" which is a catch-all term for drums and things that start abruptly. These get mangled in my dimensionality reduction systems and are explicitly not what I'm trying to model. So I listened to 45,000 audio clips and hacked up a tinder-like swiping system to keep or reject them.

All the good samples were put through dimensionality reduction. I could have just taken each audio clip and thrown it into the VAE, but each sample contains 176k data points. With only 45k samples, overfitting is likely. To overcome this I reduced the dimensionality of the data using standard signal processing techniques before any ML.

## Dimensionality Reduction

This was a fun mini-project to see just how much I can compress the sounds without any ML. The goal was to turn a 2 second stereo sound clip (176,400 values) into as few parameters as possible, without losing a significant amount of information.

When making the system, my first realization was that if we only want to model timbre, then we don’t care at all about things changing over time. The only thing that matters is the frequencies of the sound. This kind of thing is perfect for the [Fast Fourier Transform](https://en.wikipedia.org/wiki/Fast_Fourier_transform) (FFT). The FFT essentially extracts the frequencies that make up a sound, and lets you work with the frequencies instead of individual samples in time. 

![](assets/latent-fft.png)

After applying the FFT, it's easy to throw out lots of information. First, is the phase information. This essentially throws out the data that tells when sounds start or end, which makes up half of the coefficients produced by the FFT. This turns the audio into a monotonous drone, which is fine because the original sound should already be a droning sound. This is equivalent to applying a heavy reverb to the audio. All the same sounds are there, but they're smeared out over time.

Next, we can also throw out stereo audio, because the drone in the right ear is probably the same as the left.

Lastly, we can throw out most of the high frequency data. The FFT gives us intensity of each frequency from 0 hz to 22,050 hz, with 0.5 hz increments. This is a good resolution for low frequencies, but human perception of pitch is logarithmic. The difference between 20hz and 20.5hz is audible, but the difference between 20,000hz and 20,000.5hz is inaudible. So, I resampled to combine many of the high frequencies that are indistinguishable. This is called the [CQT](https://en.wikipedia.org/wiki/Constant-Q_transform), it's the same as FFT but with log scaled frequencies.

Then, the values are converted to decibels and fit into the range 0 to 1, since that gives a perceptually linear output, which makes the loss functions align with human hearing.

![](assets/latent-fft2.png)

This takes the data from 176,400 audio samples all the way down to 1,233 values, a 99.5% reduction. For most audio clips, there is no audible difference in the sound after being compressed in this way.

I later learned this is basically what [MP3](https://en.wikipedia.org/wiki/MP3#Encoding_and_decoding) does to compress audio: use Fourier transforms along with [psychoacoustic](https://en.wikipedia.org/wiki/Psychoacoustics) optimizations. The main difference is that it can handle changing sounds, but the underlying principles are the same.

## VAE

1,233 values is small enough for us to work with, and the reduced dimensionality means that training the model doesn't take long at all, making experimentation quick and easy. Here is the general structure:

![](assets/latent-model.png)

- `UPSAMPLE(X, Y)` means that it is upsampling to X times larger, and padding with Y zeros.
- All `CONV_1D` layers use same size padding.
- The `ENCODE_BLOCK` is just a [ResNet block](https://d2l.ai/chapter_convolutional-modern/resnet.html) modified to work with one dimensional data. The `DECODE_BLOCK` is the same, but with inverse (transposed) convolutions. The last of each encode / decode block omits the skip connection.

The left column is the encoder, it takes our 1233 parameters describing the sound, and compresses it into a 32 dimensional vector. On the right is the decoder, which does the inverse.

Since this is a VAE, the encoder outputs both a mean (μ) and log-variance (σ). When training, these are used to sample a point in a normal distribution with the given mean and log-variance, but at inference, the variance is set to 0 to remove noise. 

The loss function is a combination of [KL divergence](https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence), which tries to give the latent space nice properties, like being centered at 0, and preventing values to collapse. The loss function also uses mean squared error to make sure the encoder and decoder are accurately encoding and decoding the data.

Training is incredibly fast since the input size is already very small. It only takes a few minutes to process all the samples. Once trained, the encoder can be used to map from any sound, to a timbre vector, and back. Inference is also very quick, which is great because a lot of samples are needed during song generation.

# Song Generation

On its own, the VAE just lets us make a monotonous sound, but not a song. So I added a system that would draw a path in sound space. This could have been done using machine learning, but I found it was unnecessary. A bunch of points are sampled at random, and then are ranked based on some criteria. This criteria varies depending on the desired tone, I change it every time I make an album. I usually rank by pitch, volume, or weirdness (distance from the origin in latent space). From all of the samples, it picks five of the sounds, and repeats them in a structured way. The song is then generated using iterative symbol substitutions

The song structure starts with the symbol `S` which is then iteratively expanded on using the following rules, selected at random

```
S => XYXZ
S => XYZZ
S => XZYZ
S => YXYZ
S => YXZY
S => YZXZ
S => YZYZ
S => ZXYZ
S => ZXZY
S => ZYXZ
X => AABBAABB
X => ABABAB
Y => CDCD
Y => CCDD
Z => E
Z => EE
```

To give an example, let's say a song picked these transformations:

```
S => XZYZ
X => ABABAB
Y => CCDD
Z => E
```

Then applying each rule gives `S => XZYZ => ABABABZYZ => ABABABZCCDDZ => ABABABECCDDE`. The resulting song pattern `ABABABECCDDE` says which of the five sounds to use, and for how long. In this case, we start by going back and forth between the first two sounds (A and B), use point E to transition into a section where C and D alternate slowly, before going back to E at the end. 

This is basically a [context free grammar](https://en.m.wikipedia.org/wiki/Context-free_grammar) but it’s being used to generate structure instead of parsing it, which gives a lot of flexibility and is very easy to modify.

This gives us a path through the latent space to make our song. However, the songs generated by this method tend to be pretty boring. Mostly because a 4 minute song with 12 steps has 20 seconds for each step. In other words, the music is just slowly changing sounds every 20 seconds. Although there's a few ambient songs that are [quite literally a single sound for 10 minutes](https://open.spotify.com/track/6y5pnIlIf86X5I6VCgqQhx?si=ae10f3f979a54547), they're the exception, and I'd like a little more variation.

So, we can spice it up with a tool I call "the wiggler". The wiggler takes the straight lines between points in timbre space, and coils it into a helix, giving it constant variation. The wiggling process is simple, it picks two random vectors, multiplies by sin(t) and cos(t) respectively, and adds them to the original path. 

> Side note: Technically, this doesn't guarantee a helix. If the random vectors are pointing in the same direction then it will move in a straight line instead of a circle. But a neat thing about high dimensional spaces is that random vectors are almost guaranteed to be at right angles to one another, so this isn't a major concern.

Finally, points on the coiled path are sampled for every 1-2 seconds in the song. Each sample point in timbre space is translated into an audio clip, which is then smoothly blended to produce the final audio. There's a bit of additional processing, like fading in and out, and normalizing the volume, but then we have our audio.

## Effects

Sometimes, the songs need a little bit more variation, and that can come from layering some nature sounds on top. This is common practice with ambient music, since it gives some nice variation to the sounds. 

I first tried generating these procedurally, and even made a whole framework for making procedural sound effects, but I wasn't happy with the quality in the end. So, instead I pulled some creative commons audio from [freesound](https://freesound.org/). I collected a few dozen nature sounds like wind, rain, thunder, and waves that were good quality and were in the Creative Commons.

I made a simple script to load these sounds in, make them loop seamlessly, adjust their volume to be -30 LUFS, and remove any fading in or out the original clip had.

Then, when a song is generated, it slowly transitions between similar effects. It adds some nice variation and makes it feel less artificial. Once the effects are layered on top of the song, then it's good to go.

# Generating Albums

To generate a ~15 song album, I tend to generate around 50 songs, and quickly skim through them to see if they're any good. The VAE isn't perfect, and occasionally produces sounds that are too loud or weird, so they have to be removed. This takes about half an hour. After this, I usually have 30 that I find good and interesting. I'll give these a more thorough listening while I'm doing other work, cutting the ones that I don't like, and giving names to the ones I do. I'll also manually clean up the audio as necessary.

# Results


See for yourself! 

<audio controls>  
<source src="assets/shoreline.flac" type="audio/flac">  
Your browser does not support the audio element.  
</audio>

This one is my personal favorite. In my opinion, it's not as good as a lot of the human made stuff, but I'm pretty happy with the results. I've made 4 albums so far, and listen to them from time to time. I was definitely surprised with the variety of sounds you can get out of it, some are more meditative, others are closer to dark ambient music.

My goal was to make music that someone could listen to, and I think I accomplished that. I had a lot of fun messing with signal processing, and working with VAEs. I think the most interesting part is that the model isn't generating music, it's generating a model of timbre, and that gets used to create the music. That means you spend a lot of time focusing on improving the quality of timbre space, which is an interesting challenge.

Over the years, much more sophisticated music generation models have come out, but I still enjoy how simple and lightweight my solution was.