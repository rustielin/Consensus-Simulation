var cy = cytoscape({
  container: document.getElementById('cy'),

  boxSelectionEnabled: false,
  autounselectify: true,

  style: cytoscape.stylesheet()
    .selector('node')
      .style({
        'content': 'data(id)'
      })
    .selector('edge')
      .style({
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'width': 4,
        'line-color': '#ddd',
        'target-arrow-color': '#ddd'
      })
    .selector('.highlighted')
      .style({
        'background-color': '#61bffc',
        'line-color': '#61bffc',
        'target-arrow-color': '#61bffc',
        'transition-property': 'background-color, line-color, target-arrow-color',
        'transition-duration': '0.5s'
      }),

  elements: {
      nodes: [
        { data: { id: 'a' } },
        { data: { id: 'b' } },
        { data: { id: 'c' } },
        { data: { id: 'd' } },
        { data: { id: 'e' } }
      ],

      edges: [
        { data: { id: 'a"e', weight: 1, source: 'a', target: 'e' } },
        { data: { id: 'ab', weight: 3, source: 'a', target: 'b' } },
        { data: { id: 'be', weight: 4, source: 'b', target: 'e' } },
        { data: { id: 'bc', weight: 5, source: 'b', target: 'c' } },
        { data: { id: 'ce', weight: 6, source: 'c', target: 'e' } },
        { data: { id: 'cd', weight: 2, source: 'c', target: 'd' } },
        { data: { id: 'de', weight: 7, source: 'd', target: 'e' } }
      ]
    },

  layout: {
    name: 'cola',
    directed: true,
    roots: '#a',
    padding: 10
  }
});

// var bfs = cy.elements().bfs('#a', function(){}, true);

// var i = 0;
// var highlightNextEle = function(){
//   if( i < bfs.path.length ){
//     bfs.path[i].addClass('highlighted');

//     i++;
//     setTimeout(highlightNextEle, 1000);
//   }
// };

// kick off first highlight
// highlightNextEle();

/****************************MAIN********************************/

// TODO: network graph actually, or updates to it
var updateGraph = (peers) => {

  console.log("UPDATING GRAPH")

  // can only figure out layout once all graph loaded
  for (i = 0; i < peers.length; i++) {
    try {
      cy.add({
        group: 'nodes', 
        data: {
          id: peers[i],
          name: peers[i]
        }
      });
    } catch (err) {
      console.log("update graph err: ", err)
    }
    for (j = 0; j < peers.length; j++) {
      try {
        cy.add({
          group: 'edges', 
          data: {
            source: peers[j],
            target: peers[i]
          }
        });
      } catch (err) {
        console.log("update graph err: ", err)
      }
    }
  }
  return new Promise(function (resolve) {
      var layout = cy.layout({ 
          name: 'cola',
          roots: '#a',
          padding: 150
      });
      layout.run(); 
      resolve();
  })
}



