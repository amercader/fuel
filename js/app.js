var App = {
  pubSub: _.clone(Backbone.Events),
    apiHost: 'http://localhost:5000',
    ckanResourceId: '84433fed-ee6d-4d8e-9889-ae5fb9276f85'
}


$(document).ready(function() {

  App.searchView = new App.SearchView();
  App.searchView.render();

  App.compareView = new App.CompareView();
  App.compareView.render();

});
