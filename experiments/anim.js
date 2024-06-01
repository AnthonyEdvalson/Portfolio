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

    loop(ctx);
});

function setup() {
    for (let i = 0; i < 20; i++) {
        let x = Math.random() * 150 - 75;
        let y = Math.random() * 150 - 75;
        let z = Math.random() * 150 - 75;

        let size = 100 + Math.random() * 60;

        let xvel = 0;
        let yvel = 0;
        let zvel = 0;

        let meatball = new Meatball(x, y, z, size, xvel, yvel, zvel);

        meatballs.push(meatball);
    }
}

function loop(ctx) {
    let lastTime = 0;

    function frame(time) {
        let dt = time - lastTime;
        lastTime = time;

        update(dt / 1000);
        draw(ctx);

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

function update(dt) {
    for (let meatball of meatballs) {
        meatball.move(dt);
    }
    for (let meatball of meatballs) {
        meatball.gravity(dt, meatballs);
    }
}

function draw(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let bounds = 150;
    let resolution = 5;

    // let [density, paths] = meatballSlice(meatballs, 0, bounds, resolution);
    // renderSlice(ctx, density, paths, resolution);
    // return;

    for (let y = bounds; y > -bounds; y -= resolution / 2) {
        let [density, paths] = meatballSlice(meatballs, y, bounds, resolution);
        renderSlice(ctx, density, paths, resolution);
    }
}

function meatballSlice(meatballs, y, bounds, step) {
    // Use marching squares to get the contour of the combined meatballs.
    // Then get the path of the contour.

    let density = [];
    for (let x = -bounds; x < bounds; x += step) {
        density.push([]);
        for (let z = -bounds; z < bounds; z += step) {
            let sum = 0;
            for (let meatball of meatballs) {
                let dx = meatball.x - x;
                let dy = meatball.y - y;
                let dz = meatball.z - z;
                let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                sum += meatball.size / (dist * dist + 1);
            }
            density[density.length - 1].push(sum);
        }
    }

    function t(x, y, z) {
        return [x * step, z * step * 0.7 + y * step * 0.075];
        // return [x * step, z * step];
    }

    let edges = new Map();
    let edgePath = new Path2D();
    for (let x = 0; x < density.length - 1; x++) {
        for (let z = 0; z < density[x].length - 1; z++) {
            let threshold = 0.5;
            let ad = density[x][z];
            let bd = density[x + 1][z];
            let cd = density[x][z + 1];
            let dd = density[x + 1][z + 1];
            let a = ad > threshold;
            let b = bd > threshold;
            let c = cd > threshold;
            let d = dd > threshold;
            let i = (d << 3) + (c << 2) + (b << 1) + a;
            if (i === 0 || i === 15) {
                continue;
            }
            
            let interp = (a, b) => (threshold - a) / (b - a);

            let abi = [interp(ad, bd), 0];
            let aci = [0, interp(ad, cd)];
            let bdi = [1, interp(bd, dd)];
            let cdi = [interp(cd, dd), 1];

            let ps = {
                0b0001: [abi, aci],
                0b1110: [aci, abi],

                0b0010: [bdi, abi],
                0b1101: [abi, bdi],

                0b0011: [bdi, aci],
                0b1100: [aci, bdi],

                0b0100: [aci, cdi],
                0b1011: [cdi, aci],
                
                0b0101: [abi, cdi],
                0b1010: [cdi, abi],

                0b0110: [bdi, abi, aci, cdi],
                0b1001: [abi, aci, cdi, bdi],

                0b0111: [bdi, cdi],
                0b1000: [cdi, bdi],
            }[i];


            // edgePath.moveTo(...t(x + ps[0][0], y, z + ps[0][1]));
            // edgePath.lineTo(...t(x + ps[1][0], y, z + ps[1][1]));
            // // edgePath.lineTo(...t(x + 0.5, y, z + 0.5));
            // if (ps.length > 2) {
            //     edgePath.moveTo(...t(x + ps[2][0], y, z + ps[2][1]));
            //     edgePath.lineTo(...t(x + ps[3][0], y, z + ps[3][1]));
            // }
            let k0 = [ps[0][0] + x, ps[0][1] + z].join(',');
            let k1 = [ps[1][0] + x, ps[1][1] + z].join(',');
            edges.set(k0, [[ps[0][0] + x, ps[0][1] + z], [ps[1][0] + x, ps[1][1] + z], k1]);
            if (ps.length > 2) {
                let k2 = [ps[2][0] + x, ps[2][1] + z].join(',');
                let k3 = [ps[3][0] + x, ps[3][1] + z].join(',');
                edges.set(k2, [[ps[2][0] + x, ps[2][1] + z], [ps[3][0] + x, ps[3][1] + z], k3]);
            }

            for (let p of ps) {
                if (p[0] < 0 || p[0] > 1 || p[1] < 0 || p[1] > 1) {
                    console.log('bad!', i, p);
                }
            }
        }
    }
    edgePath.closePath();
    let paths = [edgePath];

    // Make continuous paths by moving along adjacent edges.
    while (edges.size > 0) {
        let startKey = edges.keys().next().value;
        let currentKey = startKey;
        let fillPath = new Path2D();
        let [p0, p1, nextKey] = edges.get(currentKey);
        fillPath.moveTo(...t(p0[0], y, p0[1]));
        while (true) {
            [p0, p1, nextKey] = edges.get(currentKey);
            edges.delete(currentKey);
            fillPath.lineTo(...t(p1[0], y, p1[1]));
            if (nextKey === startKey) {
                break;
            }
            currentKey = nextKey;
        }

        fillPath.closePath();
        paths.push(fillPath);
    }

    return [density, paths];
}

function renderSlice(ctx, density, paths, resolution) {
    // for (let x = 0; x < density.length; x++) {
    //     for (let z = 0; z < density[x].length; z++) {
    //         let value = density[x][z];
    //         let color = Math.floor(value * 128);
    //         ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
    //         ctx.fillRect(x * resolution, z * resolution, resolution, resolution);
    //     }
    // }

    // Scale the path to the resolution.
    ctx.lineWidth = 0.5;
    for (let i = 0; i < paths.length; i++) {
        let color = getComputedStyle(ctx.canvas).getPropertyValue("--accent");
        ctx.strokeStyle = getComputedStyle(ctx.canvas).getPropertyValue("--base");
        ctx.fillStyle = color;
        ctx.fill(paths[i]);
        ctx.stroke(paths[i]);
    }

}

class Meatball {
    constructor(x, y, z, size, xvel, yvel, zvel) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = size;
        this.xvel = xvel;
        this.yvel = yvel;
        this.zvel = zvel;
    }

    move(dt) {
        this.x += this.xvel * dt;
        this.y += this.yvel * dt;
        this.z += this.zvel * dt;
        let friction = 0.025;
        this.xvel = lerp(this.xvel, 0, dt * friction);
        this.yvel = lerp(this.yvel, 0, dt * friction);
        this.zvel = lerp(this.zvel, 0, dt * friction);
    }

    gravity(dt, meatballs) {
        for (let meatball of meatballs) {
            if (meatball === this) {
                continue;
            }
            let dx = meatball.x - this.x;
            let dy = meatball.y - this.y;
            let dz = meatball.z - this.z;
            let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            let dirx = dx / dist;
            let diry = dy / dist;
            let dirz = dz / dist;
            let force = meatball.size / (dist * dist + 100) * 50;
            this.xvel += dirx * force * dt;
            this.yvel += diry * force * dt;
            this.zvel += dirz * force * dt;
        }
    }
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}