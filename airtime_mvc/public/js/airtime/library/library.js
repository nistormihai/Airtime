var AIRTIME = (function(AIRTIME) {
    var mod,
        libraryInit,
        oTable,
        $libContent,
        $libTable,
        LIB_SELECTED_CLASS = "lib-selected",
        chosenItems = {},
        visibleChosenItems = {};
    
    var criteriaTypes = {
        0             : "",
        "album_title" : "s",
        "artist_name" : "s",
        "bit_rate"    : "n",
        "bpm"         : "n",
        "comments"    : "s",
        "composer"    : "s",
        "conductor"   : "s",
        "copyright"   : "s",
        "utime"       : "n",
        "mtime"       : "n",
        "lptime"      : "n",
        "disc_number" : "n",
        "encoded_by"  : "s",
        "genre"       : "s",
        "isrc_number" : "s",
        "label"       : "s",
        "language"    : "s",
        "length"      : "n",
        "lyricist"    : "s",
        "mime"        : "s",
        "mood"        : "s",
        "name"        : "s",
        "orchestra"   : "s",
        "rating"      : "n",
        "sample_rate" : "n",
        "track_title" : "s",
        "track_num"   : "n",
        "year"        : "n",
        "owner_id"    : "s",
        "info_url"    : "s",
        "replay_gain" : "n"
    };
    
    if (AIRTIME.library === undefined) {
        AIRTIME.library = {};
    }
    mod = AIRTIME.library;
    
    mod.getChosenItemsLength = function(){
        var cItem,
            selected,
            $trs;


        // Get visible items and check if any chosenItems are visible
        $trs = $libTable.find("tbody input:checkbox").parents("tr");
        $trs.each(function(i){
            for (cItem in chosenItems) {
                if (cItem === $(this).attr("id")) {
                    visibleChosenItems[cItem] = $(this).data('aData');
                }
            } 
        });
        
        selected = Object.keys(visibleChosenItems).length;
        visibleChosenItems = {};
        return selected;
    };
    
    mod.getChosenAudioFilesLength = function(){
        //var files = Object.keys(chosenItems),
        var files,
            $trs,
            cItem,
            i, length,
            count = 0,
            reAudio=/^(au|st|pl|bl)/ ;
            
        // Get visible items and check if any chosenItems are visible
        $trs = $libTable.find("tbody input:checkbox").parents("tr");
        $trs.each(function(i){
            for (cItem in chosenItems) {
                if (cItem === $(this).attr("id")) {
                    visibleChosenItems[cItem] = $(this).data('aData');
                }
            } 
        });
        
        files = Object.keys(visibleChosenItems);
        
        for (i = 0, length = files.length; i < length; i++) {
            
            if (files[i].search(reAudio) !== -1) {
                count++;
            }
        }
        visibleChosenItems = {};
        return count;
    };
    
    mod.changeAddButtonText = function($button, btnText) {
        $button.text(btnText);
    }
    
    mod.createToolbarButtons = function() {
        $menu = $("<div class='btn-toolbar' />");
        $menu
            .append("<div class='btn-group'>" +
                        "<button class='btn btn-small dropdown-toggle' data-toggle='dropdown'>" +
                            "Select <span class='caret'></span>" +
                        "</button>" +
                        "<ul class='dropdown-menu'>" +
                            "<li id='sb-select-page'><a href='#'>Select this page</a></li>" +
                            "<li id='sb-dselect-page'><a href='#'>Deselect this page</a></li>" +
                            "<li id='sb-dselect-all'><a href='#'>Deselect all</a></li>" +
                        "</ul>" +
                    "</div>")
            .append("<div class='btn-group'>" +
                        "<button class='btn btn-small' id='library-plus'>" +
                            "<i class='icon-white icon-plus'></i>" +
                            "<span id='lib-plus-text'></span>" +
                        "</button>" +
                    "</div>")
            .append("<div class='btn-group'>" +
                        "<button class='btn btn-small' id='sb-trash'>" +
                            "<i class='icon-white icon-trash'></i>" +
                        "</button>" +
                    "</div>");
    }
    
    mod.createToolbarDropDown = function() {
        $('#sb-select-page').click(function(){mod.selectCurrentPage();});
        $('#sb-dselect-page').click(function(){mod.deselectCurrentPage();});
        $('#sb-dselect-all').click(function(){mod.selectNone();});
    };
    
    mod.checkDeleteButton = function() {
        var selected = mod.getChosenItemsLength(),
            check = false;
        
        if (selected !== 0) {
            check = true;
        }
        
        if (check === true) {
            AIRTIME.button.enableButton("btn-group #sb-trash", false);
        }
        else {
            AIRTIME.button.disableButton("btn-group #sb-trash", false);
        }
    };
    
    mod.checkToolBarIcons = function() {
        
        AIRTIME.library.checkAddButton();
        AIRTIME.library.checkDeleteButton();        
    };
    
    mod.getSelectedData = function() {
        var id,
            data = [],
            cItem,
            $trs;
            
        $.fn.reverse = [].reverse;
        
        // Get visible items and check if any chosenItems are visible
        $trs = $libTable.find("tbody input:checkbox").parents("tr").reverse();
        $trs.each(function(i){
            for (cItem in chosenItems) {
                if (cItem === $(this).attr("id")) {
                    visibleChosenItems[cItem] = $(this).data('aData');
                }
            } 
        });
        
        for (id in visibleChosenItems) {
            if (visibleChosenItems.hasOwnProperty(id)) {
                data.push(visibleChosenItems[id]);
            }
        }
        visibleChosenItems = {};
        return data;
    };
    
    mod.redrawChosen = function() {
        var ids = Object.keys(chosenItems),
            i, length,
            $el;
        
        for (i = 0, length = ids.length; i < length; i++) {
            $el = $libTable.find("#"+ids[i]);
            
            if ($el.length !== 0) {
                mod.highlightItem($el);
            }
        }
    };
    
    mod.isChosenItem = function($el) {
        var id = $el.attr("id"),
            item = chosenItems[id];

        return item !== undefined ? true : false;
    };
    
    mod.addToChosen = function($el) {
        var id = $el.attr("id");
        
        chosenItems[id] = $el.data('aData');
    };
    
    mod.removeFromChosen = function($el) {
        var id = $el.attr("id");
        
        //used to not keep dragged items selected.
        if (!$el.hasClass(LIB_SELECTED_CLASS)) {
            delete chosenItems[id];
        }   
    };
    
    mod.highlightItem = function($el) {
        var $input = $el.find("input");
    
        $input.attr("checked", true);
        $el.addClass(LIB_SELECTED_CLASS);
    };
    
    mod.unHighlightItem = function($el) {
        var $input = $el.find("input");
    
        $input.attr("checked", false);
        $el.removeClass(LIB_SELECTED_CLASS);
    };
    
    mod.selectItem = function($el) {
        
        mod.highlightItem($el);
        mod.addToChosen($el);
        
        mod.checkToolBarIcons();
    };
    
    mod.deselectItem = function($el) {
        
        mod.unHighlightItem($el);
        mod.removeFromChosen($el);
        
        mod.checkToolBarIcons();
    };
    
    /*
     * selects all items which the user can currently see.
     * (behaviour taken from gmail)
     * 
     * by default the items are selected in reverse order
     * so we need to reverse it back
     */
    mod.selectCurrentPage = function() {
        $.fn.reverse = [].reverse;
        var $inputs = $libTable.find("tbody input:checkbox"),
            $trs = $inputs.parents("tr").reverse();
            
        $inputs.attr("checked", true);
        $trs.addClass(LIB_SELECTED_CLASS);

        $trs.each(function(i, el){
            $el = $(this);
            mod.addToChosen($el);
        });

        mod.checkToolBarIcons();
          
    };
    
    /*
     * deselects all items that the user can currently see.
     * (behaviour taken from gmail)
     */
    mod.deselectCurrentPage = function() {
        var $inputs = $libTable.find("tbody input:checkbox"),
            $trs = $inputs.parents("tr"),
            id;
        
        $inputs.attr("checked", false);
        $trs.removeClass(LIB_SELECTED_CLASS);
        
        $trs.each(function(i, el){
            $el = $(this);
            id = $el.attr("id");
            delete chosenItems[id];
        });
        
        mod.checkToolBarIcons();     
    };
    
    mod.selectNone = function() {
        var $inputs = $libTable.find("tbody input:checkbox"),
            $trs = $inputs.parents("tr");
        
        $inputs.attr("checked", false);
        $trs.removeClass(LIB_SELECTED_CLASS);
        
        chosenItems = {};
        
        mod.checkToolBarIcons();
    };
    
    mod.fnDeleteItems = function(aMedia) {
       
        $.post("/library/delete", 
            {"format": "json", "media": aMedia}, 
            function(json){
                if (json.message !== undefined) {
                    alert(json.message);
                }
                chosenItems = {};
                oTable.fnStandingRedraw();
            });
    };
    
    mod.fnDeleteSelectedItems = function() {
    	if (confirm('Are you sure you want to delete the selected item(s)?')) {
	        var aData = AIRTIME.library.getSelectedData(),
	            item,
	            temp,
	            aMedia = [];
	        
	        //process selected files/playlists.
	        for (item in aData) {
	            temp = aData[item];
	            if (temp !== null && temp.hasOwnProperty('id') ) {
	                aMedia.push({"id": temp.id, "type": temp.ftype});
	            }   
	        }
	    
	        AIRTIME.library.fnDeleteItems(aMedia);
    	}
    };
    
    libraryInit = function() {
        
        $libContent = $("#library_content");
        
        /*
         * Icon hover states in the toolbar.
         */
        $libContent.on("mouseenter", ".fg-toolbar ul li", function(ev) {
            $el = $(this);
            
            if (!$el.hasClass("ui-state-disabled")) {
                $el.addClass("ui-state-hover");
            }       
        });
        $libContent.on("mouseleave", ".fg-toolbar ul li", function(ev) {
            $el = $(this);
            
            if (!$el.hasClass("ui-state-disabled")) {
                $el.removeClass("ui-state-hover");
            } 
        });
        
        var colReorderMap = new Array();
        
        $libTable = $libContent.find("table");
        
        var tableHeight = $libContent.height() - 130;
        
        function setColumnFilter(oTable){
            // TODO : remove this dirty hack once js is refactored
            if (!oTable.fnSettings()) { return ; }
            var aoCols = oTable.fnSettings().aoColumns;
            var colsForAdvancedSearch = new Array();
            var advanceSearchDiv = $("div#advanced_search");
            advanceSearchDiv.empty();
            $.each(aoCols, function(i,ele){
                if (ele.bSearchable) {
                    var currentColId = ele._ColReorder_iOrigCol;
                    
                    var inputClass = 'filter_column filter_number_text'; 
                    var labelStyle = "style='margin-right:35px;'";
                    if (criteriaTypes[ele.mDataProp] != "s") {
                        inputClass = 'filterColumn filter_number_range';
                        labelStyle = "";
                    }
                    
                    if (ele.bVisible) {
                        advanceSearchDiv.append(
                            "<div id='advanced_search_col_"+currentColId+" class='control-group'>" +
                                "<label class='control-label'"+labelStyle+">"+ele.sTitle+" : </label>" +
                                "<div id='"+ele.mDataProp+"' class='controls "+inputClass+"'></div>" +
                            "</div>");
                    } else {
                        advanceSearchDiv.append(
                            "<div id='advanced_search_col_"+currentColId+"' class='control-group' style='display:none;'>" +
                                "<label class='control-label'"+labelStyle+">"+ele.sTitle+"</label>" +
                                "<div id='"+ele.mDataProp+"' class='controls "+inputClass+"'></div>" +
                            "</div>");
                    }
                    
                    if (criteriaTypes[ele.mDataProp] == "s") {
                        var obj = { sSelector: "#"+ele.mDataProp }
                    } else {
                        var obj = { sSelector: "#"+ele.mDataProp, type: "number-range" }
                    }
                    colsForAdvancedSearch.push(obj);
                } else {
                    colsForAdvancedSearch.push(null);
                }
            });
            
            oTable.columnFilter({
                aoColumns: colsForAdvancedSearch,
                bUseColVis: true,
                sPlaceHolder: "head:before"
                }
            );
        }
        
        function setFilterElement(iColumn, bVisible){
            var actualId = colReorderMap[iColumn];
            var selector = "div#advanced_search_col_"+actualId;
            if (bVisible) {
                $(selector).show();
            } else {
                $(selector).hide();
            }
        }
        
        var currentColOrder = new Array();
        
        oTable = $libTable.dataTable( {
            
            //put hidden columns at the top to insure they can never be visible on the table through column reordering.
            "aoColumns": [
              /* ftype         */  { "sTitle" : ""              , "mDataProp" : "ftype"        , "bSearchable" : false                 , "bVisible"    : false                   }          , 
              /* Checkbox      */  { "sTitle" : ""              , "mDataProp" : "checkbox"     , "bSortable"   : false                 , "bSearchable" : false                   , "sWidth" : "25px"         , "sClass"    : "library_checkbox" }  , 
              /* Type          */  { "sTitle" : ""              , "mDataProp" : "image"        , "bSearchable" : false                 , "sWidth"      : "25px"                  , "sClass" : "library_type" , "iDataSort" : 0                  }  ,
              /* Title         */  { "sTitle" : "Title"         , "mDataProp" : "track_title"  , "sClass"      : "library_title"       , "sWidth"      : "170px"                 }          , 
              /* Creator       */  { "sTitle" : "Creator"       , "mDataProp" : "artist_name"  , "sClass"      : "library_creator"     , "sWidth"      : "160px"                 }          ,  
              /* Album         */  { "sTitle" : "Album"         , "mDataProp" : "album_title"  , "sClass"      : "library_album"       , "sWidth"      : "150px"                 }          , 
              /* Bit Rate      */  { "sTitle" : "Bit Rate"      , "mDataProp" : "bit_rate"     , "bVisible"    : false                 , "sClass"      : "library_bitrate"       , "sWidth" : "80px"         }, 
              /* BPM           */  { "sTitle" : "BPM"           , "mDataProp" : "bpm"          , "bVisible"    : false                 , "sClass"      : "library_bpm"           , "sWidth" : "50px"         },
              /* Composer      */  { "sTitle" : "Composer"      , "mDataProp" : "composer"     , "bVisible"    : false                 , "sClass"      : "library_composer"      , "sWidth" : "150px"        }, 
              /* Conductor     */  { "sTitle" : "Conductor"     , "mDataProp" : "conductor"    , "bVisible"    : false                 , "sClass"      : "library_conductor"     , "sWidth" : "125px"        },
              /* Copyright     */  { "sTitle" : "Copyright"     , "mDataProp" : "copyright"    , "bVisible"    : false                 , "sClass"      : "library_copyright"     , "sWidth" : "125px"        },
              /* Encoded       */  { "sTitle" : "Encoded By"    , "mDataProp" : "encoded_by"   , "bVisible"    : false                 , "sClass"      : "library_encoded"       , "sWidth" : "150px"        }, 
              /* Genre         */  { "sTitle" : "Genre"         , "mDataProp" : "genre"        , "bVisible"    : false                 , "sClass"      : "library_genre"         , "sWidth" : "100px"        }, 
              /* ISRC Number   */  { "sTitle" : "ISRC"          , "mDataProp" : "isrc_number"  , "bVisible"    : false                 , "sClass"      : "library_isrc"          , "sWidth" : "150px"        }, 
              /* Label         */  { "sTitle" : "Label"         , "mDataProp" : "label"        , "bVisible"    : false                 , "sClass"      : "library_label"         , "sWidth" : "125px"        }, 
              /* Language      */  { "sTitle" : "Language"      , "mDataProp" : "language"     , "bVisible"    : false                 , "sClass"      : "library_language"      , "sWidth" : "125px"        }, 
              /* Last Modified */  { "sTitle" : "Last Modified" , "mDataProp" : "mtime"        , "bVisible"    : false                 , "sClass"      : "library_modified_time" , "sWidth" : "125px"        },
              /* Last Played   */  { "sTitle" : "Last Played  " , "mDataProp" : "lptime"       , "bVisible"    : false                 , "sClass"      : "library_modified_time" , "sWidth" : "125px"        },  
              /* Length        */  { "sTitle" : "Length"        , "mDataProp" : "length"       , "sClass"      : "library_length"      , "sWidth"      : "80px"                  }          , 
              /* Mime          */  { "sTitle" : "Mime"          , "mDataProp" : "mime"         , "bVisible"    : false                 , "sClass"      : "library_mime"          , "sWidth" : "80px"         }, 
              /* Mood          */  { "sTitle" : "Mood"          , "mDataProp" : "mood"         , "bVisible"    : false                 , "sClass"      : "library_mood"          , "sWidth" : "70px"         },
              /* Owner         */  { "sTitle" : "Owner"         , "mDataProp" : "owner_id"     , "bVisible"    : false                 , "sClass"      : "library_language"      , "sWidth" : "125px"        }, 
              /* Replay Gain   */  { "sTitle" : "Replay Gain"   , "mDataProp" : "replay_gain"  , "bVisible"    : false                 , "sClass"      : "library_replay_gain"      , "sWidth" : "80px"      }, 
              /* Sample Rate   */  { "sTitle" : "Sample Rate"   , "mDataProp" : "sample_rate"  , "bVisible"    : false                 , "sClass"      : "library_sr"            , "sWidth" : "80px"         }, 
              /* Track Number  */  { "sTitle" : "Track Number"  , "mDataProp" : "track_number" , "bVisible"    : false                 , "sClass"      : "library_track"         , "sWidth" : "65px"         }, 
              /* Upload Time   */  { "sTitle" : "Uploaded"      , "mDataProp" : "utime"        , "sClass"      : "library_upload_time" , "sWidth"      : "125px"                 }          ,
              /* Website       */  { "sTitle" : "Website"       , "mDataProp" : "info_url"     , "bVisible"    : false                 , "sClass"      : "library_url"           , "sWidth" : "150px"        },
              /* Year          */  { "sTitle" : "Year"          , "mDataProp" : "year"         , "bVisible"    : false                 , "sClass"      : "library_year"          , "sWidth" : "60px"         }
              ],
                          
            "bProcessing": true,
            "bServerSide": true,
            
            "aLengthMenu": [[5, 10, 15, 20, 25, 50, 100], [5, 10, 15, 20, 25, 50, 100]],
                 
            "bStateSave": true,
            "fnStateSaveParams": function (oSettings, oData) {
                //remove oData components we don't want to save.
                delete oData.oSearch;
                delete oData.aoSearchCols;
            },
            "fnStateSave": function (oSettings, oData) {
                localStorage.setItem('datatables-library', JSON.stringify(oData));
                $.ajax({
                    url: "/usersettings/set-library-datatable",
                    type: "POST",
                    data: {settings : oData, format: "json"},
                    dataType: "json"
                  });
                
                colReorderMap = oData.ColReorder;
            },
            "fnStateLoad": function fnLibStateLoad(oSettings) {
                var settings = localStorage.getItem('datatables-library');
                
                if (settings !== "") {
                    return JSON.parse(settings);
                }
            },
            "fnStateLoadParams": function (oSettings, oData) {
                var i,
                    length,
                    a = oData.abVisCols;
                
                //putting serialized data back into the correct js type to make
                //sure everything works properly.
                for (i = 0, length = a.length; i < length; i++) {
                    if (typeof(a[i]) === "string") {
                        a[i] = (a[i] === "true") ? true : false;
                    } 
                }
                
                a = oData.ColReorder;
                for (i = 0, length = a.length; i < length; i++) {
                    if (typeof(a[i]) === "string") {
                        a[i] = parseInt(a[i], 10);
                    }
                }
                
                oData.iEnd = parseInt(oData.iEnd, 10);
                oData.iLength = parseInt(oData.iLength, 10);
                oData.iStart = parseInt(oData.iStart, 10);
                oData.iCreate = parseInt(oData.iCreate, 10);
            },
            
            "sAjaxSource": "/Library/contents-feed",
            "sAjaxDataProp": "files",
            
            "fnServerData": function ( sSource, aoData, fnCallback ) {
                /* The real validation check is done in dataTables.columnFilter.js
                 * We also need to check it here because datatable is redrawn everytime
                 * an action is performed in the Library page.
                 * In order for datatable to redraw the advanced search fields
                 * MUST all be valid.
                 */
                var advSearchFields = $("div#advanced_search").children(':visible');
                var advSearchValid = validateAdvancedSearch(advSearchFields);
                var type;
                aoData.push( { name: "format", value: "json"} );
                aoData.push( { name: "advSearch", value: advSearchValid} );
                
                //push whether to search files/playlists or all.
                type = $("#library_display_type").find("select").val();
                type = (type === undefined) ? 0 : type;
                aoData.push( { name: "type", value: type} );
            
                $.ajax( {
                    "dataType": 'json',
                    "type": "POST",
                    "url": sSource,
                    "data": aoData,
                    "success": fnCallback
                } );
            },
            "fnRowCallback": AIRTIME.library.fnRowCallback,
            "fnCreatedRow": function( nRow, aData, iDataIndex ) {
                
                //add the play function to the library_type td
                $(nRow).find('td.library_type').click(function(){
                    if (aData.ftype === 'playlist' && aData.length !== '0.0'){
                        playlistIndex = $(this).parent().attr('id').substring(3); //remove the pl_
                        open_playlist_preview(playlistIndex, 0);
                    } else if (aData.ftype === 'audioclip') {
                        open_audio_preview(aData.ftype, aData.audioFile, aData.track_title, aData.artist_name);
                    } else if (aData.ftype == 'stream') {
                        open_audio_preview(aData.ftype, aData.audioFile, aData.track_title, aData.artist_name);
                    } else if (aData.ftype == 'block' && aData.bl_type == 'static') {
                        blockIndex = $(this).parent().attr('id').substring(3); //remove the bl_
                        open_block_preview(blockIndex, 0);
                    }
                    return false;
                });
                
                alreadyclicked=false;
                //call the context menu so we can prevent the event from propagating.
                $(nRow).find('td:not(.library_checkbox, .library_type)').click(function(e){
                    var el=$(this);
                    if (alreadyclicked)
                    {
                        alreadyclicked=false; // reset
                        clearTimeout(alreadyclickedTimeout); // prevent this from happening
                        // do what needs to happen on double click.
                        
                        $tr = $(el).parent();
                        data = $tr.data("aData");
                        AIRTIME.library.dblClickAdd(data, data.ftype);
                    }
                    else
                    {
                        alreadyclicked=true;
                        alreadyclickedTimeout=setTimeout(function(){
                            alreadyclicked=false; // reset when it happens
                            // do what needs to happen on single click. 
                            // use el instead of $(this) because $(this) is 
                            // no longer the element
                            el.contextMenu({x: e.pageX, y: e.pageY});
                        },300); // <-- dblclick tolerance here
                    }
                    return false;
                });
                
                //add a tool tip to appear when the user clicks on the type icon.
                $(nRow).find("td:not(.library_checkbox, .library_type)").qtip({
                    content: {
                        text: "Loading...",
                        title: {
                            text: aData.track_title
                        },
                        ajax: {
                            url: "/Library/get-file-metadata",
                            type: "get",
                            data: ({format: "html", id : aData.id, type: aData.ftype}),
                            success: function(data, status) {
                                this.set('content.text', data);
                            }
                        }
                    },
                    position: {
                        target: 'event',
                        adjust: {
                            resize: true,
                            method: "flip flip"
                        },
                        my: 'left center',
                        at: 'right center',
                        viewport: $(window), // Keep the tooltip on-screen at all times
                        effect: false // Disable positioning animation
                    },
                    style: {
                        classes: "ui-tooltip-dark file-md-long"
                    },
                    show: 'mousedown',
                    events: {
                       show: function(event, api) {
                         // Only show the tooltip if it was a right-click
                         if(event.originalEvent.button !== 2) {
                            event.preventDefault();
                         }
                       }
                    },
                    hide: {event:'mouseout', delay: 50, fixed:true}  
                });
            },
           //remove any selected nodes before the draw.
            "fnPreDrawCallback": function( oSettings ) {
                
                //make sure any dragging helpers are removed or else they'll be stranded on the screen.
                $("#draggingContainer").remove();
            },
            "fnDrawCallback": AIRTIME.library.fnDrawCallback,
            
            "aaSorting": [[3, 'asc']],
            "sPaginationType": "full_numbers",
            "bJQueryUI": true,
            "bAutoWidth": false,
            "oLanguage": {
                "sSearch": "",
                "sLengthMenu": "Show _MENU_"
            },
            
            // R = ColReorder, C = ColVis
            "sDom": 'Rl<"#library_display_type">f<"dt-process-rel"r><"H"<"library_toolbar"C>><"dataTables_scrolling"t><"F"ip>',
            
            "oColVis": {
                "sAlign": "right",
                "aiExclude": [0, 1, 2],
                "sSize": "css",
                "fnStateChange": setFilterElement
            },
            
            "oColReorder": {
                "iFixedColumns": 3
            }
            
        });

        setColumnFilter(oTable);
        oTable.fnSetFilteringDelay(350);
        
        $libContent.on("click", "legend", function(){
            var $fs = $(this).parents("fieldset");

            if ($fs.hasClass("closed")) {
                $fs.removeClass("closed");
            }
            else {
                $fs.addClass("closed");
            }
        });
       
        $libContent.find(".dataTables_scrolling").css("max-height", tableHeight);
        
        AIRTIME.library.setupLibraryToolbar(oTable);
        
        $("#library_display_type")
            .addClass("dataTables_type")
            .append('<select name="library_display_type" />')
            .find("select")
                .append('<option value="0">All</option>')
                .append('<option value="1">Files</option>')
                .append('<option value="2">Playlists</option>')
                .append('<option value="3">Smart Blocks</option>')
                .append('<option value="4">Web Streams</option>')
                .end()
            .change(function(ev){
                oTable.fnDraw();
            });
        
        $libTable.find("tbody").on("click", "input[type=checkbox]", function(ev) {
            
            var $cb = $(this),
                $prev,
                $tr = $cb.parents("tr"),
                $trs;
            
            if ($cb.is(":checked")) {
                
                if (ev.shiftKey) {
                    $prev = $libTable.find("tbody").find("tr."+LIB_SELECTED_CLASS).eq(-1);
                    $trs = $prev.nextUntil($tr);
                    
                    $trs.each(function(i, el){
                        mod.selectItem($(el));
                    });
                }

                mod.selectItem($tr);
            }
            else {
                mod.deselectItem($tr);  
            }
        });
       
        checkImportStatus();
        setInterval(checkImportStatus, 5000);
        setInterval(checkLibrarySCUploadStatus, 5000);
        
        addQtipToSCIcons();
       
        //begin context menu initialization.
        $.contextMenu({
            selector: '#library_display td:not(.library_checkbox)',
            trigger: "left",
            ignoreRightClick: true,
            
            build: function($el, e) {
                var data, screen, items, callback, $tr;
                
                $tr = $el.parent();
                data = $tr.data("aData");
                screen = $tr.data("screen");
                
                function processMenuItems(oItems) {
                    
                    //define an add to playlist callback.
                    if (oItems.pl_add !== undefined) {
                        var aItems = [];
                        
                        callback = function() {
                            aItems.push(new Array(data.id, data.ftype));
                            AIRTIME.playlist.fnAddItems(aItems, undefined, 'after');
                        };
                        
                        oItems.pl_add.callback = callback;
                    }
                    
                    //define an edit callback.
                    if (oItems.edit !== undefined) {
                        
                        if (data.ftype === "audioclip") {
                            callback = function() {
                                document.location.href = oItems.edit.url;
                            };
                        } else if (data.ftype === "playlist" || data.ftype === "block") {
                            callback = function() {
		                        var url = '/Playlist/edit';
                                AIRTIME.playlist.fnEdit(data.id, data.ftype, url);
                                AIRTIME.playlist.validatePlaylistElements();
                            };
                        } else if (data.ftype === "stream") {
                            callback = function() {
		                        var url = '/Webstream/edit';
                                AIRTIME.playlist.fnEdit(data.id, data.ftype, url);
                            }
                        } else {
                            throw new Exception("Unknown type: " + data.ftype);
                        }
                        oItems.edit.callback = callback;
                    }

                    //define a play callback.
                    if (oItems.play !== undefined) {

                        if (oItems.play.mime !== undefined) {
                            if (!isAudioSupported(oItems.play.mime)) {
                                oItems.play.disabled = true;
                            }
                        }

                        callback = function() {
                           if (data.ftype === 'playlist' && data.length !== '0.0'){
                                playlistIndex = $(this).parent().attr('id').substring(3); //remove the pl_
                                open_playlist_preview(playlistIndex, 0);
                            } else if (data.ftype === 'audioclip' || data.ftype === 'stream') {
                                open_audio_preview(data.ftype, data.audioFile, data.track_title, data.artist_name);
                            } else if (data.ftype === 'block') {
                                blockIndex = $(this).parent().attr('id').substring(3); //remove the pl_
                                open_block_preview(blockIndex, 0);
                            }
                        };
                        oItems.play.callback = callback;
                    }
                    
                    //define a delete callback.
                    if (oItems.del !== undefined) {
                        
                        //delete through the playlist controller, will reset
                        //playlist screen if this is the currently edited playlist.
                        if ((data.ftype === "playlist" || data.ftype === "block") && screen === "playlist") {
                            callback = function() {
                                aMedia = [];
                                aMedia.push({"id": data.id, "type": data.ftype});
                                if (confirm('Are you sure you want to delete the selected item?')) {
                                    AIRTIME.library.fnDeleteItems(aMedia);
                                }
                            };
                        }
                        else {
                            callback = function() {
                                var media = [];
                                
                                if (confirm('Are you sure you want to delete the selected item?')) {
                                    
                                    media.push({"id": data.id, "type": data.ftype});
                                    $.post(oItems.del.url, {format: "json", media: media }, function(json){
                                        var oTable;
                                        
                                        if (json.message) {
                                            alert(json.message);
                                        }
                                        
                                        oTable = $("#library_display").dataTable();
                                        oTable.fnDeleteRow( $tr[0] );
                                    });
                                }
                            };
                        }
                        
                        oItems.del.callback = callback;
                    }
                    
                    //define a download callback.
                    if (oItems.download !== undefined) {
                        
                        callback = function() {
                            document.location.href = oItems.download.url;
                        };
                        oItems.download.callback = callback;
                    }
                    //add callbacks for Soundcloud menu items.
                    if (oItems.soundcloud !== undefined) {
                        var soundcloud = oItems.soundcloud.items;
                        
                        //define an upload to soundcloud callback.
                        if (soundcloud.upload !== undefined) {
                            
                            callback = function() {
                                $.post(soundcloud.upload.url, function(){
                                    addProgressIcon(data.id);
                                });
                            };
                            soundcloud.upload.callback = callback;
                        }
                        
                        //define a view on soundcloud callback
                        if (soundcloud.view !== undefined) {
                            
                            callback = function() {
                                window.open(soundcloud.view.url);
                            };
                            soundcloud.view.callback = callback;
                        }
                    }
                
                    items = oItems;
                }
                
                request = $.ajax({
                  url: "/library/context-menu",
                  type: "GET",
                  data: {id : data.id, type: data.ftype, format: "json", "screen": screen},
                  dataType: "json",
                  async: false,
                  success: function(json){
                      processMenuItems(json.items);
                  }
                });
    
                return {
                    items: items
                };
            }
        });
    };
    mod.libraryInit = libraryInit;
    
    return AIRTIME;
    
}(AIRTIME || {}));

function checkImportStatus() {
    $.getJSON('/Preference/is-import-in-progress', function(data){
        var div = $('#import_status');
        var table = $('#library_display').dataTable();
        if (data == true){
            div.show();
        }
        else{
            if ($(div).is(':visible')) {
                table.fnStandingRedraw();
            }
            div.hide();
        }
    });
}
    
function addProgressIcon(id) {
    var tr = $("#au_"+id),
        span;
    
    span = tr.find("td.library_title").find("span");
    
    if (span.length > 0){   
        span.removeClass()
            .addClass("small-icon progress");
    }
    else{
        tr.find("td.library_title")
            .append('<span class="small-icon progress"></span>');
    }
}
    
function checkLibrarySCUploadStatus(){
    
    var url = '/Library/get-upload-to-soundcloud-status',
        span,
        id;
    
    function checkSCUploadStatusCallback(json) {
        
        if (json.sc_id > 0) {
            span.removeClass("progress").addClass("soundcloud");
            
        }
        else if (json.sc_id == "-3") {
            span.removeClass("progress").addClass("sc-error");
        }
    }
    
    function checkSCUploadStatusRequest() {
        
        span = $(this);
        id = span.parents("tr").data("aData").id;
       
        $.post(url, {format: "json", id: id, type:"file"}, checkSCUploadStatusCallback);
    }
    
    $("#library_display span.progress").each(checkSCUploadStatusRequest);
}
    
function addQtipToSCIcons(){
    $(".progress, .soundcloud, .sc-error").live('mouseover', function(){
        
        var id = $(this).parent().parent().data("aData").id;
        
        if ($(this).hasClass("progress")){
            $(this).qtip({
                content: {
                    text: "Uploading in progress..."
                },
                position:{
                    adjust: {
                    resize: true,
                    method: "flip flip"
                    },
                    at: "right center",
                    my: "left top",
                    viewport: $(window)
                },
                show: {
                    ready: true // Needed to make it show on first mouseover event
                }
            });
        }
        else if($(this).hasClass("soundcloud")){
            $(this).qtip({
                content: {
                    text: "Retrieving data from the server...",
                    ajax: {
                        url: "/Library/get-upload-to-soundcloud-status",
                        type: "post",
                        data: ({format: "json", id : id, type: "file"}),
                        success: function(json, status){
                            this.set('content.text', "The soundcloud id for this file is: "+json.sc_id);
                        }
                    }
                },
                position:{
                    adjust: {
                    resize: true,
                    method: "flip flip"
                    },
                    at: "right center",
                    my: "left top",
                    viewport: $(window)
                },
                show: {
                    ready: true // Needed to make it show on first mouseover event
                }
            });
        }else if($(this).hasClass("sc-error")){
            $(this).qtip({
                content: {
                    text: "Retreiving data from the server...",
                    ajax: {
                        url: "/Library/get-upload-to-soundcloud-status",
                        type: "post",
                        data: ({format: "json", id : id, type: "file"}),
                        success: function(json, status){
                            this.set('content.text', "There was error while uploading to soundcloud.<br>"+"Error code: "+json.error_code+
                                    "<br>"+"Error msg: "+json.error_msg+"<br>");
                        }
                    }
                },
                position:{
                    adjust: {
                    resize: true,
                    method: "flip flip"
                    },
                    at: "right center",
                    my: "left top",
                    viewport: $(window)
                },
                show: {
                    ready: true // Needed to make it show on first mouseover event
                }
            });
        }
    });
}

/*
 * This function is called from dataTables.columnFilter.js
 */
function validateAdvancedSearch(divs) {
    var valid,
        allValid = true,
        fieldName,
        fields,
        searchTerm = Array(),
        searchTermType,
        regExpr,
        timeRegEx = "\\d{2}[:]([0-5]){1}([0-9]){1}[:]([0-5]){1}([0-9]){1}([.]\\d{1,6})?",
        dateRegEx = "\\d{4}[-]\\d{2}[-]\\d{2}?",
        integerRegEx = "^\\d+$",
        numericRegEx = "^\\d+[.]?\\d*$";

    searchTerm[0] = "";
    searchTerm[1] = "";
    $.each(divs, function(i, div){
        fieldName = $(div).children(':nth-child(2)').attr('id');
        fields = $(div).children().find('input');
        searchTermType = validationTypes[fieldName];
        valid = true;
        
        $.each(fields, function(i, field){
            searchTerm[i] = $(field).val();

            if (searchTerm[i] !== "") {
                
                if (searchTermType === "l") {
                    regExpr = new RegExp("^" +timeRegEx+ "$");
                } else if (searchTermType === "t") {
                    var pieces = searchTerm[i].split(" ");
                    if (pieces.length === 2) {
                        regExpr = new RegExp("^" +dateRegEx+ " " +timeRegEx+ "$");
                    } else if (pieces.length === 1) {
                        regExpr = new RegExp("^" +dateRegEx+ "$");
                    }
                } else if (searchTermType === "i") {
                    regExpr = new RegExp(integerRegEx);
                } else if (searchTermType === "n") {
                    regExpr = new RegExp(numericRegEx);
                    if (searchTerm[i].charAt(0) === "-") {
                        searchTerm[i] = searchTerm[i].substr(1);
                    }
                }
                
                //string fields do not need validation
                if (searchTermType !== "s") {
                    valid = regExpr.test(searchTerm[i]);
                    if (!valid) allValid = false;
                }
                
                addRemoveValidationIcons(valid, $(field), searchTermType);
                
            /* Empty fields should not have valid/invalid indicator
             * Range values are considered valid even if only the
             * 'From' value is provided. Therefore, if the 'To' value
             * is empty but the 'From' value is not empty we need to
             * keep the validation icon on screen.
             */
            } else if (searchTerm[0] === "" && searchTerm[1] !== "" ||
                    searchTerm[0] === "" && searchTerm[1] === ""){
                if ($(field).closest('div').children(':last-child').hasClass('checked-icon') ||
                        $(field).closest('div').children(':last-child').hasClass('not-available-icon')) {
                    $(field).closest('div').children(':last-child').remove();
                }
            }
            
            if (!valid) {
                return false;
            }
        });
    });

    return allValid;
}

function addRemoveValidationIcons(valid, field, searchTermType) {
    var title = '';
    if (searchTermType === 'i') {
        title = 'Input must be a positive number';
    } else if (searchTermType === 'n') {
        title = 'Input must be a number';
    } else if (searchTermType === 't') {
        title = 'Input must be in the format: yyyy-mm-dd';
    } else if (searchTermType === 'l') {
        title = 'Input must be in the format: hh:mm:ss.t';
    }
    
    var validIndicator = " <span class='checked-icon sp-checked-icon'></span>",
        invalidIndicator = " <span title='"+title+"' class='not-available-icon sp-checked-icon'></span>";
    
    if (valid) {
        if (!field.closest('div').children(':last-child').hasClass('checked-icon')) {
            //remove invalid icon before adding valid icon
            if (field.closest('div').children(':last-child').hasClass('not-available-icon')) {
                field.closest('div').children(':last-child').remove();
            }
            field.closest('div').append(validIndicator);
        }
    } else {
        if (!field.closest('div').children(':last-child').hasClass('not-available-icon')) {
            //remove valid icon before adding invalid icon
            if (field.closest('div').children(':last-child').hasClass('checked-icon')) {
                field.closest('div').children(':last-child').remove();
            }
            field.closest('div').append(invalidIndicator);
        }
    }
}

/* Validation types:
 * s => string
 * i => integer
 * n => numeric (positive/negative, whole/decimals)
 * t => timestamp
 * l => length
 */
var validationTypes = {
    "album_title" : "s",
    "artist_name" : "s",
    "bit_rate" : "i",
    "bpm" : "i",
    "comments" : "s",
    "composer" : "s",
    "conductor" : "s",
    "copyright" : "s",
    "encoded_by" : "s",
    "utime" : "t",
    "mtime" : "t",
    "lptime" : "t",
    "disc_number" : "i",
    "genre" : "s",
    "isrc_number" : "s",
    "label" : "s",
    "language" : "s",
    "length" : "l",
    "lyricist" : "s",
    "mood" : "s",
    "mime" : "s",
    "name" : "s",
    "orchestra" : "s",
    "owner_id" : "s",
    "rating" : "i",
    "replay_gain" : "n",
    "sample_rate" : "i",
    "track_title" : "s",
    "track_number" : "i",
    "info_url" : "s",
    "year" : "i"
};
