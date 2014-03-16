App.Car = Backbone.Model.extend();


App.Collection = Backbone.Collection.extend({

  escapeChars: /(\+|\-|\!|\(|\)|\{|\}|\[|\]|\^|\"|\~|\*|\?|\:|\\)/g,

  urlTemplate: {},

  urlParams: {},

  url: function() {
    for (param in this.urlParams) {
      if (typeof(this.urlParams[param]) == 'string') {
        this.urlParams[param] = escape(this.urlParams[param].replace(this.escapeChars, '\\$&'));
      }
    }

    this.urlParams.resId = App.ckanResourceId;
    return App.apiHost + this.urlTemplate(this.urlParams);
  },

  parse: function(response, options) {
    return response.result.records;
  }
});


App.MakesCollection = App.Collection.extend({

  urlTemplate: Handlebars.compile('/api/action/datastore_search_sql?sql=' +
    'SELECT DISTINCT(manufacturer) AS value, COUNT(manufacturer) AS count ' +
    'FROM "{{ resId }}" ' +
    'WHERE year = {{ year }} ' +
    'GROUP BY manufacturer ' +
    'ORDER BY manufacturer '
  )

});


App.ModelsCollection = App.Collection.extend({

  urlTemplate: Handlebars.compile('/api/action/datastore_search_sql?sql=' +
    'SELECT DISTINCT(model) AS value, COUNT(model) AS count ' +
    'FROM "{{ resId }}" ' +
    'WHERE year = {{ year }} AND ' +
    'manufacturer = \'{{ make }}\' ' +
    'GROUP BY model ' +
    'ORDER BY model'
  )

});


App.SearchResultsCollection = App.Collection.extend({

  model: App.Car,

  urlTemplate: Handlebars.compile('/api/action/datastore_search?resource_id=' + App.ckanResourceId +
    '&filters={"year":{{year}},"manufacturer":"{{make}}","model":"{{model}}"}' +
    '&limit={{limit}}'
  )
});

App.CompareCollection = Backbone.Collection.extend({

  model: App.Car

});
