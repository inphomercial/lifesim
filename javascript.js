// started aug 13 2011


///////// EVENT LISTNER STUFF ////////////////////////////////////
// creating our keys array

var keys = new Array();

// event Listeners
// window.addEventListener( type, listener, useCapture )
// type String : The type of event to add.
// listener : EventListener The EventListener function to be invoked.
// useCapture : boolean When true, indicates all events of the specified type to the registered EventListener before being dispatched to any EventTarget objects beneath the given node in the tree. Bubbling events will not trigger the EventListener.

//When false, this method dispatches events of the specified type to the registered EventListener before being dispatched to any EventTarget objects above the given node in the tree.

window.addEventListener('keydown', keyDown, true);
window.addEventListener('keyup', keyUp, true);

// trying to pause
function keyDown(e) {
	if(e.keyCode == 80)
	{
		document.getElementById("gameInfo3").innerHTML = "P A U S E D";
		pauseGame();
	}
}
function keyUp(e) {
	if(e.keyCode == 80)
	{
		document.getElementById("gameInfo3").innerHTML = "U N P A U S E D";
		unPauseGame();
	}
}

///////////// EVENT LISTENER STUFF ////////////////////////


// Setting up globals

// nulling our canvas/context
var context2D = null;
var canvas = null;

// canvas size
var width = 600;
var height = 600;

// game loop
var gLoop;

// set gamePaused to false
var gamePaused = false;

// starting animals amount
var animalStartAmount = 10;

// starting food amount
var foodStartAmount = 5;



// Food
function Food(startx, starty)
{

    // food height & width
    this.width  = 7;
    this.height = 7;

    // initial age of food
    this.age = 0;

    // directions
    this.northClear = false;
    this.southClear = false;
    this.westClear = false;
    this.eastClear = false;


    // creates the starting location for the food object
    this.spawnLocation = function(startx, starty)
    {
        if(typeof startx != "undefined" && typeof starty != "undefined")
        {
            this.x = startx;
            this.y = starty;
        }
        else
        {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }
    };

    // calls all the actions for each time interval
    this.action = function()
	{
        // check if an animal has ate it
        this.checkIfEatin();

        // random chance the food dies
        this.checkIfKilled();

        // randomly checks if food can grow
        // if so, find a open direction and places a new object there
        this.spread();

        // generates food
        this.drawFood();
	};



    // set starting food spawn location
    this.spawnLocation(startx, starty);

    // checks animals area and checks if out of bounds if so put them back in
    this.checkBounds = function()
    {
        if(this.x <0)
            foodArray.splice(this, 1);

        if(this.x >600)
            foodArray.splice(this, 1);

        if(this.y <0)
            foodArray.splice(this, 1);

        if(this.y >600)
            foodArray.splice(this, 1);
    };
}

// checks if the food dies due to random circumstance
Food.prototype.checkIfKilled = function()
{
    var result = Math.floor(Math.random() * 10000);

    if(result <= 20)
    {
        //console.log("A piece of food died");
        foodArray.splice(this, 1);
    }
    
};

// checks to see if animal is touching if so eat it.
Food.prototype.checkIfEatin = function()
{
   for(var i = 0; i < animalArray.length; i++)
	{
        if(
            animalArray[i].x <= (this.x + this.width) &&
            this.x <= (animalArray[i].x + animalArray[i].width) &&
            animalArray[i].y <= (this.y + this.width) &&
            this.y <= (animalArray[i].y + animalArray[i].width)
          )
        {
            console.log("An animal ate food");
            animalArray[i].ate = true;
            foodArray.splice(this, 1);
        }
    }

};

// check if another food exists north
Food.prototype.anyFoodNorth = function()
{
    for(var i = 0; i < foodArray.length; i++)
    {
        if(
            foodArray[i].x <= (this.x + this.width) &&
            this.x <= (foodArray[i].x + foodArray[i].width) &&
            foodArray[i].y <= (this.y + this.height) &&
            this.y <= (foodArray[i].y + foodArray[i].height)
          )
        {
            this.northClear = false;
        }
        else
        {
            this.northClear = true;
        }
    }

}

// tries to spread the food
Food.prototype.spread = function()
{
    // generate a random number to see if grows or not
    var grow = Math.random() * 10000;

    // grow food if rolls condition met
    if(grow <= 50)
    {
        // generate a random number for growth direction
        // get random 1-4
        var dir = Math.floor(Math.random() * (0, 5) + 1);

        if(dir == 1)
        {
            var n = this.anyFoodNorth();
            if(n)
            {
               foodArray.push(new Food(x=this.x, y=this.y-this.height));
               consoel.log("food grows north/");
            }
        }

        if(dir == 2)
        {
            foodArray.push(new Food(x=this.x+5, y=this.y));
            //this.width += this.width;
        }

        if(dir == 3)
        {
            foodArray.push(new Food(x=this.x, y=this.y+5));
            //this.height += this.height;
        }

        if(dir == 4)
        {
            foodArray.push(new Food(x=this.x-5, y=this.y));
            //this.width -= this.width;
        }
    }

    this.checkBounds();
};

// player.draw function to display animal
Food.prototype.drawFood = function()
{
    // takes in the animals health and updates
    // their fill color
    context2D.fillStyle = "#00FF00";

    // start drawing
    context2D.beginPath();

    //draw rectangle
    context2D.rect(this.x, this.y, this.width, this.height);

    // end drawing
    context2D.closePath();

    // fill rectangle with active color
    context2D.fill();
};



function Animal()
{
	// player starting position
	this.x = Math.random() * canvas.width;
	this.y = Math.random() * canvas.height;

    // animals width & height to help with detection
    this.width = 7;
    this.height = 7;
	
	// animal is alive
	this.isAlive = true;

    // animal ate
    this.ate = false;
	
	// move speed
	this.moveSpeed = Math.random() *.8 + .15;
	
	// initial health
	this.health = 200;
	
	// initial age
	this.age = 0;

    // is prego?
    this.isPreg = false;
    // prego timer
    this.pregoTimer = 0;

    // animal sex
    this.sex = "";
    
    // runs to set the sex
    this.setSex();

    // am i touching something
    this.isTouchingSomething = false;

    // hunger 0=starved, 100=full
    //this.hunger = 100;
	
	// handles all the action calls for each animal
	this.action = function()
	{
        // checks if any are dead, if so
        // kills and removes them
        this.checkIfDied();

        // check if touching something
        this.TouchingSomething();

        // if animal is still alive, minuses health and ages them
        this.updateHealth();

         // update drawings
		this.drawAnimals();

        // move animal
		this.moveAnimals();

        // checks if the animal ate anything
        this.ateFood();

        // checks if animal can mate
        this.mate();

        // updates pregnant animals
        this.preg();
	};


    // births a new animal
    this.birth = function()
    {
        animalArray.push(new Animal());
        console.log("A baby animal was born");
    };

    // checks animals area and checks if out of bounds if so put them back in
    this.checkBounds = function()
    {
        if(this.x <0)
            this.x = 5;

        if(this.x >600)
            this.x = 595;

        if(this.y <0)
            this.y = 5;

        if(this.y >600)
            this.y = 595;
    };

} // end of Animal object

    Animal.prototype.TouchingSomething = function()
    {
          for (var i=0;i<animalArray.length;i++)
          {
              var x1 = this.x;
              var y1 = this.y;
              var w1 = this.width;
              var h1 = this.height;

              var x2 = animalArray[i].x;
              var y2 = animalArray[i].y;
              var w2 = animalArray[i].width;
              var h2 = animalArray[i].height;


              if (w2 !== Infinity && w1 !== Infinity)
              {
                w2 += x2;
                w1 += x1;
                if (isNaN(w1) || isNaN(w2) || x2 > w1 || x1 > w2)
                {
                    //console.log("not touching anything");
                    this.isTouchingSomething = false;
                    return;
                }
              }
              if (y2 !== Infinity && h1 !== Infinity)
              {
                y2 += y2;
                h1 += y1;
                if (isNaN(h1) || isNaN(y2) || y2 > h1 || y1 > y2)
                {
                    //console.log("not touching anything");
                    this.isTouchingSomething = false;
                    return;
                }
              }
              this.isTouchingSomething = true;
              console.log("TOUCHING");
              return;

          }
    };

     // randomly sets the sex of the animal
    Animal.prototype.setSex = function()
    {
        var num = Math.floor(Math.random() * 2 + 1);
        if(num == 1)
        {
            this.sex = "male";
        }
        else
        {
            this.sex = "female";
        }
    }

    // checks if the animal is old enough and touching another animal to mate
    Animal.prototype.mate = function() {

        if(this.age < 5)
        {
            return false;
        }

        for(var i = 0; i < animalArray.length; i++)
	    {
            if(
                animalArray[i].x <= (this.x +7) &&
                this.x <= (animalArray[i].x +7) &&
                animalArray[i].y <= (this.y +7) &&
                this.y <= (animalArray[i].y +7)
              )
            {
                // makes sure both the sexes are different, and they at least one of them arent pregnant
                if(this.sex != animalArray[i].sex && !this.isPreg || !animalArray[i].isPreg)
                {
                    console.log("animals mated");
                   // context2D.fillText("mating", this.x+5, this.y+5);
                    //displayText(20000, "mating", this.x+5, this.y+5);
                    this.isPreg = true;
                    return;
                }
            }
            else
            {
                return;
            }      
        }
    };

    // updates prego stats
    Animal.prototype.preg = function() {

        if(!this.isPreg)
        {
            return;
        }

        if(this.pregoTimer >= 1000)
        {
            // take a health hit
            this.health -= 25;

            // reset mom
            this.pregoTimer = 0;
            this.isPreg = false;

            // have the baby
            this.birth();
        }
        else
        {
            this.pregoTimer++;
        }
    };

    // checks if animal has died, if so it kills it.
    Animal.prototype.checkIfDied = function() {

        if (this.health <= 0) {
            // kill animal, remove from array
            this.isAlive = false;
            animalArray.splice(this, 1);
            console.log("An animal has died.");
        }
        else
        {
            
        }
    };

    // checks if the animal ate anything
    Animal.prototype.ateFood = function()
    {
        if(this.ate)
        {
            // animals wont over eat
            this.health += 20;
            if(this.health > 200)
            {
                this.health = 200;
            }
            this.ate = false;
        }
    };

    // player.draw function to display animal
	Animal.prototype.drawAnimals = function()
	{
        if(this.isTouchingSomething)
        {
            context2D.fillStyle = "#FFF33";
            // start drawing
            context2D.beginPath();

            //draw rectangle
            context2D.rect(this.x, this.y, this.width, this.height);

            // end drawingt
            context2D.closePath();

            // fill rectangle with active color
            context2D.fill();
        }

        if(this.sex == "male")
        {
            // takes in the animals health and updates
            // their fill color
            context2D.fillStyle = this.updateAppearance();

            // start drawing
            context2D.beginPath();

            //draw rectangle
            context2D.rect(this.x, this.y, this.width, this.height);

            // end drawingt
            context2D.closePath();

            // fill rectangle with active color
            context2D.fill();
        }
        else
        {
            // takes in the animals health and updates
            // their fill color
            context2D.fillStyle = this.updateAppearance();

            // start drawing
            context2D.beginPath();

            //draw rectangle
            context2D.rect(this.x, this.y, this.width, this.height);

            if(this.isPreg)
            {
                context2D.strokeStyle = "#FF6600";
                context2D.lineWidth = 3;
            }
            else
            {
                context2D.strokeStyle = "#f00";
                context2D.lineWidth = 1;
            }
            // draw stroke
            context2D.strokeRect(this.x, this.y, this.width, this.height);

            // end drawingt
            context2D.closePath();

            // fill rectangle with active color
            context2D.fill();
        }
	};

    // updates animal health
    Animal.prototype.updateAppearance = function()
	{
        // changes objects color depending on health
        if(this.health > 75)
        {
            return "#F8E0E6";
        }
        else if(this.health < 75 && this.health > 50)
        {
            return "#F7819F";
        }
        else if(this.health < 50 && this.health > 10)
        {
            return "#FF0040";
        }
        else if(this.health < 10)
        {
            return "#610B21";
        }
	};

    // moves the animals
    Animal.prototype.moveAnimals = function()
    {
        // get random 1-4
        var dir = Math.floor(Math.random() * 5);

        if(dir == 1)
        this.y -= this.moveSpeed;

        if(dir == 2)
        this.x += this.moveSpeed;

        if(dir == 3)
        this.y += this.moveSpeed;

        if(dir == 4)
        this.x -= this.moveSpeed;

        this.checkBounds();

        //console.log(dir);
	};

    Animal.prototype.updateHealth = function()
    {
        if(this.isAlive)
        {
            this.health -= .02;
            this.age += .005;
        }
    };

    Animal.prototype.displayText = function()
    {
        context2D.fillStyle = "white";
        context2D.font = "bold 30px sans-serif";
        context2D.fillText("HEALTH : "+Math.floor(this.health), canvas.width-220, 30);
        context2D.fillText("AGE : "+Math.floor(this.age), canvas.width-220, 60);
        context2D.fillText("isAlive : "+this.isAlive, canvas.width-220, 90);
        context2D.fillText("X: "+Math.floor(this.x), canvas.width-220, 120);
        context2D.fillText("Y: "+Math.floor(this.y), canvas.width-220, 150);
        context2D.fillText("SEX : "+this.sex, canvas.width-220, 180);
        context2D.fillText("PREGO? : "+this.isPreg, canvas.width-220, 210);
        context2D.fillText("PREG timer : "+this.pregoTimer, canvas.width-240, 240);
    };


/////////////// END CLASS STUFF /////////////////////
	
// pauses the game
function pauseGame() {

    gamePaused = true;
    clearTimeout(gLoop);

}

// a generic text display with a time attribute
function displayText(time, text, x, y)
{
    var ti;
    
    if(ti <= time)
    {
        context2D.fillText(text, x, y);
    }
    else
    {
        ti++;
    }
}

//adds a new animal to the game
function addAnimal()
{
    animalArray.push(new Animal());
    console.log("God creates a new animal, and it was good");
}

// adds a new food to the game
function addFood()
{
    foodArray.push(new Food());
    console.log("God makes food, it was great!");
}

// unpauses the game
function unPauseGame() {

    // game loop timeout
	gLoop = setTimeout("gameLoop()", 1000 / 500);
}

// init function
function init()
{		
	// get canvas object
	canvas = document.getElementById("canvas");

	// get canvas WIDTH/HEIGHT dynamically
	canvas.width = width;
	canvas.height = height;
		
	// gets the 2d stuff from the canvas obj
	context2D = canvas.getContext('2d');

    // build starting animals
	animalArray = new Array();
	for(var i = 0; i < animalStartAmount; i++)
	{	
		animalArray[i] = new Animal();
	}

    // build starting food
    foodArray = new Array();
    for(var f = 0; f < foodStartAmount; f++)
    {
        foodArray[f] = new Food();
    }
}


function getMouseCoordinates(event)
{
    var positionx = 0;
    var positiony = 0;

    positionx = Math.floor(event.offsetX);
    positiony = Math.floor(event.offsetY);
    
    for(var i = 0; i < animalArray.length; i++)
	{
		if(positionx > Math.floor(animalArray[i].x) && (positionx < Math.floor(animalArray[i].x) + Math.floor(animalArray[i].width)))
        {
            if(positiony > Math.floor(animalArray[i].y) && (positiony < Math.floor(animalArray[i].y) + Math.floor(animalArray[i].height)))
            {
               // document.getElementById("gameInfo8").innerHTML = displayText();
                //document.getElementById("gameInfo8").innerHTML = animalArray[i].displayText();
                animalArray[i].displayText();
            }
            else
            {
               document.getElementById("gameInfo8").innerHTML = "Touching Nothing";                 
            }
        }
	}
    document.getElementById("gameInfo7").innerHTML = "Mouse x: " + positionx + "Mouse y: " + positiony;
}



function displayGameOver()
{
    context2D.fillStyle = "white";
    context2D.font = "bold 30px sans-serif";
    context2D.fillText("G A M E  O V E R", canvas.width-425, 325);
}


// Clears screen
function clear()
{	

	//document.getElementsByTagName('HTML')[0].innerHTML="";
	// canvas colors
	context2D.fillStyle = "#004C80";

	// start drawing
	context2D.beginPath();
	
	//draw rectangle
	context2D.rect(0, 0, width, height);
	
	// end drawingt
	context2D.closePath();
	
	// fill rectangle with active color
	context2D.fill();	

	document.getElementById("gameInfo").innerHTML = "  ";

    //context2D.width = context2D.width;
}


// FUNCTION END HERE
// main game loop
function gameLoop() {

    if(animalArray.length >= 1)
    {
        // Clear screen
        clear();

        // display text to screen
        //displayText();


        // cycle thru all animalArray elements and do all the actions
        for(var i = 0; i <animalArray.length; i++)
        {
            animalArray[i].action();
        }
        

        // cycle thru all foodArray elements and do all the actions
        for(var i = 0; i <foodArray.length; i++)
        {
            foodArray[i].action();
        }

        // show mouse cords
        //document.getElementById("gameInfo7").innerHTML = "Mouse x: " + positionx + "Mouse y: " + positiony;

        // display array size to gameInfo div
        document.getElementById("gameInfo4").innerHTML = animalArray.length;

        // game loop timeout
        gLoop = setTimeout("gameLoop()", 1000 / 500);
    }
    else
    {
        displayGameOver();
    }
}

// Initilize game 
window.onload = init();


// run gameLoop
gameLoop();


