const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class CabinetGame {
  constructor(kind, random = Math.random) {
    this.kind = kind;
    this.random = random;
    this.reset();
  }

  reset() {
    this.state = 'ready'; this.score = 0; this.lives = 3; this.elapsed = 0;
    this.x = .5; this.cooldown = 0; this.bullets = [];
    this.ball = { x: .5, y: .74, vx: .24, vy: -.48 };
    this.pong = { x: .5, y: .5, vx: .42, vy: .3, player: 0, cpu: 0, cpuY: .5 };
    this.bricks = Array.from({ length: 24 }, (_, i) => ({ x: .07 + (i % 8) * .112, y: .14 + Math.floor(i / 8) * .08, active: true }));
    this.targets = Array.from({ length: 18 }, (_, i) => ({ x: .13 + (i % 6) * .145, y: .16 + Math.floor(i / 6) * .1, active: true }));
    this.snake = [{ x: 7, y: 6 }, { x: 6, y: 6 }, { x: 5, y: 6 }];
    this.direction = { x: 1, y: 0 }; this.nextDirection = this.direction;
    this.food = { x: 11, y: 6 }; this.snakeClock = 0;
  }

  start() { if (this.state === 'over' || this.state === 'won') this.reset(); this.state = 'playing'; }

  turn(x, y) {
    if (this.kind !== 'snake' || Math.abs(x) + Math.abs(y) !== 1) return;
    if (x === -this.direction.x && y === -this.direction.y) return;
    this.nextDirection = { x, y };
  }

  update(delta, input = {}) {
    if (this.state !== 'playing') return;
    let remaining = Math.min(Math.max(0, delta), .25);
    while (remaining > .000001 && this.state === 'playing') {
      const dt = Math.min(remaining, 1 / 120);
      this.elapsed += dt;
      this.x = clamp(this.x + (input.x || 0) * dt * .75, .09, .91);
      if (this.kind === 'snake') this.updateSnake(dt);
      else if (this.kind === 'star') this.updateStar(dt, input.fire);
      else if (this.kind === 'pong') this.updatePong(dt, input);
      else this.updateBrick(dt);
      remaining -= dt;
    }
  }

  updateSnake(dt) {
    this.snakeClock += dt;
    if (this.snakeClock < .15) return;
    this.snakeClock -= .15;
    this.direction = this.nextDirection;
    const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };
    const eating = head.x === this.food.x && head.y === this.food.y;
    const body = eating ? this.snake : this.snake.slice(0, -1);
    if (head.x < 0 || head.x >= 16 || head.y < 0 || head.y >= 12 || body.some((part) => part.x === head.x && part.y === head.y)) {
      this.state = 'over'; return;
    }
    this.snake.unshift(head);
    if (!eating) this.snake.pop();
    else {
      this.score += 10;
      const free = [];
      for (let y = 0; y < 12; y++) for (let x = 0; x < 16; x++) if (!this.snake.some((part) => part.x === x && part.y === y)) free.push({ x, y });
      if (!free.length) this.state = 'won';
      else this.food = free[Math.floor(this.random() * free.length)];
    }
  }

  updateStar(dt, fire) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (fire && this.cooldown === 0) { this.bullets.push({ x: this.x, y: .84 }); this.cooldown = .2; }
    const offset = Math.sin(this.elapsed * .85) * .075;
    const descent = this.elapsed * .006;
    for (const bullet of this.bullets) {
      bullet.y -= dt * 1.05;
      const hit = this.targets.find((target) => target.active && Math.abs(bullet.x - target.x - offset) < .05 && Math.abs(bullet.y - target.y - descent) < .035);
      if (hit) { hit.active = false; bullet.y = -1; this.score += 100; }
    }
    this.bullets = this.bullets.filter((bullet) => bullet.y >= 0);
    if (this.targets.every((target) => !target.active)) this.state = 'won';
    else if (this.targets.some((target) => target.active && target.y + descent > .81)) this.state = 'over';
  }

  updatePong(dt, input = {}) {
    const pong = this.pong;
    pong.cpuY = clamp(pong.cpuY + clamp(pong.y - pong.cpuY, -.5, .5) * dt * 2.2, .16, .84);
    pong.x += pong.vx * dt; pong.y += pong.vy * dt;
    if (pong.y < .09 || pong.y > .91) { pong.y = clamp(pong.y, .09, .91); pong.vy *= -1; }
    const playerY = .86;
    if (pong.vy > 0 && pong.y >= playerY - .02 && pong.y <= playerY + .03 && Math.abs(pong.x - this.x) < .13) {
      pong.y = playerY - .02; pong.vy = -Math.abs(pong.vy) * 1.04; pong.vx = clamp(pong.vx + (pong.x - this.x) * 2.4, -.7, .7);
    }
    if (pong.vy < 0 && pong.y <= .16 && pong.y >= .11 && Math.abs(pong.x - .5) < .16) {
      pong.y = .16; pong.vy = Math.abs(pong.vy) * 1.03;
    }
    if (pong.y > .96) { pong.cpu++; this.servePong(-1); }
    if (pong.y < .05) { pong.player++; this.score += 100; this.servePong(1); }
    if (pong.player >= 5 || pong.cpu >= 5) {
      this.score += Math.max(0, pong.player - pong.cpu) * 20 + (pong.player >= 5 ? 100 : 0);
      this.state = pong.player >= 5 ? 'won' : 'over';
    }
    void input;
  }

  servePong(direction) {
    this.pong.x = .5; this.pong.y = .5;
    this.pong.vx = (this.random() - .5) * .6;
    this.pong.vy = .34 * direction;
  }

  updateBrick(dt) {
    const ball = this.ball;
    const previousY = ball.y;
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.x < .025 || ball.x > .975) { ball.x = clamp(ball.x, .025, .975); ball.vx *= -1; }
    if (ball.y < .065) { ball.y = .065; ball.vy = Math.abs(ball.vy); }
    const brick = this.bricks.find((item) => item.active && Math.abs(ball.x - item.x) < .06 && Math.abs(ball.y - item.y) < .035);
    if (brick) { brick.active = false; ball.vy *= -1; this.score += 50; }
    if (ball.vy > 0 && previousY <= .84 && ball.y >= .84 && Math.abs(ball.x - this.x) < .13) {
      ball.y = .839; ball.vy = -.48; ball.vx = (ball.x - this.x) * 3.2;
    }
    if (ball.y > 1) {
      this.lives--;
      if (!this.lives) this.state = 'over';
      else this.ball = { x: this.x, y: .73, vx: .24, vy: -.48 };
    }
    if (this.bricks.every((item) => !item.active)) this.state = 'won';
  }
}
