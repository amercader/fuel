var App = {
  pubSub: _.clone(Backbone.Events),
    apiHost: 'http://demo.ckan.org',
    ckanResourceId: 'ad332faf-26ee-4b58-b76c-cecfe72a9ae4'
}


$(document).ready(function() {

  App.searchView = new App.SearchView();
  App.searchView.render();

  App.compareView = new App.CompareView();
  App.compareView.render();

});
