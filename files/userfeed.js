/**
 * Javascript for userfeed.html
 * Author: Matthew Zinke
 * requires nothing
 *
 */


function getPosts(user){
  var request = new XMLHttpRequest();
  request.open('GET', 'api/posts?user=' + user, false);
  request.send(null);
  
  if(request.status == 200){
    var posts = JSON.parse(request.responseText);

    var feed = document.getElementById('userfeed');    
    for(var i = 0; i < posts.length; i++ ){
      
      var node = document.createElement('div');
      node.className = 'post';
      if(i%2 == 0){
        node.className = 'odd_post';
      }
      
      var poster = document.createElement('div');
      poster.className = 'poster';
      poster.innerHTML = posts[i].owner;
      
      var content = document.createElement('div');
      content.className = 'content';
      content.innerHTML = posts[i].content;
      
      var phash = document.createElement('span');
      phash.className = 'phash';
      phash.innerHTML = '<a href="/'+posts[i].geohash+'">goto</a>';
      
      var time = document.createElement('span');
      time.className = 'timestamp';
      time.innerHTML = posts[i].time;


      node.appendChild(poster);
      node.appendChild(content);
      node.appendChild(phash);
      node.appendChild(time);

      feed.insertBefore(node, feed.firstChild);
    }
  }
}

function initialize(){
  
  var thisuser = location.pathname.slice(3);

  getPosts(thisuser);

}