console.log(gsap)
const canvas = document.
    querySelector('canvas')

const scoreElement = document.getElementById("scoreElement") // The score element which shows the score
const startGameBtn = document.getElementById("startGameBtn")
const modalElement = document.getElementById("modalElement")
const bigScoreElement = document.getElementById("bigScoreElement")
const c = canvas.getContext('2d')   // canvas context

canvas.width = innerWidth
canvas.height = innerHeight

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius 
        this.color = color
    }

    draw() {
        c.beginPath()  // to start drawing
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)  // creates the player circle
        c.fillStyle = this.color  // gives the circle color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity 
    }
    draw() {
        c.beginPath()  // to start drawing
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)  // creates the player circle
        c.fillStyle = this.color  // gives the circle color
        c.fill()
    }
    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity 
    }
    draw() {
        c.beginPath()  // to start drawing
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)  // creates the player circle
        c.fillStyle = this.color  // gives the circle color
        c.fill()
    }
    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1 
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()  // to start drawing
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)  // creates the player circle
        c.fillStyle = this.color  // gives the circle color
        c.fill()
        c.restore()
    }
    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []

function init() {
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreElement.innerHTML = score
    bigScoreElement.innerHTML = score
}

function spawnEnemies(){
    setInterval(() => {
        const rad = 5 + Math.random() * 25
        let x , y;
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - rad: canvas.width + rad
            y = Math.random() * canvas.height
        }   
        else {
            y = Math.random() < 0.5 ? 0 - rad: canvas.height + rad
            x = Math.random() * canvas.width
        }
        const hue = Math.random() * 360  // ranges from 0 to 360
        const col = "hsl("+hue+", 50%, 50%)" // hue saturation lightness
        const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x)
        const vel = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, rad, col, vel))
    }, 1000)
}

let animationId
let score = 0
function animate(){
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)' // gives fade effect to the elements
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    projectiles.forEach((projectile, proindex) =>{
        projectile.update()
        setTimeout(() => {  // setTimeout removes the flashing effect when deleting the element
            // Removes the useless projectile that are offscreen
            if(projectile.x < 0 - projectile.radius || 
                projectile.x > canvas.width + projectile.radius ||
                projectile.y < 0 - projectile.radius || 
                projectile.y > canvas.height + projectile.radius
            )
                projectiles.splice(proindex, 1)
        }, 0)


    })
    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            setTimeout(() => {
                particles.splice(index, 1)
            })
        }else {
            particle.update()
        }
    })
    enemies.forEach((enemy, index) => {
        enemy.update()
        projectiles.forEach((projectile, proindex) =>{
            // checks if the enemy is hit 
            if (Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y) <= enemy.radius + projectile.radius){
                       
                // for creating explosion
                for(let i = 0; i < enemy.radius*2 ; i++){
                    particles.push(new Particle(projectile.x, projectile.y, Math.random()*2+1, enemy.color, {x: (Math.random() - 0.5)*(Math.random()*8), y: (Math.random() - 0.5)*(Math.random()*8)}))
                }
                setTimeout(() => {
                    if (enemy.radius - 10 > 5)
                    {
                        // increase the score
                        score += 100 
                        scoreElement.innerHTML = score  
                        // enemy.radius = enemy.radius - 10    
                        // To get the smooth transition effect
                        gsap.to(enemy, {
                            radius: enemy.radius - 10
                        })
                    }
                    else{
                        // increase the score
                        score += 250 
                        scoreElement.innerHTML = score 
                        enemies.splice(index, 1)
                    }
                    projectiles.splice(proindex, 1)
                }, 0)
            }
        })
        // Ends the game 
        if (Math.hypot(player.x - enemy.x, player.y - enemy.y) <= enemy.radius + player.radius){
            setTimeout(() => {
                console.log("player is hit!")
                cancelAnimationFrame(animationId)
                bigScoreElement.innerHTML = score
                modalElement.style.display='flex'  // gets the makes the floating display visible
            }, 0)
        }
    })
}

addEventListener('click', (event) => {
    // We need the angle betw the center of the screen and the mouse. Here we get it in rad.
    const angle = Math.atan2(event.clientY - canvas.height/2, event.clientX - canvas.width/2)
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
})

startGameBtn.addEventListener('click', () => {
    init()
    modalElement.style.display='none'  // removes the floating box
    animate()
    spawnEnemies()
})