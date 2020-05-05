//Constant
CANVAS_SIZE = 600;
GAME_SIZE = 4;
BLOCK_SIZE = 130;
PADDING_SIZE = (CANVAS_SIZE - GAME_SIZE * BLOCK_SIZE) / 5;

CANVAS_BACKGROUND_COLOR = "D4DFE6";
BLOCK_PLACEHOLDER_COLOR = "C4CFD6";
BLOCK_BACKGROUND_COLOR_START = "CADBE9";
BLOCK_BACKGROUND_COLOR_END = "BEC0E4";
BLOCK_FONT_COLOR = "444444";
FONT_SIZE = "50px";

FRAME_PER_SECOND = 30;
ANIMATION_TIME = 0.15;

//Global Utility Functions
randInt = function(a, b){
    return a + Math.floor(Math.random() * (b + 1 - a));
}

randChoice = function(arr){
    return arr[randInt(0, arr.length - 1)];
}

//M Model
class Game {
    constructor(){
        this.data = [];
        this.points = 0;
        this.initializeData();
    }

    initializeData(){
        this.data = [];
        this.points = 0;
        for (let i = 0; i < GAME_SIZE; i++){
            let temp = [];
            for (let j = 0; j < GAME_SIZE; j++){
                temp.push(null);
            }
            this.data.push(temp);
        }
        this.generateNewBlock();
        this.generateNewBlock();
    }

    generateNewBlock() {
        let possiblePositions = [];
        for (let i = 0; i < GAME_SIZE; i++){
            for (let j = 0; j < GAME_SIZE; j++){
                if (this.data[i][j] == null){
                    possiblePositions.push([i, j]);
                }
            }
        }
        let position = randChoice(possiblePositions);
        this.data[position[0]][position[1]] = 2;
    }

    //head pointer -> write
    //tail pointer -> read
    //while tail < length
    //tail == null --> tail += 1
    //tail != null
    //  head == null --> "*tail to *head" && tail += 1
    //  head != null --> *head == *tail --> *head *= 2 &&
    //                                      *tail = null &&
    //                                      head += 1 &&
    //                                      tail += 1
    //               --> *head != *tail --> head += 1                                 
    shiftBlock(arr, reverse = false) {
        let head = 0;
        let tail = 1;
        let incr = 1;
        let moves = [];
        let points = 0;
        if (reverse == true){
            head = arr.length - 1;
            tail = head - 1;
            incr = -1;
        }
        while (tail < arr.length && tail >= 0){
            if (arr[tail] == null) {
                tail += incr;
            }
            else{
                if (arr[head] == null){
                    arr[head] = arr[tail];
                    arr[tail] = null;
                    moves.push([tail, head]);
                    tail += incr;
                }else if (arr[head] == arr[tail]) {
                    arr[head] = arr[head] * 2;
                    arr[tail] = null;
                    points += arr[head];
                    moves.push([tail, head]);
                    head += incr;
                    tail += incr;
                }else {
                    head += incr;
                    if (head == tail){
                        tail += incr;
                    }
                }
            }
        }
        return {
            "moves": moves,
            "points": points
        };
    }

    //command in ["left", "right", "up", "down"]
    advance(command) {
        let reverse = (command == "right" || command == "down");
        let moves = [];
        if (command == "left" || command == "right"){
            for (let i = 0; i < GAME_SIZE; i++){
                let result = this.shiftBlock(this.data[i], reverse);
                for (let move of result.moves){
                    moves.push([[i, move[0]], [i, move[1]]]);
                }
                this.points += result.points; 
            }
        } else if (command == "up" || command == "down"){
            for (let j = 0; j < GAME_SIZE; j++){
                let tmp = [];
                for (let i = 0; i < GAME_SIZE; i++){
                    tmp.push(this.data[i][j]);
                }
                let result = this.shiftBlock(tmp, reverse);
                for (let move of result.moves){
                    moves.push([[move[0], j], [move[1], j]]);
                }
                for (let i = 0; i < GAME_SIZE; i++){
                    this.data[i][j] = tmp[i];
                }
                this.points += result.points;
            }
        }

        if (moves.length != 0){
            this.generateNewBlock();
        }
        return {
            "moves": moves,
            "points": this.points
        };
    }

    checkFail(){
        for (let i = 0; i < GAME_SIZE; i++){
            for (let j = 0; j < GAME_SIZE; j++){
                if (!this.data[i][j]) return false;
            }
        }

        return true;
    }
}

//Tests
class Test{
    static compareArray(arr1, arr2){
        if (arr1.length != arr2.length){
            return false;
        }

        for (let i = 0; i < arr1.length; i++){
            if (arr1[i] != arr2[i]){
                return false;
            }
        }

        return true;
    }
    static test_shiftBlock(){
        let gameTest = new Game();
        let testCases = [
            [[2, 2, 2, 2], [4, 4, null, null]],
            [[2, 2, null, 2], [4, 2, null, null]],
            [[4, 2, null, 2], [4, 4, null, null]],
            [[2, 4, null, 8], [2, 4, 8, null]],
            [[null, null, null, null], [null, null, null, null]],
            [[null, 4, 4, 8], [8, 8, null, null]]
        ];
        let errflag = false;
        
        for (let test of testCases){
            for (let reverse of [false, true]){
                let input = test[0].slice();
                let result = test[1];
                if (reverse == true){
                    input.reverse();
                    result.reverse();
                }
                gameTest.shiftBlock(input, reverse);
                if (!Test.compareArray(input, result)){
                    errflag = true;
                    console.log(input, result);
                    console.log("Error!");
                }
            }
        }

        if (!errflag){
            console.log("Pass!");
        }
    }
}

//V View
class View {
    constructor(game, container) {
        this.game = game;
        this.blocks = [];
        this.container = container;
        this.initializeContainer();
    }

    initializeContainer() {
        this.container.style.width = CANVAS_SIZE;
        this.container.style.height = CANVAS_SIZE;
        this.container.style.backgroundColor = CANVAS_BACKGROUND_COLOR;
        this.container.style.position = "relative";
        this.container.style.display = "inline-block";
        this.container.style.zIndex = 1;
        this.container.style.borderRadius = "15px";
        this.container.style.fontFamily = " 'Baloo Paaji 2', cursive";
        this.container.style.color = BLOCK_FONT_COLOR;
    }

    gridToPosition(i, j){
        let top = i * (BLOCK_SIZE + PADDING_SIZE) + PADDING_SIZE;
        let left = j * (BLOCK_SIZE + PADDING_SIZE) + PADDING_SIZE;

        return [top, left];
    }

    animate(moves){
        this.doFrame(moves, 0, ANIMATION_TIME);
    }

    doFrame(moves, currTime, totalTime){
        if (currTime < totalTime){
            //Draw animation stuff
            setTimeout(() => {
                this.doFrame(moves, currTime + 1 / FRAME_PER_SECOND, totalTime);
            }, 1 / FRAME_PER_SECOND * 1000);

            for (let move of moves){
                let block = this.blocks[move[0][0]][move[0][1]];
                let origin = this.gridToPosition(move[0][0], move[0][1]);
                let destination = this.gridToPosition(move[1][0], move[1][1]);
                let currPosition = [
                    origin[0] + currTime / totalTime * (destination[0] - origin[0]),
                    origin[1] + currTime / totalTime * (destination[1] - origin[1])
                ]
                block.style.top = currPosition[0];
                block.style.left = currPosition[1];
            }
        }else {
            view.drawGame();
        }
    }

    drawGame(){
        this.container.innerHTML = "";
        this.blocks = [];
        for (let i = 0; i < GAME_SIZE; i++){
            let tmp = [];
            for (let j = 0; j < GAME_SIZE; j++){
                this.drawBackgroundBlock(i, j, BLOCK_PLACEHOLDER_COLOR);
                let block = null;
                if (this.game.data[i][j]){
                    block = this.drawBlock(i, j, this.game.data[i][j]);
                }
                tmp.push(block);
            }
            this.blocks.push(tmp);
        }
    }

    drawBackgroundBlock(i, j, color){
        let block = document.createElement("div");
        let position = this.gridToPosition(i, j);
        block.style.width = BLOCK_SIZE;
        block.style.height = BLOCK_SIZE;
        block.style.backgroundColor = color;
        block.style.position = "absolute";
        block.style.top = position[0];
        block.style.left = position[1];
        block.style.zIndex = 3;
        block.style.borderRadius = "5px";
        this.container.append(block);
        return block;
    }

    drawBlock(i, j, number){
        let span = document.createElement("span");
        let text = document.createTextNode(number);
        let block = this.drawBackgroundBlock(i, j, this.getColor(number));
        span.appendChild(text);
        block.appendChild(span);
        block.style.zIndex = 5;
        span.style.position = "absolute";
        span.style.fontSize = FONT_SIZE;
        span.style.top = (BLOCK_SIZE - span.offsetHeight) / 2;
        span.style.left = (BLOCK_SIZE - span.offsetWidth) / 2;
        
        return block;
    }

    getColor(number){
        let level = Math.log2(number);
        let rgbStart = this.hexToRGB(BLOCK_BACKGROUND_COLOR_START);
        let rgbEnd = this.hexToRGB(BLOCK_BACKGROUND_COLOR_END);
        let color = [0, 0, 0];
        for (let i = 0; i < 3; i++){
            color[i] = Math.floor(rgbStart[i] + (rgbEnd[i] - rgbStart[i]) * (level / 12));
        }
        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }

    hexToRGB(s){
        let rs = s.slice(0, 2);
        let gs = s.slice(2, 4);
        let bs = s.slice(4, 6);
        return [parseInt(rs, 16), parseInt(gs, 16), parseInt(bs, 16)];
    }
}

//C Controller
var container = document.getElementById("game-container");
var pointsContainer = document.getElementById("points");
var game = new Game();
var view = new View(game, container);
view.drawGame();

document.onkeydown = function(event) {
    let moves = null;
    let result = null;
    if (event.key == "ArrowLeft"){
        result = game.advance("left");
    }else if (event.key == "ArrowRight"){
        result = game.advance("right");
    }else if (event.key == "ArrowUp"){
        result = game.advance("up");
    }else if (event.key == "ArrowDown"){
        result = game.advance("down");
    }

    if (result && result.moves.length > 0){
        pointsContainer.innerHTML = `Points: ${game.points}`;
        view.animate(result.moves);
    }

}