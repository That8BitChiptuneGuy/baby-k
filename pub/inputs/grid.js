inputs.types.grid = {

	cell_advance: function(field, direction) {
		let marking = (typeof field.block !== 'undefined');
		if (direction !== false) field.hexkeycount = 0;
		// set new  position
		if (direction == 'down') {
			field.cell.y++;
			if (field.cell.y - field.scroll.y.pos >= field.height) {
				field.scroll.y.pos++;
				if (field.cell.y >= field.scroll.y.length) {
					field.scroll.y.pos = 0;
					field.cell.y = 0;
				}
			}
		}
		if (direction == 'left') {
			field.cell.x--;
			if (field.cell.x < 0) field.cell.x = field.width-1;
		}
		if (direction == 'right') {
			field.cell.x++;
			if (field.cell.x == field.width) field.cell.x = 0;
		}
		if (direction == 'up') {
			field.cell.y--;
			if (field.cell.y < 0) {
				field.scroll.y.pos = field.scroll.y.length - field.height + 1;
				field.cell.y = field.scroll.y.length;
			}
			else if (field.scroll.y.pos > field.cell.y) {
				field.scroll.y.pos--;
			}
		}
		field.value = field.data[field.cell.x][field.cell.y];
		// call inputs on_update if defined
		if (typeof field.on_update == 'function') field.on_update();
		// redraw whole grid
		this.draw_all(field);
	},

	cell_update: function(field, style='blur') {
		// update cell value
		field.value = field.data[field.cell.x][field.cell.y];
		// update cell display
		field.display = this.get_cell_display(field, field.cell.x, field.cell.y);
		// position the cell correctly
		this.get_cell_position(field, field.cell.x, field.cell.y).map((val, index) => {
			if (index == 0) field.x = val;
			else field.y = val;
		});
		inputs.draw_display(field, style);
	},

	draw_all: function(field) {
//console.log('draw_all:' + field.label);
		var x = field.cell.x;
		var y = field.cell.y;
		var old_cursor = field.cell;
		for (let cx = field.width + field.scroll.x.pos - 1; cx >= field.scroll.x.pos; cx--) {
			field.cell.x = cx;
			for (var cy = field.height + field.scroll.y.pos - 1; cy >= field.scroll.y.pos; cy--) {
				field.cell.y = cy;
				let style = 'blur';
				if (cy == field.highlight) style = 'highlight';
				if (cx == x && cy == y) style = 'focus';
				this.cell_update(field, style);
			}
		}
		field.cell.x = x;
		field.cell.y = y;
	},

	get_cell_display: function(field, x, y) {
		var value = field.data[x][y];
		// handle custom cell display
		if (field.cell_type == 'custom' || typeof field.cell_display == 'function') {
			return field.cell_display(value, x, y);
		}
		// handle hex cell display
		else if (field.cell_type == 'hex') {
			return kernel.display.pad(kernel.display.hex(value), field.cell_width, '0');
		}
		// handle alphanumeric default cell display
		else {
			return kernel.display.pad(value, field.cell_width, ' ');
		}
	},

	get_cell_position: function(field, x, y) {
		// returns [x, y]
		return [
			(x == 0) ? field.origin_x : field.origin_x + (x - field.scroll.x.pos) * (field.cell_width + field.cell_margin),
			field.origin_y + y - field.scroll.y.pos
		];
	},

	init: function(field) {
		field.cell = {x:0, y:0};
		field.origin_x = field.x;
		field.origin_y = field.y;
		field.data = [];
		field.cell_advance_behavior = 'down';
		field.row_highlighted = 0;
		// check for scrolling params
		if (typeof field.scroll === 'undefined') field.scroll = {
			x: { length: field.width - 1, pos: 0 },
			y: { length: field.height - 1, pos: 0 }
		};
		field.scroll.x.max = field.scroll.x.length - field.width + 1;
		field.scroll.y.max = field.scroll.y.length - field.height + 1;
		// run custom init
		if (typeof field.on_init == 'function') field.on_init();
		// default init function
		else for (var x = field.width; x > 0; x--) {
			var column = [];
			for (var y = field.height; y > 0; y--) {
				column.push(field.cell_value);
			}
			field.data.push(column);
		}
		field.cell.display = field.data[field.cell.x][field.cell.y];
		field.hexkeycount = 0;
		this.draw_all(field);
	},

	on_key: function(field, key) {
		// flag for cell advancement
		var advance = false;
		// tab out
		if (key.code == 9) return;
		// grid navigate
		else if (key.label == SPKEY.ARROW_DOWN) {
			advance = 'down';
		}
		else if (key.label == SPKEY.ARROW_LEFT) {
			advance = 'left';
		}
		else if (key.label == SPKEY.ARROW_RIGHT) {
			advance = 'right';
		}
		else if (key.label == SPKEY.ARROW_UP) {
			advance = 'up';
		}
		// HOME key
		else if (key.label == SPKEY.HOME) {
			inputs.blur(field);
			field.cell.y = field.scroll.y.pos = 0;
			this.draw_all(field);
		}
		// END key
		else if (key.label == SPKEY.END) {
			inputs.blur(field);
			field.cell.y = field.scroll.y.length;
			field.scroll.y.pos = field.scroll.y.max;
			this.draw_all(field);
		}
		// PAGE DOWN key
		else if (key.label == SPKEY.PAGE_DOWN) {
			inputs.blur(field);
			field.cell.y += 4;
			if (field.cell.y > field.scroll.y.length) {
				field.cell.y = field.scroll.y.length;
				field.scroll.y.pos = field.scroll.y.max;
				this.draw_all(field);
			}
			else if (field.cell.y > field.scroll.y.pos + field.height - 1) {
				console.log('old: ' + field.scroll.y.pos);
				field.scroll.y.pos = (field.cell.y > field.scroll.y.max) ? field.scroll.y.max : field.cell.y - 12;
				console.log('new: ' + field.scroll.y.pos);
				this.draw_all(field);
			}
		}
		// PAGE UP key
		else if (key.label == SPKEY.PAGE_UP) {
			inputs.blur(field);
			field.cell.y -= 4;
			if (field.cell.y < 0) field.cell.y = 0;
			if (field.cell.y < field.scroll.y.pos) {
				field.scroll.y.pos = field.cell.y;
				this.draw_all(field);
			}
		}

		// cell value adjustment
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_DOWN) {
			if (field.data[field.cell.x][field.cell.y] > field.value_min) {
				field.data[field.cell.x][field.cell.y]--;
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_UP) {
			if (field.data[field.cell.x][field.cell.y] < field.value_max) {
				field.data[field.cell.x][field.cell.y]++;
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_LEFT) {
			if (field.data[field.cell.x][field.cell.y] > field.value_min) {
				field.data[field.cell.x][field.cell.y] -= 16;
				if (field.data[field.cell.x][field.cell.y] < field.value_min) {
					field.data[field.cell.x][field.cell.y] = field.value_min;
				}
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_RIGHT) {
			if (field.data[field.cell.x][field.cell.y] < field.value_max) {
				field.data[field.cell.x][field.cell.y] += 16;
				if (field.data[field.cell.x][field.cell.y] > field.value_max) {
					field.data[field.cell.x][field.cell.y] = field.value_max;
				}
			}
		}

		// handle hex number keys (currently limited to 8bit values)
		else if (field.cell_type == 'hex' && HEXKEY.includes(key.code)) {
			if (field.hexkeycount == 0) {
				field.hexkeycount = field.cell_width;
			}
			var value = field.data[field.cell.x][field.cell.y];
			var input_value = HEXKEY.indexOf(key.code);
			field.hexkeycount--;
			// XXX more conditionals if we go 16bit hex values
			if (field.hexkeycount == 1) {
				//value = (value & 0b00001111) + (input_value << 4);
				value = input_value << 4;
			}
			if (field.hexkeycount == 0) {
				value = (value & 0b11110000) + input_value;
				advance = field.cell_advance_behavior;
			}
			if (value > field.value_max) value = field.value_max;
			else if (value < field.value_min) value = field.value_min;
			field.data[field.cell.x][field.cell.y] = value;
		}

		// grid delete/backspace/etc
		// BACKSPACE key
		// move current cell and below up one
		else if (key.label == SPKEY.BACKSPACE) {
			if (typeof field.value_default != 'undefined') {
				advance = 'up';
				field.data[field.cell.x].splice(field.cell.y - 1, 1);
				if (field.data[field.cell.x].length < field.height) {
					let value = field.value_default;
					field.data[field.cell.x].push(value);
				}
			}
		}
		// DELETE key
		// set cell empty and advance down
		else if (key.label == SPKEY.DELETE) {
			if (typeof field.value_default != 'undefined') {
				advance = 'down';
				let value = field.value_default;
				field.data[field.cell.x][field.cell.y] = value;
			}
		}
		// INSERT key
		// insert empty cell at cursor
		else if (key.label == SPKEY.INSERT) {
			if (typeof field.value_default != 'undefined') {
				advance = false;
				let value = field.value_default;
				field.data[field.cell.x].splice(field.cell.y, 0, value);
			}
		}
		// SHIFT BACKSPACE key
		// move current cell row and below up one
		else if (key.label == 'SHIFT_' + SPKEY.BACKSPACE
		|| key.label == 'CONTROL_' + SPKEY.BACKSPACE) {
			if (typeof field.value_default != 'undefined') {
				advance = 'up';
				let value = field.value_default;
				for (let x = 0; x < field.width; x++) {
					field.data[x].splice(field.cell.y - 1, 1);
					if (field.data[x].length < field.height) {
						field.data[x].push(value);
					}
				}
				inputs.types.grid.draw_all(field);
			}
		}
		// SHIFT DELETE key
		// set cell row empty and advance down
		else if (key.label == 'SHIFT_' + SPKEY.DELETE
		|| key.label == 'CONTROL_' + SPKEY.DELETE) {
			if (typeof field.value_default != 'undefined') {
				advance = 'down';
				let value = field.value_default;
				for (let x = 0; x < field.width; x++) {
					field.data[x][field.cell.y] = value;
				}
				inputs.types.grid.draw_all(field);
			}
		}
		// SHIFT INSERT key
		// insert empty cell at cursor
		else if (key.label == 'SHIFT_' + SPKEY.INSERT
		|| key.label == 'CONTROL_' + SPKEY.INSERT) {
			if (typeof field.value_default != 'undefined') {
				advance = false;
				let value = field.value_default;
				for (let x = 0; x < field.width; x++) {
					field.data[x].splice(field.cell.y, 0, value);
				}
			}
			inputs.types.grid.draw_all(field);
		}

		// BLOCK FUNCTIONS
		else if (key.label == 'SHIFT_'+SPKEY.ARROW_DOWN) {
			advance = 'down';
		}
		else if (key.label == 'SHIFT_'+SPKEY.ARROW_LEFT) {
			advance = 'left';
		}
		else if (key.label == 'SHIFT_'+SPKEY.ARROW_RIGHT) {
			advance = 'right';
		}
		else if (key.label == 'SHIFT_'+SPKEY.ARROW_UP) {
			advance = 'up';
		}
		else if (key.label == 'CONTROL_D') {
			this.unset_block(field);
		}

		// call custom key handler
		else if (typeof field.on_key === 'function') {
			advance = field.on_key(key);
		}
		// advance / redraw cell
		this.cell_advance(field, advance);
	},

	row_dehighlight: function(field) {
		field.highlight = -1;
	},

	row_highlight: function(field, row) {
		field.highlight = row;
	},

	row_is_visible: function(field, row) {
		if (row >= field.scroll.y.pos && row <= field.scroll.y.pos + field.height) return true;
		else return false;
	},

	block_is_marked: function(field, x, y) {
		let b = field.block;

	},

	block_set: function(field) {
		if (typeof field.block == 'undefined') {
			field.block = {
				marking: true,
				x1: field.cell.x,
				y1: field.cell.y,
				x2: field.cell.x,
				y2: field.cell.y,
			};
		}
	},

	block_unset: function(field) {
		delete field.block;
	},

	set_position: function(field, x, y) {
		field.cell.x = x;
		field.cell.y = y;
		field.value = field.data[x][y];
	}
}
