var cy = cytoscape({
  container: document.getElementById('cy'),

  boxSelectionEnabled: false,
  autounselectify: true,

  style: [
    {
      selector: 'node',
      css: {
        'content': 'data(id)',
        'background-color': '#f92411'
      }
    },
    {
      selector: 'node:parent',
      css: {
        'background-opacity': 0.33
      }
    },
    {
      selector: 'edge',
      css: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'width': 4,
        'line-color': '#ddd',
        'target-arrow-color': '#ddd'
      }
    }
  ],

  layout: {
    name: 'cola',
    directed: true,
    roots: '#a',
    padding: 10
  }, 
  
});

/****************************MAIN********************************/

// adds edge between node IDs if it doesn't exist already
var addEdge = (src, dst) => {
  if (src == null || dst == null || src == dst) {
      return;
  }
  var selector = "[source=\'" + src + "\'][target=\'" + dst +"\']" ;
  if (cy.edges(selector).length == 0) {
    cy.add({
      group: 'edges',
      data: {source: src, target: dst}
    });
  }
}

// adds node by ID if it doesn't exist already
var addNode = (id, parent) => {
  if (id == null) {
    return;
  }
  var selector = "[id=\'" + id + "\']";
  if (cy.nodes(selector).length == 0) {
    cy.add({
      group: 'nodes', 
      data: {id: id, name: id, parent: parent}
    });
  }
}

// TODO: network graph actually, or updates to it
var updateGraph = (peers) => {

  console.log("UPDATING GRAPH")

  // can only figure out layout once all graph loaded
  for (i = 0; i < peers.length; i++) {
    if (i < 10) {
      addNode(peers[i], null);
    } else {
      addNode(peers[i], peers[Math.floor(i / 10)]);
    }
  }

  // probably not do this; expensive 
  for (i = 0; i < peers.length; i++) {
    for (j = 0; j < peers.length; j++) {
      // if (Math.random() < 0.01) {
        addEdge(peers[i], peers[j])
        console.log("ADDED EDGE")
      // }
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



