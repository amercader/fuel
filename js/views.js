App.YearsSelectView = Backbone.View.extend({

  className: 'col-md-2',

  initialize: function() {
    var start = 2000;
    var end = 2013;

    this.template = '<div class="select year"></div>',
    this.collection = new Backbone.Collection(
      _.map(_.range(start, end + 1), function(year) {
        return {id: year, text: year.toString()};
      })
    );
  },

  events: {
    'change .year': function(event) {
      App.pubSub.trigger('year:change', event.added);
    }
  },

  render: function() {
    this.$el.html(this.template)
      .find('.select').select2({
        placeholder: 'Year',
        data: this.collection.toJSON()
      });
    return this;
  }

});


App.MakesSelectView = Backbone.View.extend({

  className: 'col-md-2',

  initialize: function() {

    var _this = this;

    this.template = '<div class="select make"></div>',
    this.collection = new App.MakesCollection([]);

    this.collection.on('reset', function() {
      _this.render();
    });

    App.pubSub.on('year:change', function(year) {
      _this.collection.urlParams = {year: year.id};
      _this.collection.fetch({reset: true});
    });
  },

  events: {
    'change .make': function(event) {
      App.pubSub.trigger('make:change', event.added);
    }
  },

  render: function() {
    this.$el.html(this.template)
      .find('.select').select2({
        placeholder: (this.collection.length) ? 'Select a Make' : 'Select a Year first',
        data: this.collection.map(function(model) {
          return {id: model.get('value'),
                  text: model.get('value') + ' (' + model.get('count') + ')'}
        })
      });
    return this;
  }

});


App.ModelsSelectView = Backbone.View.extend({

  className: 'col-md-2',

  year: false,

  make: false,

  initialize: function() {

    var _this = this;

    this.template = '<div class="select model"></div>',
    this.collection = new App.ModelsCollection([]);

    this.collection.on('reset', function() {
      _this.render();
    });

    App.pubSub.on('year:change', function(year) {
      _this.year = year.id;
      _this.collection.reset();
      _this.render();
    });

    App.pubSub.on('make:change', function(make) {
      _this.make = make.id;
      _this.collection.urlParams = {year: _this.year, make: _this.make};
      _this.collection.fetch({reset: true});
    });

  },

  events: {
    'change .model': function(event) {
      App.pubSub.trigger('model:change', event.added);
    }
  },

  render: function() {
    this.$el.html(this.template)
      .find('.select').select2({
        placeholder: (this.collection.length) ? 'Select a Model' : 'Select a Make first',
        data: this.collection.map(function(model) {
          return {id: model.get('value'),
                  text: model.get('value') + ' (' + model.get('count') + ')'}
        })
      });
    return this;
  }

});


App.SearchResultsView = Backbone.View.extend({

  limit: 1000,

  year: false,

  make: false,

  initialize: function() {

    var _this = this;

    this.itemTemplate = Handlebars.compile($('#results-item-template').html()),
    this.collection = new App.SearchResultsCollection([]);

    this.collection.on('reset', function() {
      _this.render();
    });

    App.pubSub.on('year:change', function(year) {
      _this.year = year.id;
      _this.collection.reset();
      _this.render();
    });

    App.pubSub.on('make:change', function(make) {
      _this.make = make.id;
      _this.collection.reset();
      _this.render();
    });

    App.pubSub.on('model:change', function(model) {
      _this.collection.urlParams = {
        year: _this.year,
        make: _this.make,
        model: model.id,
        limit: _this.limit
      };
      _this.collection.fetch({reset: true});
    });

  },

  events: {
    'change .make': function(event) {
      App.pubSub.trigger('model:change', event.added);
    }
  },

  render: function() {
    var _this = this;

    this.$el.empty();

    this.collection.each(function(car) {
      var item = $(_this.itemTemplate(car.toJSON()))
                 .on('click', function() {
                   App.pubSub.trigger('result:select', car);
                  });
      _this.$el.append(item);
    });
    return this;
  }

});


App.CompareView = Backbone.View.extend({

  initialize: function() {

    var _this = this;

    this.itemTemplate = Handlebars.compile($('#compare-item-template').html()),
    this.collection = new App.CompareCollection([]);

    this.collection
      .on('reset', function() {
        _this.render();
      })
      .on('add', function(car) {
        _this.addItem(car);
      })

    App.pubSub.on('result:select', function(car) {
      _this.collection.add(car);
    });

  },

  events: {
    'change .make': function(event) {
      App.pubSub.trigger('model:change', event.added);
    }
  },

  render: function() {
    this.collection.each(this.addItem);
    return this;
  },

  addItem: function(car) {
    var item = this.itemTemplate(car.toJSON())
    this.$el.append(item);
    return this;
  } 

});
