const BOX_SIZE = 100
const N_ROWS = 5
const N_COLS = 6
const NORTH = 'north', SOUTH = 'south', EAST = 'east', WEST = 'west';

const TYPES = Object.freeze({STONE:1, EMPTY:2, GOAL:3, PIT: 4})
const ACTIONS = Object.freeze({UP:1, DOWN:2, RIGHT:3, LEFT: 4})

const GOALS = [[1,4]]
const PITS = [[2,4]]
const STONES = [[2,2]]
const STEP_REWARD = 0
const GOAL_REWARD = 1
const PIT_REWARD = -1

var player_pos = [3,1]
var game_play_records = []
var game_play_steps_count = 0

function create_box(row, column, size, type) {
  box_y = row * size + row * 3
  box_x = column * size + column * 3
  box_height = size
  box_width = size
  weight = {NORTH: 0, SOUTH: 0, EAST: 0, WEST: 0}
  type = type || TYPES.EMPTY
  return {x: box_x, y: box_y, height: box_height, width: box_width, weight: weight, type:type}
}
function create2DArray(numRows, numColumns) {
	let array = new Array(numRows);
	for(let i = 0; i < numColumns; i++) {
		array[i] = new Array(numColumns);
	}
	return array;
}
function isedge(row, col) {
  if (row == 0 | row == N_ROWS -1 | col == 0 | col == N_COLS - 1)
    return true
  return false
}
function contains(source_array, row, col){
  for (a_i in source_array) {
    if (source_array[a_i][0] == row & source_array[a_i][1] == col){
      return true
    }
  }
  return false
}
function find_box_type(row, col) {
  let type = TYPES.EMPTY;
  if (isedge(row, col)) {
      type = TYPES.STONE
  }else if (contains(GOALS, row, col)) {
      type = TYPES.GOAL
  }else if (contains(PITS, row, col)) {
      type = TYPES.PIT
  }else if (contains(STONES, row, col)) {
      type = TYPES.STONE
  }
  return type
}
function create_boxes() {
  let all_boxes = create2DArray(N_ROWS, N_COLS);
  for (row = 0; row < N_ROWS; row++){
    for (col = 0; col < N_COLS; col++) {
      type = find_box_type(row, col)
      // type = TYPES.STONE
      t_box = create_box(row, col, BOX_SIZE, type);
      all_boxes[row][col] = t_box;
    }
  }
  return all_boxes
}

var all_boxes = create_boxes()

function draw_box(box) {
  if (box.type === TYPES.STONE){
    fill(125)
  } else if (box.type === TYPES.GOAL) {
    fill(0, 255, 0)
  } else if (box.type === TYPES.PIT) {
    fill(255, 0, 0)
  } else {
    fill(255)
  }
  rect(box['x'], box['y'], box['height'], box['width']);

  if (box.type === TYPES.EMPTY){
    top_left = [ box['x'], box['y'] ]
    top_right = [ box['x']+box['width'], box['y'] ]
    bottom_left = [box['x'], box['y']+box['height']]
    bottom_right = [box['x']+box['width'], box['y']+ box['height']]
    center = [box['x']+box['width']/2, box['y']+box['height']/2]
    text_padding = box['height'] / 4
    function draw_triange_containers(x1, y1, x2, y2, x3, y3, text_, text_x, text_y) {
      score = float(text_)
      score_gradient = score >= 0 ? 1-score : 1+score;
      fill(255*score_gradient, 255, 255*score_gradient);
      if (score < 0) {
        fill(255, 255*score_gradient, 255*score_gradient);
      }
      triangle(x1, y1, x2, y2, x3, y3);
      fill(0);
      text(text_, text_x, text_y);
      fill(255)
    }
    // // NORTH
    draw_triange_containers(center[0], center[1], top_right[0], top_right[1], top_left[0], top_left[1],
      box.weight.NORTH, center[0], center[1] - text_padding);
    // // SOUTH
    draw_triange_containers(center[0], center[1], bottom_left[0], bottom_left[1], bottom_right[0], bottom_right[1],
      box.weight.SOUTH, center[0], center[1] + text_padding);
    // // EAST
    draw_triange_containers(center[0], center[1], top_right[0], top_right[1], bottom_right[0], bottom_right[1],
      box.weight.EAST, center[0] + text_padding, center[1]);
    // // WEST
    draw_triange_containers(center[0], center[1], top_left[0], top_left[1], bottom_left[0], bottom_left[1],
      box.weight.WEST, center[0] - text_padding, center[1])

  }
  fill(255)
}
function setup() {
  // put setup code here
  createCanvas(800, 800);
  for (b_row in all_boxes) {
    for (b_col in all_boxes[b_row]) {
      box = all_boxes[b_row][b_col]
      if (box){
        draw_box(all_boxes[b_row][b_col])
      }
    }
  }

  draw_player()
}

function draw_player() {
  playerbox = all_boxes[player_pos[0]][player_pos[1]]
  player_x = playerbox.x + BOX_SIZE / 2
  player_y = playerbox.y + BOX_SIZE / 2
  fill(0, 0, 255)
  ellipse(player_x, player_y, 30, 30)
  fill(255)
}

function get_new_player_position(old_position, new_position) {
  new_box = all_boxes[new_position[0]][new_position[1]];
  if (new_box.type === TYPES.STONE) {
    return old_position
  }
  return new_position
}

function check_box_reward(box){
  if (box.type === TYPES.GOAL) {
    return GOAL_REWARD
  } else if (box.type == TYPES.PIT) {
    return PIT_REWARD
  }
  return STEP_REWARD
}

function check_game_end(current_box){
  if (game_play_steps_count > 20) {
    return true
  } else if (current_box.type === TYPES.PIT | current_box.type === TYPES.GOAL) {
    return true
  }
  return false
}

function update_game_play(old_box, new_box, action) {
  if (check_game_end(new_box)) {
    //yes
    document.onkeydown = undefined;
  }
  game_play = {box: old_box, action: action}
  game_play_records.push(game_play);

}
function move_player(action) {
  playerbox_prev = all_boxes[player_pos[0]][player_pos[1]]
  let new_x = player_pos[0], new_y = player_pos[1];
  if (action == ACTIONS.UP) {
    new_x = player_pos[0] - 1;
  } else if (action == ACTIONS.DOWN) {
    new_x = player_pos[0] + 1;
  } else if (action == ACTIONS.RIGHT) {
    new_y = player_pos[1] + 1;
  } else if (action == ACTIONS.LEFT) {
    new_y = player_pos[1] - 1;
  }
  player_pos = get_new_player_position(player_pos, [new_x, new_y]);
  playerbox_new = all_boxes[player_pos[0]][player_pos[1]]
  draw_box(playerbox_prev);
  draw_player()
  update_game_play(playerbox_prev, playerbox_new, action);
}
function draw() {
  // put drawing code here
  // if (mouseIsPressed) {
  //   fill(0, 3, 255);
  // } else {
  //   fill(255);
  // }
  // rect(mouseX, mouseY, 80, 80);
}

document.onkeydown = checkKey;

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
        move_player(ACTIONS.UP)
    }
    else if (e.keyCode == '40') {
        // down arrow
        move_player(ACTIONS.DOWN)
    }
    else if (e.keyCode == '37') {
       // left arrow
       move_player(ACTIONS.LEFT)
    }
    else if (e.keyCode == '39') {
       // right arrow
       move_player(ACTIONS.RIGHT)
    }

}
