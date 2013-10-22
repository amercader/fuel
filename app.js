var App = {
  pubSub: _.clone(Backbone.Events),
  apiHost: 'http://localhost:3000'
}


$(document).ready(function() {

  App.yearsSelectView = new App.YearsSelectView();
  App.makesSelectView = new App.MakesSelectView();
  App.modelsSelectView = new App.ModelsSelectView();
  $('.selects').append([
    App.yearsSelectView.render().el,
    App.makesSelectView.render().el,
    App.modelsSelectView.render().el
  ]);

  App.searchResultsView = new App.SearchResultsView();
  $('.results').append(App.searchResultsView.render().el);

  App.compareView = new App.CompareView();
  $('.compare').append(App.compareView.render().el);

});
