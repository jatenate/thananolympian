var is_male = true;
var curr_filter = "age";

// Map dropdown values to verbs for comparing me to athletes.
var VERBS = {
	"age" : "older"
  , "height" : "taller"
  , "weight" : "heavier"
}

// Expected json is:
// [swim, gym, track, other, all] x 2 (male first, then female)
var SPORTS = [
	"swim"
  , "gym"
  , "track"
  , "other"
  , "all"
]

// Map sports to ring colors
var COLORS = {
    "swim": "blue"
  , "gym": "red"
  , "track": "yellow"
  , "other": "green"
  , "all": "black"
}

var MALE_SELECTED_IMG = "img/male_selected.png"
  , MALE_UNSELECTED_IMG = "img/male_unselected.png"
  , FEMALE_SELECTED_IMG = "img/female_selected.png"
  , FEMALE_UNSELECTED_IMG = "img/female_unselected.png";

$(function() {
	var gender_string = (is_male ? "_male" : "_female")
	var new_min = data[curr_filter + gender_string + "_min"];
	var new_max = data[curr_filter + gender_string + "_max"];
	var reset_val = new_min + Math.floor((new_max - new_min) / 2);

	$("#slider").slider({
		value: reset_val
	  , min: new_min
	  , max: new_max
	  , step: 1
	  , slide: function( event, ui ) {
	  		slide(ui.value);
		}
	  , create: function(){
	  		// Adds the counter bubble below the slider.
		    var handle = jQuery(this).find('.ui-slider-handle');
		    var bubble = jQuery('<span id="bubble"></span>');
		    handle.append(bubble);
		}
	});
	$("#bubble").text($("#slider").slider("value") + "\xa0years");

	$("span.pie").each(function() {
		color = this.getAttribute('color');
		$(this).peity("pie", {
			colour: color
		})
	})

	$('.dropdown').dropkick({
      	width: 160
      ,	change: dropdown
     });

	slide(reset_val);
})

/**
 * Called when the position of the slider changes.
 */
var slide = function(new_val) {
	var totals = data[curr_filter + "_counts"];
	$.each(SPORTS, function(index, sport) {
		var i = (is_male ? index : index + 5);
		var total = totals[i];

		var count = data[curr_filter][new_val][i];

		var ring_id = COLORS[sport] + "_ring";

		$("#" + ring_id).text(count + "/" + total).change();
	})

	// Format the value for the bubble
	if (curr_filter === "age") {
		$("#bubble").text(new_val+ "\xa0years");
	} else if (curr_filter === "height") {
		var inches = new_val % 12;
		var feet = (new_val - inches) / 12;
		$("#bubble").text(feet + "'" + inches + '"');
	} else {
		$("#bubble").text(new_val+ "\xa0lbs");
	}
}

var dropdown = function(new_val) {
	curr_filter = new_val;

	if (curr_filter === "weight") {
		$(".no_data").show();
	} else {
		$(".no_data").hide();
	}

	// Update the "I'm older/taller/heavier than" verb.
	$("#verb").text(VERBS[new_val]);

	var gender_string = (is_male ? "_male" : "_female")
	// Update the slider range.
	var new_min = data[new_val + gender_string + "_min"];
	var new_max = data[new_val + gender_string + "_max"];
	var reset_val = new_min + Math.floor((new_max - new_min) / 2);

	$("#slider").slider("option", "min", new_min);
	$("#slider").slider("option", "max", new_max);
	$("#slider").slider("value", reset_val);
	slide(reset_val);
}

/**
 * Updates the is_male var and swaps the pictures for the male/female icons.
 */
var swap_gender = function() {
	is_male = !is_male;

	var img = $("#gender_male");
	var src = (img.attr("src") === MALE_SELECTED_IMG)
					? MALE_UNSELECTED_IMG
					: MALE_SELECTED_IMG;
	img.attr("src", src);

	var img = $("#gender_female");
	var src = (img.attr("src") === FEMALE_SELECTED_IMG)
					? FEMALE_UNSELECTED_IMG
					: FEMALE_SELECTED_IMG;
	img.attr("src", src);

	// And swap the color of the slider.
	$("#slider_section").toggleClass("male").toggleClass("female");

	// Update the slider text when gender changes.
	dropdown(curr_filter);
}
