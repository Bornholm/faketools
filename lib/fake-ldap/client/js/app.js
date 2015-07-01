$(function() {

  var $ldapTree = $('#ldap-tree');

  fetchLDAPTree(function(data) {
    addNode($ldapTree, 'root', data);
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

});
