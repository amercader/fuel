var App = {
  pubSub: _.clone(Backbone.Events),
  apiHost: 'http://localhost:3000'
}


$(document).ready(function() {

  App.searchView = new App.SearchView();
  $('.search').html(App.searchView.render().el);

  App.compareView = new App.CompareView();
  $('.compare').append(App.compareView.render().el);

});
