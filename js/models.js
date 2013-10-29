App.Car = Backbone.Model.extend();


App.Collection = Backbone.Collection.extend({

  escapeChars: /(\+|\-|\!|\(|\)|\{|\}|\[|\]|\^|\"|\~|\*|\?|\:|\\)/g,

  urlTemplate: {},

  urlParams: {},

  url: function() {
    for (param in this.urlParams) {
      if (typeof(this.urlParams[param]) == 'string') {
        this.urlParams[param] = this.urlParams[param].replace(this.escapeChars, '\\$&');
      }
    }
    return App.apiHost + this.urlTemplate(this.urlParams);
  },

  parse: function(response, options) {
    return response.results;
  }
});


App.MakesCollection = App.Collection.extend({

  urlTemplate: Handlebars.compile('/api/1/autocomplete/manufacturer?fq=year:{{year}}'),

});


App.ModelsCollection = App.Collection.extend({

  urlTemplate: Handlebars.compile('/api/1/autocomplete/model?fq=year:{{year}}&fq=manufacturer:{{make}}'),

});


App.SearchResultsCollection = App.Collection.extend({

  model: App.Car,

  urlTemplate: Handlebars.compile('/api/1/search?q=*:*&fq=year:{{year}}&fq=manufacturer:{{make}}&fq=model:{{model}}&rows={{limit}}')

});

App.CompareCollection = Backbone.Collection.extend({

  model: App.Car

});
