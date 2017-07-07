define(["jquery","qlik",  
  "text!./table_style.css"
  ],  
  function($,qlik,cssContent) {  
   'use strict';  
   $("<style>").html(cssContent).appendTo("head");  

   var lastrowG=0;
   var dirty=0;
   var morePressed=0;

 

   function rowsMaker( $element,rows, dimensionInfo,lastrow,InitialRows)
   {   
    var appendElement="";
    var cnt=0,
    newRow=0;

    var appendBlock=0;
    var keepHold=[];


    console.log("hasdasd");
    rows.forEach(function(row,keyUp)
    {
       if( row[0].qElemNumber >= 0)
       {

        appendElement+='<tr ';
        row.forEach(function (cell, key)
        {

            keepHold.push(cell.qText);
            console.log(dimensionInfo);
            appendElement+='class=" hoverClass selectable  data state'+row[0].qState+'" data-value="'+row[0].qElemNumber+'" data-dimension="0">';

                            //console.log(appendElement);
                            if(newRow === 0)
                            {



                                if( keyUp === 0 && morePressed === 1)
                                {

                                    if( morePressed == 1)
                                    {
                                        appendElement+="<td class='index_col'>#"+(lastrow)+"</td>";    
                                    }
                                    
                                    appendElement+="<td>"+cell.qText+"</td>";
                                    
                                }
                                else
                                {
                                    appendElement+="<td>#"+(lastrow+keyUp)+"</td>";
                                    appendElement+="<td>"+cell.qText+"</td>";

                                }
                                

                                newRow=1;
                            }
                            else
                            {

                                if(cell.qIsOtherCell){
                                    cell.qText= dimensionInfo[key].othersLabel;
                                    
                                    
                                }
                                appendElement+="<td";
                                if( !isNaN (cell.qNum))
                                {

                                    appendElement+="class='numeric'";
                                    
                                }
                                appendElement+='>'+cell.qText+'</td>';
                                appendElement+="<td>"+cell.qText+"</td>";
                            }

                        });
        cnt++;

        lastrowG=lastrow+cnt;    
        newRow=0;
        appendElement +='</tr>';
        var breakline=InitialRows+keyUp+1;
    }



       });
    return appendElement;




}



            /*
            *Properties custom menu 
            *Thresshold : Max collumns shoed
            *Data Step: Number of collumns got on more data apply
            *Show Indexex collumn
            */

            var thresshold = {
                ref : "qHyperCubeDef.qInitialDataFetch.0.qHeight",
                translation : "Thresshold",
                type : "number",
                defaultValue : 12
            };

            var datastep={
             ref : "step",
             label:" Data Step",
             translation : "Data Step",
             type : "number",
             defaultValue : 5
         };

         var showIndexes={
            ref:"index.show",
            label:"Show Indexes",
            translation : "Show Indexes",
            component:"switch",
            type:"boolean",
            options:[{
                value: true,
                label:"Show"
            },
            {
                value: false,
                label:"Hide"
            }]
        };

        var thressholdArea={
            label:"Table Settings",
            ref:"thressholds",
            type:"items",
            items:{
                thresshold:thresshold,
                datastep:datastep,
                showindexes:showIndexes,
                 highlighterPicker:{
                            label:"Highlight Color",
                            component:"color-picker",
                            ref:"color",
                            type:"integer",
                            defaultValue:6
                        }
            }
        };

        var palette= [
        "#b0afae",
        "#7b7a78",
        "#545352",
        "#4477aa",
        "#7db8da",
        "#b6d7ea",
        "#46c646",
        "#f93f17",
        "#ffcf02",
        "#276e27",
        "#ffffff",
        "#000000"
        ];


       
        


       

        return {  


            initialProperties : {  
                qHyperCubeDef : {  
                    qDimensions : [],  
                    qMeasures : [],  
                    qInitialDataFetch : [{  
                        qWidth : 10,  
                        qHeight : 12 
                    }]  
                }  
            },  
            definition : 
            {  
                type : "items",  
                component : "accordion",  
                items : {  
                    dimensions : {  
                        uses : "dimensions",  
                        min : 1,  
                        max : 5  
                    },  
                    measures : {  
                        uses : "measures",  
                        min : 1,  
                        max : 2  
                    },  
                    sorting : {  
                        uses : "sorting"  
                    },  
                //Custom Settings  
                settings:{
                    uses: "settings",
                    items:{


                        initFetchRows : thressholdArea
                       

                    }
                },
            }  
        },  
        snapshot : {  
            canTakeSnapshot : true  
        },  
        paint : function($element,layout) {  



            var self=this;  
            var hc=layout.qHyperCube,
            total_rows=hc.qDataPages[0].qMatrix.length,
            total_cols=hc.qDimensionInfo.length + hc.qMeasureInfo.length, //aggregation of all cols
            morebutton = false;

                 


                    /*
                    *layout.qHyperCube.qDataPages[0].qArea.qHeight == initial fetch height!
                    * layout.qHyperCube.qDimensionInfo: dimensions used
                    * layout.qHyperCube.qMeasureInfo: measures used
                    * layout.qHyperCube.qDataPages: the result ---> is an Array
                    * he data is held with qDataPages[0].qDataPages.qMatrix
                    * qDataPages[0].qDataPages.qMatrix is an array of objects (the rows)
                    *
                    */

                    if( dirty === 0)
                    {

                     $element.empty();

                            var dataFrame='<table border="1">';
                            dataFrame+= '<thead>';
                            dataFrame+='<tr>';
                            dataFrame+='<th class="index_col">Index</th>';
                            hc.qDimensionInfo.forEach( function (cell){

                                dataFrame+='<th>'+cell.qFallbackTitle+'</th>';
                            });

                            
                            hc.qMeasureInfo.forEach( function (cell){
                                dataFrame+='<th>'+cell.qFallbackTitle+'</th>';
                            });
                            dataFrame+='</tr>';
                            dataFrame+='</thead>';
                            dataFrame+='<tbody>';
                            
                            for (var r=0; r < hc.qDataPages[0].qMatrix.length; r++) {
                                var cell=hc.qDataPages[0];

                                        dataFrame+='<tr class=" hoverClass selectable  data state'+cell.qMatrix[r][0].qState+'"data-value="'+cell.qMatrix[r][0].qElemNumber+'"data-dimension="'+(r+1)+'">';
                                        for (var c =0; c < cell.qMatrix[r].length; c++) {
                                            if( c === 0)
                                             {
                                                dataFrame += '<td class="index_col">';
                                                dataFrame += "#"+(r+1);
                                                dataFrame += '</td>';
                                                dataFrame +='<td>';
                                                dataFrame += cell.qMatrix[r][c].qText;
                                                dataFrame += '</td>';  
                                                lastrowG=r+1;  
                                            }
                                            else
                                            {

                                                dataFrame += '<td>';
                                                dataFrame += cell.qMatrix[r][c].qText;
                                                dataFrame += '</td>';
                                            }
                                        }
                                        dataFrame += '</tr>';


                                    }

                                    dataFrame+='</tbody>';
                                    dataFrame+='</table>';
                                    lastrowG=hc.qDataPages[0].qMatrix.length+1;



                                    if ( hc.qSize.qcy > total_rows ) {
                                        dataFrame += "<button class='more buttonExte'>Expand Results</button>";
                                        morebutton = true;
                                    }
                                    


                                    $element.append(dataFrame);   
                                    if(morebutton)
                                    {


                                        var keepRows=total_rows;


                                         $element.find(".more").on("qv-activate",function(){
                                            var requestPage =[{
                                                qTop:total_rows,
                                                qLeft: 0,
                                                qWidth: total_cols,
                                                            qHeight:layout.step  //augments with thresshold number
                                                        }];


                                                        morePressed++;
                                                        self.backendApi.getData(requestPage).then( function (dataPages){
                                                            total_rows+= dataPages[0].qMatrix.length;

                                                            dirty=1;
                                                            if( total_rows >= hc.qSize.qcy){
                                                                $element.find('.more').hide();
                                                                var $button="<button class=' buttonExteMinimize'>Minimize Results</button>";
                                                                $element.append($button);  


                                                                $element.find(".buttonExteMinimize").on("qv-activate",function(){
                                                                    var requestPage =[{
                                                                        qTop:0,
                                                                        qLeft: 0,
                                                                        qWidth: total_cols,
                                                                                            qHeight:layout.step  //augments with thresshold number
                                                                                        }];

                                                                                        self.backendApi.getData(requestPage).then( function (dataPages){
                                                                                            total_rows=dataPages[0].qMatrix.length;
                                                                                            $element.find("tbody").empty();
                                                                                            let intitalize_frame;
                                                                                            lastrowG=1;
                                                                                           
                                                                                            morePressed=0;
                                                                                            dirty=0;
                                                                                            intitalize_frame=rowsMaker($element,dataPages[0].qMatrix, hc.qDimensionInfo,lastrowG,1);
                                                                                            $element.find("tbody").append(intitalize_frame);
                                                                                            $element.find(".buttonExteMinimize").hide();
                                                                                            $element.find('.more').show();

                                                                                        });
                                                                                    });


                                                            }

                                                            var new_dataFrame;



                                                            new_dataFrame=rowsMaker($element,dataPages[0].qMatrix, hc.qDimensionInfo,lastrowG,keepRows);



                                                            $element.find("tbody").append(new_dataFrame);

                                                            
                                                            $(".hoverClass").mouseover(function() {
                                                                
                                                               $(this).css("background-color", 'linear-gradient(top,'+palette[layout.color]+',#000000)');
                                                               $(this).children().css("color", 'white');

                                                           }).mouseout(function() {
                                                                
                                                                $(this).css("background-color","transparent");
                                                                $(this).children().css("color", '#808080');
                                                            });


                                                           
                                                            $element.off( 'qv-activate', '.selectable');
                                                            $element.on('qv-activate','.selectable',function() {
                                                                if(this.hasAttribute("data-value")) {

                                                                    console.log(this);
                                                                 var value = parseInt(this.getAttribute("data-value"), 10);
                                                                
                                                                 //var dim = parseInt( parseInt( this.getAttribute( "data-dimension" ), 10 ));
                                                                 var dim=0;
                                                                
                                                                 self.selectValues(dim, [value], true);
                                                                 console.log(dim);
                                                                 console.log([value]);
                                                                 
                                                                 $element.find("[data-value='"+ value +"']").toggleClass("selected");
                                                                 


                                                             }
                                                         });
                                                        });

                            });

                    }

                    $(document).ready(function()
                    {   
                        
                       
                        if(layout.index.show === false)
                        {
                            
                            $(".index_col").hide(250);
                        }
                        else
                        {
                            $(".index_col").show(550);   
                        }

                        

                        

                       $(".hoverClass").mouseover(function() {
                            
                             $(this).css("background-color", 'linear-gradient(top,'+palette[layout.color]+',#000000)');
                             $(this).children().css("color", 'white');

                        }).mouseout(function() {
                            
                            $(this).css("background-color","transparent");
                              $(this).children().css("color", '#808080');
                        });

                    });


                    $element.off( 'qv-activate', '.selectable');
                    $element.on('qv-activate','.selectable', function() {
                        
                                                       
                                                        if(this.hasAttribute("data-value")) {
                                                           var value = parseInt(this.getAttribute("data-value"), 10);
                                                           var dim =0;
                                                           self.selectValues(dim, [value], true);

                                                                
                                                           $element.find("[data-value='"+ value +"']").toggleClass("selected");


                                                       }
                                                   });


                    }    



                    return qlik.Promise.resolve();











}  
};  
});  