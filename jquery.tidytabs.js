/**
 *  jQuery tidytabs plugin
 *  Developed by: Nick Aspinall
 *  Developed on: 25/07/2012
 *  ---------------------------
 *  A plugin that extends the jQuery UI .tabs() method:
 *
 *  Namespace: ui
 *  pluginName: tabs
 *
 *  It allows tabs to be collected into a 'More' tab and appended to the when there is not enough horizontal space.
 *
 *  This plugin must be used as an extension to jQuery UI .tabs() and called after the _create() method of .tabs()
 *  has been called.
 *
 *  Example usage:
 *  $(".myDiv").tabs().tabs('tidy'[, options]);
 */
(function($) {
    var tidytabs = {
        options: {
            tabtext: "More",
            moreLiClass: "ui-tabs-nav-more",
            moreLinkClass: "ui-tabs-nav-more-link",
            moreListClass: "ui-tabs-nav-more-list",
            moreListDefaultClasses: "ui-state-default",
            moreListItemClass: "ui-tabs-nav-more-list-item",
            slideDownOptions: {
                duration: 175,
                easing: 'easeInOutSine'
            },
            slideUpOptions: {
                duration: 175,
                easing: 'easeInOutSine'
            }
        },
        tidy: function(options){
            //Create the 'More' tabs list if it doesn't already exist
            if(undefined === this.moreLi || 0 === this.moreLi.length){
                this._createMoreTab();
                this._bindEvents();
            }
            this._doTidyTabs();
        },
        _createMoreTab: function(that){
                //Cache the scope of this
            var that = this,
                //Clone the original list of tabs and insert into a 'more' <li>
                $tabsClone = that.list.clone();

            //Remove any existing classes from the <ul> and add some useful classes
            $tabsClone.attr('class', '').addClass(that.options.moreListClass +' '+ that.options.moreListDefaultClasses + ' ui-tabs-hide').find('li').each(function(index, elem){
                //Remove any existing classes hide the cloned <li>'s
                $(elem).attr('class', '').addClass(that.options.moreListItemClass + ' ui-tabs-hide');
            });

            //Create the 'More' tab and append to the original list of tabs
            that.list.append('<li class="'+ that.options.moreLiClass +' ui-state-default ui-corner-top parent-item ui-tabs-hide"><a class="'+ that.options.moreLinkClass +'" href="#"><span class="tab-title">'+ that.options.tabtext +'</span></a></li>');

            //Create a protected property to store a reference to the 'more' <li>
            that.moreLi = $("li." + that.options.moreLiClass, that.list);
            //Create a protected property to store a reference to the 'more' <a>
            that.moreLink = $("li a." + that.options.moreLinkClass, that.list);

            //Hide then add the cloned list to the 'more' <li>
            that.moreLi.append($tabsClone);

            //Create a protected property to store a reference to the 'more' <ul>
            that.moreList = that.moreLi.find("ul." + that.options.moreListClass);
        },
        _bindEvents: function(that){
            //Cache the scope of this
            var that = this;
            //Bind a click event to the more tab
            that.moreLink.bind('click', function(e){
                e.preventDefault();
                if(!that.moreList.is(':visible')){
                    that.moreList.hide().removeClass('ui-tabs-hide').slideDown(that.options.slideDownOptions);
                }else{
                    that.moreList.slideUp(that.options.slideUpOptions);
                }
            });

            // debulked onresize handler
            function on_resize(c,t){onresize=function(){clearTimeout(t);t=setTimeout(c,25)};return c};

            on_resize(function(){
                that._doTidyTabs();
            })();

            //Ensure that tabs will be tidied if the browser window is resized
            /*$(window).bind('resize', function(){
                that._doTidyTabs();
            });*/
        },
        _doTidyTabs: function(that){
            //Cache the scope of this
            var that = this;

            //Put moreLi back into the flow of the DOM to calculate width
            this.moreLi.css({opacity:0}).removeClass('ui-tabs-hide');

            var totalOffset = 0,
                remainder   = 0,
                listWidth = Math.floor(that.list.width()),
                $tabLis = $("> li", that.list).not("li." + that.options.moreLiClass),
                tabLiHidden = false,
                tabLisNumber = $tabLis.length,
                moreLiWidth = Math.ceil(that.moreLi.outerWidth(true));

            //Return moreLi to its original state
            that.moreLi.addClass('ui-tabs-hide').css({opacity:1});

            console.info('listWidth: ', listWidth);

            //Loop through the <li> elements in the list to calculate the total width
            $tabLis.each(function(index, elem){
                //Ensure this <li> is not set to display:none, otherwise dimensions cannot be calculated
                if(!$(elem).is(":visible")){
                    console.warn($(elem), 'is hidden');
                    tabLiHidden = true;
                    $(elem).css({opacity:0, display:'block'});
                }
                //Set tabIndex to 1 based value rather than 0 to make it easier to determine which <li> should drop off
                var tabIndex = index + 1,
                    liWidth = Math.ceil($(elem).outerWidth(true)),
                    liClasses = $(elem).attr("class"),
                    $clonedLi = that.moreList.children('li').eq(index);

                if(tabIndex === tabLisNumber){
                    //Remove moreLiWidth value as we won't need to squeeze in the 'more' <li> after the last <li>
                    moreLiWidth = 0;
                }
                //Add the width of this <li> to the total variable
                totalOffset += liWidth;

                //remainder is the amount of extra space we would have after the <li> if it is visible
                remainder = (listWidth - totalOffset) - moreLiWidth;

                console.groupCollapsed('Position data for Tab#' + tabIndex, $(elem));
                    console.log('totalOffset: ', totalOffset);
                    console.log('moreLiWidth: ', moreLiWidth);
                    console.log('remainder: ', remainder);
                    console.log('liWidth: ', liWidth);

                //Only tidy this tab if there is not enough space
                if(remainder < 0){
                    //Hide the original <li>
                    $(elem).hide();
                    //Show the 'more' <li>
                    that.moreLi.addClass(liClasses).removeClass('ui-tabs-hide');
                    //Cache the 'more' <li> that corresponds with this <li> in the original list
                    //Show the 'more' <li> item
                    $clonedLi.removeClass('ui-tabs-hide');
                    console.info('There is NOT enough space for Tab#' + tabIndex, $(elem));
                }else{
                    //Show the original <li> and hide the 'more' <li>
                    $(elem).removeClass('ui-tabs-hide');
                    if(true === tabLiHidden){
                        $(elem).css({opacity:1});
                    }
                    that.moreLi/*.add($clonedLi)*/.addClass('ui-tabs-hide');
                    $clonedLi.addClass('ui-tabs-hide');
                    console.info('There IS enough space for Tab#' + tabIndex, $(elem));
                }
                console.groupEnd();
            });
        }
    };
    //Extend the jQuery UI tabs plugin with the tidytabs properties & methods
    $.extend(true, $['ui']['tabs'].prototype, tidytabs);
})(jQuery);