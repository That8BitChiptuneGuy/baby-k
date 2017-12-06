// MAKE IT SING

var beta_k = {

	includes: [
		'song_schema',
		'inputs',
		'pattern_grid',
	],

	/*
	 * parameters
	 */

	frame_counter: 0,
	frame_rate: 5,
	inputs: {},
	octave: 0,
	pattern_pos: 0,
	pattern_order_pos: 0,
	pause: true,
	song: 'load a song dummy',



	/*
	 * methods
	 */

	init: function() {
		vixxen.screen.clear();
		vixxen.plot_str(0, 1, ' BETA-K ON VIXXEN20 ', 5);
		vixxen.plot_str(20, 3, 'SPEED', 1);
		vixxen.plot_str(20, 4, 'VOLUME', 1);
		vixxen.plot_str(30, 3, ' ALTO ', 1);
		vixxen.plot_str(30, 4, ' TENR ', 1);
		vixxen.plot_str(30, 5, ' SOPR ', 1);
		vixxen.plot_str(30, 6, ' NUZZ ', 1);
		vixxen.plot_str(2, 8, 'ch1 ch2 ch3 ch4  SongonG0NGg  SPD VOL', 1);
		this.song = this.song_new();
		this.inputs = beta_k_inputs;
		this.inputs.fields.unshift(beta_k_pattern_grid);
		var i;
		for (i = 0; i < 4; i++) {
			beta_k_pattern_grid.on_load(i, this.song.patterns[i]);
		};
		inputs.init(this.inputs);
		vixxen.frame.hook_add({
			object: 'beta_k',
			method: 'frame'
		});
		this.song_play_pattern();
	},

	frame: function() {
		vixxen.plot_str(35, 1, vic.video_mode.toUpperCase()+' ', 6);
		if (beta_k.pause !== true) {
			if (beta_k.frame_counter % beta_k.frame_rate == 0) {
				beta_k_pattern_grid.play_next_row();
			}
			for (var i = 0; i < 4; i++) {
				var display = (vic.voices[i].value >= 128) ? vixxen.display.hex(vic.voices[i].value) : '--';
				vixxen.plot_str(36, 3+i, display, 1);
			}
		}
		beta_k.frame_counter++;
		vixxen.plot_str(0, 28, ` FRAME ${beta_k.frame_counter} `, 2);
	},

	play_status: function(status) {
		vixxen.plot_str(22, 1, ` ${status}   `, 1);
	},

	song_new: function() {
		return JSON.parse(JSON.stringify(beta_k_new_song));
	},

	song_pause: function() {
		beta_k.pause = true;
		vixxen.silent();	
		this.play_status('PAUSED');
		return;
	},

	song_play: function() {
		beta_k.pause = false;
		this.play_status('PLAYING');
	},

	song_play_pattern: function() {
		beta_k.pause = false;
		this.play_status('PLAYING');
	},

	song_stop: function() {
		beta_k.pause = true;
		vixxen.silent();	
		beta_k_pattern_grid.play_position = 0;
		this.play_status('STOPPED');
	},

	play_position: {
		list: 0,
		row: 0,
		increase: function() {
			this.row++;
			if (this.row >= 16) {
				this.row = 0;
				this.list++;
				if (this.list >= beta_k.song.list.length) this.list = 0;
			}
		},
	},

}

