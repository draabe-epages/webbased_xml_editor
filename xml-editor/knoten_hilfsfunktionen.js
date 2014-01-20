var helpfns = function(node){

};

helpfns.prototype = {

  ajax:    function(){

     var result = null;
     var scriptUrl = "transform.xml";
     $.ajax({
        url: scriptUrl,
        type: 'post',
        dataType: 'xml',
        async: false,
        success: function(data) {
            result = $(data).find("*").toArray();
        } 
     });
     return result;
  },

  ajax_2:    function(url){

       var result = null;
       var scriptUrl = url;
       $.ajax({
          url: scriptUrl,
          type: 'get',
          dataType: 'xml',
          async: false,
          success: function(data) {
              result2 = $(data).find("*").toArray();
          } 
       });
       return result2;
    },

  
  knotenAttribute:  function (knoten){
                    var array_knotenAttr = [];
                    for(var k=0; k<knoten.length; k++){
                      var knotenAttrValues = _.values(knoten[k].attributes);
                      array_knotenAttr.push(knotenAttrValues);
                    };
                    var arrayProperty = [];
                    var arrayAllProperties = [];
                      for(var i=0; i<array_knotenAttr.length; i++){
                        for(var k=0; k<array_knotenAttr[i].length; k++){
                          if((array_knotenAttr[i][k].nodeName != undefined) && (array_knotenAttr[i][k].nodeValue != undefined)){
                            arrayProperty.push([array_knotenAttr[i][k].nodeName, array_knotenAttr[i][k].nodeValue]);
                          };
                        };
                        arrayAllProperties.push(arrayProperty, i);
                        arrayProperty = [];
                      };
                      return arrayAllProperties;
                },

  connectionNodes:    function(savekn){
                      
                      var arrayParent = [];
                      var arrNew = [];
                      $.each(savekn, function(l, m){
                        $(m).attr("id", l);
                        var pEl = m.parentNode;
                        arrayParent.push([l, pEl, pEl.attributes]);
                        arrNew.push([parseInt($(pEl).attr("id")), l]);
                      });
                            console.log(arrNew) 

                    //Arrays miteinander vergleichen
                      function compareArray(k, parentNew){
                      var werteArray = [];
                      var checkDefined = parentNew[k-1];
                        while(checkDefined != undefined){
                          for(var x = 0; k-x>=0; x++){
                            //jeweils die zweite [1] und dritte [2] Stelle im Array abgleichen
                            if((parentNew[k][1] == parentNew[k-x][1]) && (parentNew[k][2] == parentNew[k-x][2])){
                              var wert = true;
                              werteArray.push(k-x-1);  
                            }/*else{var wert = false; werteArray.push(k-x, wert)}*/;
                          };
                        return werteArray;
                        };
                      }; 


                      //Array erstellen, dass jedem Elternelement und allen gleichnamigen Elternelementen, die folgen den gleichen Index zuweist           
                      function parentArrayList(){
                      var parentNew = [];
                      var k = 0;
                      var w = [];
                       for(var i = 0; i<arrayParent.length; i++){
                        //beide Arrays identisch machen
                            parentNew[k] = arrayParent[i];
                            //console.log(compareArray(k, parentNew));
                            var u = _.last(compareArray(k, parentNew), [1]);
                            if((u == undefined) || (u.length == 0)){
                            u = [0];
                           };
                            w.push(u);
                            k++;
                       };
                      return w;
                       };

                     
                      //Verbindungen zwischen einzelnen Knoten erstellen
                      var connections = []; 
                      $.each(savekn, function(i, element){
                      var knotenIndizes = i;
                      connections.push([_.flatten(parentArrayList())[i], knotenIndizes]);   
                      });
                      return connections;
               },

  
  getAttributeNames: function(knoten){
        /*  var arrayAttributNames = [ "Delete",
                                     "Alpha",
                                     "Alias",
                                     "Value",
                                     "Source",
                                     "Target",
                                     "Depends",
                                     "Hue",
                                     "Saturation",
                                     "Brightness",
                                     "background",
                                     "geometry",
                                     "gravity",
                                     "compose",
                                     "resize",
                                     "image",
                                     "permanent"
                                     ];*/
              var arrayAttributNames = ["Delete"];
          for(var i=0; i<knoten.length; i++){
            var w_values = _.values(knoten[i].attributes);
              for(var k=0; k<w_values.length; k++){
                arrayAttributNames.push(w_values[k].nodeName);
                var attrName = _.without(_.union(arrayAttributNames), "x", "y", undefined);
              };
          };  return arrayAttributNames;    
},

  deleteAttribute: function (id){
                    var dropdownMenu = $("#dropdown");
                    if($("#div_"+id).children()[0].value == "Delete"){
                      $("#div_"+id).remove();
                        for(var i=0; i<dropdownMenu.children().length; i++){
                          if(dropdownMenu.children()[i] != undefined){
                            dropdownMenu.children()[i].id = "div_"+i;
                          } 
                        }
                    }
              },


  update: function(g){
          var i, j, chunk = 2;
            var chunkPos = 2;
            //i = i+chunk;
            for (i=0, j=arrayLabel.length; i<j; i+=chunk) {
            var temparray = arrayLabel.slice(i,i+chunk);
            var temparray2 = arrayPositions.slice(i,i+chunkPos);
              for(var k=0; k<temparray.length; k++){
                var lb = temparray[0];
                var id = temparray[1];
                var xp = save.arrayPositions[_.indexOf(save.arrayPositions, id)+1][0];
                var yp = save.arrayPositions[_.indexOf(save.arrayPositions, id)+1][1];
              };
              g.addNode(id, {render: renderMainFunction, x: xp+65, y: yp, label: lb});
            };
            for(var i=0; i<arrayEdges.length; i++){
              g.addEdge(arrayEdges[i][0], arrayEdges[i][1], {directed: true});
            };
  },

  positions:   function(i){
               var x = save.arrayPositions[_.indexOf(save.arrayPositions, i)+1][0];
               var y = save.arrayPositions[_.indexOf(save.arrayPositions, i)+1][1];
               var pos = " x=\""+x+"\""+" y=\""+y+"\"";
               return pos;
  }, 

  generateXML: function(){
                var onlyParentNodes = [];
                var temp = [];
                var arrayEdgesTemporary = [];
                var readyForOutput = ["<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n"];

                
                //1) alle Elemente herausfinden, an denen andere Elemente hängen (Verschachtelung nicht berücksichtigt) und zusammenbauen
                for(var i=0; i<=arrayEdges.length; i++){
                  var parentNodeInXMLNotation = [];
                  var arrayWithParentNode = _.findWhere(arrayEdges, [i, ]);
                  if(arrayWithParentNode != undefined){
                     var indexOfThisparentNodeInArrayLabel = _.indexOf(arrayLabel, arrayWithParentNode[0]);
                    //Array mit allen Elternelementen erstellen
                     onlyParentNodes.push(arrayWithParentNode[0]);
                     parentNodeInXMLNotation.push("<"+arrayLabel[indexOfThisparentNodeInArrayLabel-1]+"")
                     var attributesFromSpecificNode = save.allAttributes[0][indexOfThisparentNodeInArrayLabel-1];
                    for(var z=0; z<attributesFromSpecificNode.length; z++){
                        parentNodeInXMLNotation.push(" "+attributesFromSpecificNode[z][0]+"=\""+attributesFromSpecificNode[z][1]+"\"");
                    }
                    parentNodeInXMLNotation.push(this.positions(arrayWithParentNode[0])+">\r\n");
                    readyForOutput.push(parentNodeInXMLNotation.join(""));
                    readyForOutput.push("</"+arrayLabel[indexOfThisparentNodeInArrayLabel-1]+">\r\n");
                    readyForOutput.push(arrayLabel[indexOfThisparentNodeInArrayLabel]);
                  }
                };

               
                  
                //2) Richtiges Verknüpfen der Elternelemente
                for(var h=1; h<onlyParentNodes.length; h++){
                  //Ermitteln, wann ein Elternelement selbst ein Kindelement ist. In dem Fall befindet es sich an zweiter Stelle im Array [? wird gesucht ?, Elternelement]
                var arrayWithParentNodeAsChildNode = _.findWhere(arrayEdges, [, onlyParentNodes[h]]);
                  if(arrayWithParentNodeAsChildNode != undefined){
                    console.log(arrayWithParentNodeAsChildNode);
                    //Prüfen ob aktueller SourceNode schoneinmal TargetNode gewesen ist
                    arrayEdgesTemporary.push(arrayWithParentNodeAsChildNode);
                  };
                };
              console.log(arrayEdgesTemporary)

                //Indizes prüfen - Elternelement darf kein Kindelement bekommen, bevor es selbst verschoben wurde
                for(var b=1; b<onlyParentNodes.length; b++){
                  var arrayFindAllSourceNodes = _.findWhere(arrayEdgesTemporary, [, onlyParentNodes[b]]);
                  var arrayFindAllChildNodes = _.findWhere(arrayEdgesTemporary, [onlyParentNodes[b], ]);
                  if(arrayFindAllSourceNodes != undefined){
                    var indexOfSourceNodes = _.indexOf(arrayEdgesTemporary, arrayFindAllSourceNodes);
                    var indexOfChildNodes = _.indexOf(arrayEdgesTemporary, arrayFindAllChildNodes);
                  }
                  console.log(indexOfSourceNodes, indexOfChildNodes);
                  if(indexOfChildNodes != -1 && indexOfChildNodes < indexOfSourceNodes){
                    console.log(true);
                    var cacheSourceNode = arrayEdgesTemporary[indexOfSourceNodes];
                    var cacheChildNode = arrayEdgesTemporary[indexOfChildNodes];
                    arrayEdgesTemporary.splice(indexOfSourceNodes, 1, cacheChildNode);
                    arrayEdgesTemporary.splice(indexOfChildNodes, 1, cacheSourceNode);
                    //Vorgang von vorne starten bis indexOfSourceNodes nicht mehr größer ist
                    b=1;
                  }
                }
                
                  console.log(arrayEdgesTemporary);
                  //Elternelemente an richtige Stelle schieben
                for(var hh=0; hh<arrayEdgesTemporary.length; hh++){
                    //Index für das Elternelement wird ermittelt für den Fall, dass es selbst ein Kindelement ist
                    var indexOfParentNodeAsChild = _.indexOf(readyForOutput, arrayEdgesTemporary[hh][1]);
                    var parentNodeID = readyForOutput[indexOfParentNodeAsChild];//node.id
                    var parentNodeLabelAndAttributes = readyForOutput[indexOfParentNodeAsChild-2];//label+attribute
                    var endTag = readyForOutput[indexOfParentNodeAsChild-1];//close-tag
                    //alte Werte rauslöschen
                    readyForOutput.splice(indexOfParentNodeAsChild-2, 3);
                  //  Index für das Elternelement wird ermittelt für den Fall, dass es jetzt selbst Elternelement ist
                    var indexOfParentNodeAsSource = _.indexOf(readyForOutput, arrayEdgesTemporary[hh][0]);
                  //  console.log(indexOfParentNodeAsSource)
                    readyForOutput.splice(indexOfParentNodeAsSource-1, 0, parentNodeLabelAndAttributes, endTag, parentNodeID);
                  };
                
                  console.log(readyForOutput)

                //3) alle Kindelemente für Elternelemente aus Schritt 1 finden
                for(var k=0; k<onlyParentNodes.length; k++){
                  for(var j=0; j<=arrayEdges.length; j++){
                    var indexOfParentAndChild = _.findWhere(arrayEdges, [onlyParentNodes[k], j]);
                    if(indexOfParentAndChild != undefined){
                      temp.push(j);
                    }
                  }
                  
                };//console.log(temp);


                //4) Duplikate rausfiltern, damit Elternelemente nicht zweimal eingehangen werden
                var onlyChild = _.difference(temp, onlyParentNodes);

               //5) alle Kindelemente mit Attributen füllen und an Elternelemente anknüpfen
                for(var t=0; t<onlyChild.length; t++){
                    var childNodesInXMLNotation = [];
                    for(var y=0; y<arrayEdges.length; y++){
                      //Elternelement zu Child finden
                      var arrayParentNodes = _.findWhere(arrayEdges, [, onlyChild[t]]);
                    }
                    //Wo in arrayLabel befindet sich das Childelement?
                    var indexOfChildInArrayLabel = _.indexOf(arrayLabel, onlyChild[t]);
                    childNodesInXMLNotation.push("  <"+arrayLabel[indexOfChildInArrayLabel-1]+"")
                    var attributesFromSpecificNode = save.allAttributes[0][indexOfChildInArrayLabel-1];
                    for(var z=0; z<attributesFromSpecificNode.length; z++){
                        childNodesInXMLNotation.push(" "+attributesFromSpecificNode[z][0]+"=\""+attributesFromSpecificNode[z][1]+"\"")
                    }
                    childNodesInXMLNotation.push(this.positions(arrayParentNodes[1])+" />\r\n");
                    //readyForOutput.push(arrayLabel[indexOfChildInArrayLabel]);
                    var indexOfParentNode = _.indexOf(readyForOutput, arrayParentNodes[0]);
                    readyForOutput.splice(indexOfParentNode-1, 0, childNodesInXMLNotation.join(""));
                   
                  }; 

                 //6) Hilfsindizes wieder rauslöschen 
                 for(var d=0; d<onlyParentNodes.length; d++){
                      var index5 = _.indexOf(readyForOutput, onlyParentNodes[d]);
                      readyForOutput.splice(index5, 1);
                  };
       
                //7) output an Blob übergeben
                var out = readyForOutput.join(""); 
                var blob = new Blob([out], {type:"application/xml"});

                 var downloadLink = document.createElement("a");
                 downloadLink.download = "test";
                 downloadLink.innerHTML = "Download File";
                 if (window.webkitURL != null)
                  {
                    // Chrome allows the link to be clicked
                    // without actually adding it to the DOM.
                    downloadLink.href = window.webkitURL.createObjectURL(blob);
                  }
                  else
                  {
                    // Firefox requires the link to be added to the DOM
                    // before it can be clicked.
                    downloadLink.href = window.URL.createObjectURL(blob);
                    downloadLink.onclick = destroyClickedElement;
                    downloadLink.style.display = "none";
                    document.body.appendChild(downloadLink);
                  }

                  if(downloadLink == undefined){
                    alert("Fehler gefunden")
                  }
                  
                  console.log(this.ajax_2(downloadLink));
                  downloadLink.click();
  },     
                  
};

