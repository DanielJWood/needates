	(function ($) { 
	  $(document).ready(function() {     

	  	$("input").click(function(){
	  		// Will this exclude the tabs
				
				var checkers = [];
				
				$("input:checkbox").each(function(){
			    var $this = $(this);

			    if($this.is(":checked")){
			      checkers.push($this.attr("id"));
			    }
				});

				var ninj = $('#ninja_forms_field_49	').val(checkers);
			});
	  });  
	}(jQuery));   