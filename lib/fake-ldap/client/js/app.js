$(function() {

  var $ldapTree = $('#ldap-tree');
  var treeData = null;

  fetchLDAPTree(function(data) {
    treeData = data;
    addNode($ldapTree, 'root', data);
  });

  $(window).on('hashchange', function(evt) {
    if(treeData) {
      var hash = window.location.hash;
      if(hash) {
        var path = hash.slice(1).split(',').reverse();
        var data = findProp(treeData, path);
        if(data && 'dn' in data) {
          $('#node-data').text(JSON.stringify(data, null, 2));
        } else {
          $('#node-data').text('No data?.');
        }
      }
    }
  });

  function fetchLDAPTree(cb) {
    $.getJSON('/api/ldap', cb);
  }

  function addNode($parent, nodeName, nodeData) {

    var $node = $('<li></li>');

    if( nodeData.hasOwnProperty('dn') ) {
      $node.addClass('leaf');
      $node.html('<a href="#'+nodeData.dn+'">'+nodeName+'</a>');
    } else {
      $node.addClass('branch');
      var $newParent = $('<ol></ol>');
      $node.append('<label for="'+nodeName+'">'+nodeName+'</label>');
      $node.append('<input id="'+nodeName+'" type="checkbox" />');
      $node.append($newParent);
      Object.keys(nodeData)
        .forEach(function(nodeName) {
          addNode($newParent, nodeName, nodeData[nodeName]);
        })
      ;
    }

    $parent.append($node);

  }

  function findProp(data, path) {
    var key = path.shift();
    if(key in data) {
      if(path.length === 0) {
        return data[key];
      } else {
        return findProp(data[key], path);
      }
    } else {
      return undefined;
    }
  }

});
