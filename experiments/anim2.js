let meatballs = [];

window.addEventListener('load', () => {
    let anim = document.getElementById('anim');
    if (!anim) {
        return;
    }
    let ctx = anim.getContext('2d');
        
    if (window.devicePixelRatio > 1) {
        var canvasWidth = anim.width;
        var canvasHeight = anim.height;

        anim.width = canvasWidth * window.devicePixelRatio;
        anim.height = canvasHeight * window.devicePixelRatio;
        anim.style.width = canvasWidth + "px";
        anim.style.height = canvasHeight + "px";

        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    setup();

    loop(ctx, anim.width / window.devicePixelRatio, anim.height / window.devicePixelRatio);
});

function setup() {
    for (let i = 0; i < 10; i++) {
        let x = Math.random() * 150 - 75;
        let y = Math.random() * 150 - 75;
        let z = Math.random() * 150 - 75;

        let size = 50 + Math.random() * 50;

        let xvel = Math.random() * 50 - 25;
        let yvel = Math.random() * 50 - 25;
        let zvel = Math.random() * 50 - 25;

        let color = i === 0 ? [0, 5, 0] : [1, 1, 1];
        let g = i === 0 ? -1 : 1;

        let meatball = new Meatball(x, y, z, size, xvel, yvel, zvel, color, g);

        meatballs.push(meatball);
    }
}

function loop(ctx, w, h) {
    let lastTime = 0;
    let bounds = 150;

    function frame(time) {
        let dt = Math.min(100, time - lastTime);
        lastTime = time;

        update(dt / 1000, bounds - 50);
        draw(ctx, w, h, bounds);

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

function update(dt, bounds) {
    for (let meatball of meatballs) {
        meatball.move(dt, bounds);
    }
    for (let meatball of meatballs) {
        meatball.gravity(dt, meatballs);
    }
}

function draw(ctx, w, h, bounds) {
    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let resolution = 11;
    let gap = 3;

    for (let sy = 0; sy <= h - resolution; sy += resolution) {
        for (let sx = 0; sx <= w - resolution; sx += resolution) {
            let x = lerp(-bounds, bounds, sx / w)
            let y = lerp(-bounds, bounds, sy / h)
            let [color, hit] = rayMarch(meatballs, x, y);

            // shade = Math.max(50, Math.min(255, shade * 255));
            color[0] = Math.max(0, Math.min(1, color[0])) * 255;
            color[1] = Math.max(0, Math.min(1, color[1])) * 255;
            color[2] = Math.max(0, Math.min(1, color[2])) * 255;

            // alpha is 0.3 to simulate temporal antialiasing
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`;
            ctx.fillRect(sx, sy, resolution - gap, resolution - gap);
        }
    }
}

function rayMarch(meatballs, x, y) {
    // Poor man's dithering
    x += Math.random() * 2 - 1;
    y += Math.random() * 2 - 1;
    let z = -100;
    let dx = 0;
    let dy = 0;
    let dz = 1;
    let step = 1;
    let maxSteps = 200;
    for (let i = 0; i < maxSteps; i++) {
        let [density, color] = getDensity(meatballs, x, y, z);
        if (density > 0.2) {
            normal = [
                getDensity(meatballs, x + 0.1, y, z)[0] - density,
                getDensity(meatballs, x, y + 0.1, z)[0] - density,
                getDensity(meatballs, x, y, z + 0.1)[0] - density
            ];
            let normalLength = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
            normal[0] /= normalLength;
            normal[1] /= normalLength;
            normal[2] /= normalLength;
            let light = [0.707, 0.707, 0];
            let dot = normal[0] * light[0] + normal[1] * light[1] + normal[2] * light[2];
            let shade = Math.max(0, dot * 0.5);
            let softShade = Math.max(0, dot * 0.25 + 0.25);
            shade = lerp(shade, softShade, 0.2);

            // specular
            let view = [dx, dy, dz];
            let reflect = [
                2 * normal[0] * dot - light[0],
                2 * normal[1] * dot - light[1],
                2 * normal[2] * dot - light[2]
            ];
            let spec = Math.max(0, view[0] * reflect[0] + view[1] * reflect[1] + view[2] * reflect[2]);
            spec = Math.pow(spec, 10);
            shade += spec;

            // Add fresnel effect
            let dotView = normal[0] * dx + normal[1] * dy + normal[2] * dz;
            let fresnel = Math.pow(1 - dotView, 3);
            shade = lerp(shade, 0.2, fresnel);

            // Noise
            // shade += Math.random() * 0.05 - 0.025;

            let shadedColor = [
                color[0] * shade,
                color[1] * shade,
                color[2] * shade
            ];

            // Gamma correction
            shadedColor[0] = Math.pow(shadedColor[0], 1 / 2.2);
            shadedColor[1] = Math.pow(shadedColor[1], 1 / 2.2);
            shadedColor[2] = Math.pow(shadedColor[2], 1 / 2.2);

            return [shadedColor, true];
        }
        x += dx * step;
        y += dy * step;
        z += dz * step;
    }
    return [[0.1, 0.1, 0.1], false];
}

function getDensity(meatballs, x, y, z) {
    let sum = 0;
    let color = [0, 0, 0];
    for (let meatball of meatballs) {
        let dx = meatball.x - x;
        let dy = meatball.y - y;
        let dz = meatball.z - z;
        let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        let weight = meatball.size / (dist * dist + 1);
        sum += weight;
        color[0] += meatball.color[0] * weight;
        color[1] += meatball.color[1] * weight;
        color[2] += meatball.color[2] * weight;
    }
    color[0] /= sum;
    color[1] /= sum;
    color[2] /= sum;
    return [sum, color];
}

class Meatball {
    constructor(x, y, z, size, xvel, yvel, zvel, color, g) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = size;
        this.xvel = xvel;
        this.yvel = yvel;
        this.zvel = zvel;
        this.color = color;
        this.g = g;
    }

    move(dt, bounds) {
        this.x += this.xvel * dt;
        this.y += this.yvel * dt;
        this.z += this.zvel * dt;
        let friction = 0.01;
        this.xvel = lerp(this.xvel, 0, dt * friction);
        this.yvel = lerp(this.yvel, 0, dt * friction);
        this.zvel = lerp(this.zvel, 0, dt * friction);

        if (this.x < -bounds) {
            this.x = -bounds;
            this.xvel = -this.xvel;
        }
        if (this.x > bounds) {
            this.x = bounds;
            this.xvel = -this.xvel;
        }
        if (this.y < -bounds) {
            this.y = -bounds;
            this.yvel = -this.yvel;
        }
        if (this.y > bounds) {
            this.y = bounds;
            this.yvel = -this.yvel;
        }
        if (this.z < -bounds) {
            this.z = -bounds;
            this.zvel = -this.zvel;
        }
        if (this.z > bounds) {
            this.z = bounds;
            this.zvel = -this.zvel;
        }
    }

    gravity(dt, meatballs) {
        let g = this.g;
        for (let meatball of meatballs) {
            if (meatball === this) {
                continue;
            }
            let g2 = meatball.g;
            let dx = meatball.x - this.x;
            let dy = meatball.y - this.y;
            let dz = meatball.z - this.z;
            let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            let dirx = dx / dist;
            let diry = dy / dist;
            let dirz = dz / dist;
            let force = meatball.size / (dist * dist + 100) * 50 * g * g2;
            this.xvel += dirx * force * dt;
            this.yvel += diry * force * dt;
            this.zvel += dirz * force * dt;
        }
    }
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}