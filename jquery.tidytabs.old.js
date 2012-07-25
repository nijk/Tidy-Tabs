/*
 jQuery tidytabs plugin
 Developed by: Nick Aspinall
 Developed on: 08/05/2012
 ---------------------------
 A plugin allowing tabs to be collected into a 'More' tab and appended to the when there is not enough horizontal space.

 This plugin must be used as an extension to jQuery UI .tabs() and called after the _create() method of .tabs()
 has been called.

 the plugin returns 'this' (jQuery)

 Example usage:
 $(".myDiv").tabs().tabs('tidy'[, options]);

 */
(function($){
    $.fn.tidytabs = function(options, callback){
        //console.log("tidytabs called:", this);
        var defaults = {
            tabtext: "More",
            moreUlClass: "ui-tabs-nav-more"
        };
        var _tt = this;

        if(typeof(options) == "function"){
            callback = options;
            options = {};
        }
        _tt.config = $.extend({}, defaults, options);
        _tt.resizeEvent = false;

        /**
         * Calculates the accumulated width of the list items and creates a 'more' list if there is not enough space
         * @param $tabs | jQuery object
         */
        function init($tabs){
            //console.log("init", $tabs);
            //Setup the variables to calculate the original list items width
            var total_offset = 0;
            //Todo: Get more list width from tab with opacity:0
            var $more_tabs = $tabs.find("ul." + _tt.config.moreUlClass);

            //Create the 'More' tabs list if it doesn't already exist
            if(0 === $more_tabs.length){
                $more_tabs = create_more_tabs($tabs);
                //console.log($more_tabs, $tabs);
            }
            $("#ui-tabs-more").css({opacity:0}).removeClass("hidden");
            //Loop through the <li> elements in the list to calculate the total width
            $("> li", $tabs).not("#ui-tabs-more").each(function(index, elem){
                //console.log("looping through <li> elems", $(elem));

                //Ensure that <li> is not set to display:none, otherwise dimensions cannot be calculated
                if($(elem).hasClass("hidden")){
                    $(elem).css({opacity:0}).removeClass("hidden");
                }

                //Set index to 1 based value rather than 0 as it will make it easier to work out which <li> should drop off
                var this_pos = $(elem).position();
                var this_width = $(elem).outerWidth();
                var this_classes = $(elem).attr("class");
                var more_list_width = $("#ui-tabs-more", $tabs).css({opacity:0}).removeClass("hidden").outerWidth() + 40;
                //console.log("more_list_width", more_list_width);
                //Add the width of this <li> to the total variable
                total_offset += this_width;
                var remainder = $tabs.innerWidth() - more_list_width;
                if(total_offset > remainder){
                    //Hide the original tab
                    $(elem).addClass("hidden").css({opacity: 1});
                    //Show the 'More' tab
                    $("#ui-tabs-more").css({opacity: 1}).addClass(this_classes).removeClass("hidden");
                    //Cache the more <li> that corresponds with this <li> in the original list
                    var $more_li = $more_tabs.children("li").eq(index);
                    //Show the 'More' <li> item
                    $more_li.removeClass("hidden");

                    var $first_child = $more_li.children(":first");
                    //If the link text is too long for the tab container then reduce the width to a suitable amount
                    //Todo: Fix this conditional as outerWidth is not being calculated properly
                    //console.log($first_child, $first_child.outerWidth(true), remainder, $more_li, $more_li.outerWidth(true));
                    //if($first_child.width() > remainder){
                        $more_li.css({"width": remainder - 40});
                        $first_child.css({
                            /*"width": remainder - 50,*/
                            "white-space": "normal"
                        });
                    //}

                    //console.log($more_tabs.children("li").eq(index));
                    //console.log($(elem), "list item #", index + 1, "is too far over to be shown, total offset is: ", total_offset);
                }else{
                    $(elem).css({opacity:1}).removeClass("hidden");
                    $("#ui-tabs-more", $tabs).css({opacity:1}).addClass("hidden");
                    //console.log("total_offset is less than remainder for:", $(elem), total_offset, remainder);
                }
            });

            if(false === _tt.resizeEvent){
                //Set up event handlers
                $(window).bind({
                    resize: function(e){
                        //console.log("event:", e);
                        _tt.resizeEvent = true;
                        initCallback($tabs);
                    },
                    custom: function(e){
                        //console.log("event:", e);
                        switch(e.state){
                            case "elemShownX" :
                            case "elemHiddenX" :
                                initCallback($tabs);
                            break;
                        }
                    }
                });
            }
            //Optional callback
            $.isFunction(callback) && callback.call(this);
        }

        /**
         * Clone the original list and insert an <li> at the end titled 'More'
         * which contains cloned list items from the original
         * @param $tabs | jQuery object
         */
        function create_more_tabs($tabs){
            //'More' tab not detected in DOM, this needs to be added. So, clone the original list of tabs and insert
            //into a final tab titled 'More'
            var $tabs_clone = $tabs.clone();
            //Remove any existing classes from the <ul> and child <li>'s and add some useful classes
            $tabs_clone.attr("class", "").addClass(_tt.config.moreUlClass + " child-items hide").find("li").each(function(index, elem){
                $(elem).attr("class", "").addClass("hidden");
            });
            //Create the 'More' tab and append to the original list of tabs
            $tabs.append('<li id="ui-tabs-more" class="ui-state-default ui-corner-top down-grey parent-item hidden"><a href="#"><span class="tab-title">'+ _tt.config.tabtext +'</span><span class="icon icon-8">&nbsp;</span></a></li>');

            //Find the 'More' tab in the original list of tabs and add the cloned list as children of the 'More' tab
            $("li#ui-tabs-more", $tabs).append($tabs_clone);
            //console.log($tabs, $tabs.find("ul.ui-tabs-nav-more"));
            //Ensure that the cached variable is updated with the new DOM content
            return $tabs.find("li#ui-tabs-more ul." + _tt.config.moreUlClass);
        }


        function initCallback($this){
            // loop through each element returned by jQuery selector
            return $this.each(function(){
                //console.log("tidytabs applied to:", $(this));
                init.apply($this, [$(this)]);
            });
        }

        initCallback(this);

    }
})(jQuery);