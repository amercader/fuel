var App = {
  pubSub: _.clone(Backbone.Events),
  apiHost: 'http://localhost:3000'
}


$(document).ready(function() {

  App.searchView = new App.SearchView();
  App.searchView.render();

  App.compareView = new App.CompareView();
  App.compareView.render();

});
