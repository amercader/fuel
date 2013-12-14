App.SelectView = Backbone.View.extend({

  className: 'select-row form-group',

  selectTemplate: Handlebars.compile($('#select-template').html())

});

App.YearsSelectView = App.SelectView.extend({

  initialize: function() {
    var start = 2000;
    var end = 2013;

    this.template = this.selectTemplate({value: 'year', label: 'Year'});

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
        placeholder: 'Select a Year',
        data: this.collection.toJSON()
      });
    return this;
  }

});


App.MakesSelectView = App.SelectView.extend({

  initialize: function() {

    var _this = this;

    this.template = this.selectTemplate({value: 'make', label: 'Make'});
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


App.ModelsSelectView = App.SelectView.extend({

  year: false,

  make: false,

  initialize: function() {

    var _this = this;

    this.template = this.selectTemplate({value: 'model', label: 'Model'});
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

  el: '.results',

  limit: 1000,

  year: false,

  make: false,

  model: false,

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
      _this.model = model.id;
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

    if (this.collection.length) {
      this.$el.find('.helper').show();
      this.$el.find('.current').html(this.year + ' ' + this.make + ' ' + this.model);
    } else {
      this.$el.find('.helper').hide();
      this.$el.find('.current').empty();
    }

    var listing = this.$el.find('.listing').empty();

    this.collection.each(function(car) {
      var item = $(_this.itemTemplate(car.toJSON()))
                 .on('click', function() {
                   App.pubSub.trigger('result:select', car);
                  });
      listing.append(item);
    });
    return this;
  }

});


App.SearchView = Backbone.View.extend({

  el: '.search',

  initialize: function() {

    this.selectViews = [
      new App.YearsSelectView(),
      new App.MakesSelectView(),
      new App.ModelsSelectView()
    ];

    this.searchResultsView = new App.SearchResultsView();
  },

  render: function() {

    var selects = this.$el.find('.selects').empty();
    var listing = this.$el.find('.listing').empty();

    _.each(this.selectViews, function(view) {
      selects.append(view.render().el);
    });

    return this;
  }
});


App.CompareView = Backbone.View.extend({

  el: '.compare',

  initialize: function() {

    var _this = this;

    this.itemTemplate = Handlebars.compile($('#compare-item-template').html()),
    this.collection = new App.CompareCollection([]);


    this.itemsEl = this.$el.find('.items');
    this.noItemsEl = this.$el.find('.no-items');

    this.collection
      .on('sort', function() {
        _this.render();
      })
      .on('reset', function() {
        _this.render();
        _this.noItemsEl.show();
      })
      .on('add', function(car) {
        _this.addItem(car);
      })
      .on('remove', function(car) {
        if (!_this.collection.length) {
          _this.noItemsEl.show();
        }
      });

    App.pubSub.on('result:select', function(car) {
      _this.collection.add(car);
    });

    this.sortMappings = {
      car: 'year',
      combined: 'combined_metric',
      co2: 'co2'
    }

    this.$el.find('.header').children('div').click(function(){
      var dir;
      var $i = $(this).find('i');
      var currentAsc = $i.hasClass('fa-sort-asc');
      var currentDesc = $i.hasClass('fa-sort-desc');

      if (currentDesc || (!currentAsc && !currentDesc)) {
        dir = 'asc';
        $i.addClass('fa-sort-asc').removeClass('fa-sort-desc');
      } else {
        dir = 'desc';
        $i.addClass('fa-sort-desc').removeClass('fa-sort-asc');
      }

      $(this).siblings().find('i').removeClass('fa-sort-desc').removeClass('fa-sort-asc');
      _this.sortBy(this.className.split(' ')[0], dir);
    });

  },

  events: {
    'change .make': function(event) {
      App.pubSub.trigger('model:change', event.added);
    }
  },

  render: function() {
    var _this = this;

    if (!this.collection.length) return this;

    this.itemsEl.empty();

    this.collection.each(function(car) {
      _this.addItem(car);
    });
    return this;
  },

  addItem: function(car) {

    var _this = this;

    if (this.noItemsEl.is(':visible')) {
      this.noItemsEl.hide();
    }

    var item = $(this.itemTemplate(car.toJSON()));

    item.find('.remove').click(function(){
      item.remove();
      _this.collection.remove(car);
    });

    item.hover(function() {
      $(this).find('.remove').toggle();
    });

    this.itemsEl.append(item);
    return this;
  },

  sortBy: function(field, dir) {
    var _this = this;
    dir = dir || 'asc';
    var dirModifier = (dir == 'asc') ? 1 : -1;
    this.collection.comparator = function(model) {
      return dirModifier * model.get(_this.sortMappings[field]);
    }
    this.collection.sort();
  }

});
