// Initialize Kaboom with canvas
kaboom({
    global: true,
    canvas: document.getElementById("game"),
    width: 800,
    height: 600,
    background: [135, 206, 235], // Sky blue background
    scale: 1,
    debug: true
})

// Mobile control state
let isMobileLeft = false;
let isMobileRight = false;
let isMobileJump = false;

// Setup mobile controls
document.addEventListener("DOMContentLoaded", () => {
    const leftBtn = document.getElementById("left-btn");
    const rightBtn = document.getElementById("right-btn");
    const jumpBtn = document.getElementById("jump-btn");

    // Left button
    leftBtn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        isMobileLeft = true;
    });
    leftBtn.addEventListener("touchend", () => {
        isMobileLeft = false;
    });

    // Right button
    rightBtn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        isMobileRight = true;
    });
    rightBtn.addEventListener("touchend", () => {
        isMobileRight = false;
    });

    // Jump button
    jumpBtn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        isMobileJump = true;
    });
    jumpBtn.addEventListener("touchend", () => {
        isMobileJump = false;
    });
});

// Load components
loadBean()

// Define game constants
const MOVE_SPEED = 400
const JUMP_FORCE = 850
const BALL_SPEED = 200
const TRIANGLE_SPEED = 250
const TOTAL_BALLS = 5
const TOTAL_TRIANGLES = 3
const TOTAL_COLLECTIBLES = TOTAL_BALLS + TOTAL_TRIANGLES

// Add game scene
scene("game", () => {
    // Set gravity
    setGravity(1600)

    // Game state
    let collectiblesGathered = 0
    let gameStartTime = time()
    let bestTime = null

    // Add score and timer display
    let score = 0
    const scoreText = add([
        text("Score: 0"),
        pos(30, 30),
        fixed(),
        { value: score }
    ])

    // Add timer display
    const timerText = add([
        text("Time: 0.0s"),
        pos(30, 60),
        fixed()
    ])

    // Add best time display (if exists)
    const bestTimeText = add([
        text(bestTime ? `Best: ${bestTime.toFixed(1)}s` : "Best: --"),
        pos(30, 90),
        fixed()
    ])

    // Add remaining collectibles counter
    const remainingText = add([
        text(`Remaining: ${TOTAL_COLLECTIBLES}`),
        pos(30, 120),
        fixed()
    ])

    // Update timer
    onUpdate(() => {
        const currentTime = time() - gameStartTime
        timerText.text = `Time: ${currentTime.toFixed(1)}s`
    })

    // Function to handle game completion
    function completeGame() {
        const finalTime = time() - gameStartTime
        
        // Update best time if this is better or first completion
        if (bestTime === null || finalTime < bestTime) {
            bestTime = finalTime
            bestTimeText.text = `Best: ${bestTime.toFixed(1)}s`
        }

        // Show completion message
        add([
            text(`Level Complete!\nTime: ${finalTime.toFixed(1)}s\nPress SPACE to restart`, {
                size: 32,
                width: width() - 100,
                align: "center"
            }),
            pos(width() / 2, height() / 2),
            anchor("center"),
            fixed(),
            "completion-message"
        ])

        // Listen for restart
        onKeyPress("space", () => {
            go("game")
        })
    }

    // Add player with face
    const player = add([
        rect(40, 40),
        pos(120, 80),
        area(),
        body(),
        color(255, 0, 0),
        "player",
        {
            // Add custom jump method
            jumpIfAble() {
                if (this.isGrounded()) {
                    this.jump(JUMP_FORCE)
                }
            },
            // Draw face on the player
            draw() {
                // Draw the base red square
                drawRect({
                    width: 40,
                    height: 40,
                    color: rgb(255, 0, 0),
                })
                
                // Draw eyes (white background)
                drawCircle({
                    pos: vec2(10, 15),
                    radius: 8,
                    color: rgb(255, 255, 255),
                })
                drawCircle({
                    pos: vec2(30, 15),
                    radius: 8,
                    color: rgb(255, 255, 255),
                })
                
                // Draw pupils (black)
                drawCircle({
                    pos: vec2(10, 15),
                    radius: 4,
                    color: rgb(0, 0, 0),
                })
                drawCircle({
                    pos: vec2(30, 15),
                    radius: 4,
                    color: rgb(0, 0, 0),
                })
                
                // Draw smile
                drawLine({
                    p1: vec2(10, 30),
                    p2: vec2(30, 30),
                    width: 2,
                    color: rgb(0, 0, 0),
                })
                drawLine({
                    p1: vec2(10, 30),
                    p2: vec2(10, 25),
                    width: 2,
                    color: rgb(0, 0, 0),
                })
                drawLine({
                    p1: vec2(30, 30),
                    p2: vec2(30, 25),
                    width: 2,
                    color: rgb(0, 0, 0),
                })
            }
        }
    ])

    // Function to spawn a triangle
    function spawnTriangle() {
        const startX = rand(50, width() - 50)
        const startY = rand(50, height() - 50)
        const dirX = rand(-1, 1) > 0 ? 1 : -1
        const dirY = rand(-1, 1) > 0 ? 1 : -1

        const triangle = add([
            rect(16, 16),
            pos(startX, startY),
            area(),
            "triangle",
            {
                speedX: TRIANGLE_SPEED * dirX,
                speedY: TRIANGLE_SPEED * dirY,
                draw() {
                    drawTriangle({
                        p1: vec2(0, -8),
                        p2: vec2(-8, 8),
                        p3: vec2(8, 8),
                        color: rgb(255, 192, 203),
                    })
                }
            }
        ])

        triangle.onUpdate(() => {
            triangle.move(triangle.speedX * dt(), triangle.speedY * dt())

            if (triangle.pos.x < 0 || triangle.pos.x > width()) {
                triangle.speedX *= -1
            }
            if (triangle.pos.y < 0 || triangle.pos.y > height()) {
                triangle.speedY *= -1
            }

            triangle.pos.x = Math.max(0, Math.min(width(), triangle.pos.x))
            triangle.pos.y = Math.max(0, Math.min(height(), triangle.pos.y))
        })
    }

    // Function to spawn a ball
    function spawnBall() {
        const startX = rand(50, width() - 50)
        const startY = rand(50, height() - 50)
        const dirX = rand(-1, 1) > 0 ? 1 : -1
        const dirY = rand(-1, 1) > 0 ? 1 : -1

        const ball = add([
            circle(15),
            pos(startX, startY),
            area(),
            "ball",
            color(255, 215, 0),
            {
                speedX: BALL_SPEED * dirX,
                speedY: BALL_SPEED * dirY,
                draw() {
                    drawCircle({
                        radius: 15,
                        color: rgb(255, 215, 0),
                    })
                    drawCircle({
                        pos: vec2(-5, -5),
                        radius: 5,
                        color: rgb(255, 235, 100),
                    })
                }
            }
        ])

        ball.onUpdate(() => {
            ball.move(ball.speedX * dt(), ball.speedY * dt())

            if (ball.pos.x < 0 || ball.pos.x > width()) {
                ball.speedX *= -1
            }
            if (ball.pos.y < 0 || ball.pos.y > height()) {
                ball.speedY *= -1
            }

            ball.pos.x = Math.max(0, Math.min(width(), ball.pos.x))
            ball.pos.y = Math.max(0, Math.min(height(), ball.pos.y))
        })
    }

    // Spawn initial objects
    for (let i = 0; i < TOTAL_BALLS; i++) {
        spawnBall()
    }
    for (let i = 0; i < TOTAL_TRIANGLES; i++) {
        spawnTriangle()
    }

    // Add platforms
    const platforms = [
        [400, 550, 400, 20],
        [300, 400, 120, 20],
        [600, 450, 120, 20],
        [100, 300, 120, 20],
        [400, 250, 120, 20],
        [200, 200, 120, 20],
    ]

    platforms.forEach(([x, y, width, height]) => {
        add([
            rect(width, height),
            pos(x, y),
            area(),
            body({ isStatic: true }),
            color(0, 255, 0),
        ])
    })

    // Player movement
    onUpdate(() => {
        // Handle keyboard controls
        if (isKeyDown("left") || isMobileLeft) {
            player.move(-MOVE_SPEED, 0)
        }
        if (isKeyDown("right") || isMobileRight) {
            player.move(MOVE_SPEED, 0)
        }
        if ((isKeyPressed("space") || isMobileJump) && player.isGrounded()) {
            player.jumpIfAble()
            isMobileJump = false  // Reset jump to prevent continuous jumping
        }
    })

    // Handle collisions
    onCollide("player", "ball", (p, b) => {
        destroy(b)
        score += 5
        collectiblesGathered++
        scoreText.text = `Score: ${score}`
        remainingText.text = `Remaining: ${TOTAL_COLLECTIBLES - collectiblesGathered}`
        
        if (collectiblesGathered >= TOTAL_COLLECTIBLES) {
            completeGame()
        }
    })

    onCollide("player", "triangle", (p, t) => {
        destroy(t)
        score += 10
        collectiblesGathered++
        scoreText.text = `Score: ${score}`
        remainingText.text = `Remaining: ${TOTAL_COLLECTIBLES - collectiblesGathered}`
        
        if (collectiblesGathered >= TOTAL_COLLECTIBLES) {
            completeGame()
        }
    })

    // Add boundaries
    add([
        rect(20, 600),
        pos(-10, 0),
        area(),
        body({ isStatic: true }),
        color(128, 128, 128),
    ])
    
    add([
        rect(20, 600),
        pos(790, 0),
        area(),
        body({ isStatic: true }),
        color(128, 128, 128),
    ])

    // Keep player in bounds and handle falling
    player.onUpdate(() => {
        if (player.pos.y > height() + 40) {
            player.pos.x = 120
            player.pos.y = 80
            player.vel.y = 0
        }
    })
})

// Start the game
go("game") 